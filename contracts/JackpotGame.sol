// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title JackpotGame
 * @dev Million Dollar Milestone Jackpot Game for 0G Labs
 * @notice Players add crypto to push the pot to the next million-dollar milestone
 */
interface IPriceOracle {
    /**
     * @notice Get the current price of native token in USD (6 decimals)
     * @return price Price in USD with 6 decimals
     * @return timestamp Unix timestamp of last update
     */
    function getPrice() external view returns (uint256 price, uint256 timestamp);
}

contract JackpotGame is ReentrancyGuard, Pausable, Ownable {
    // ============ Constants ============
    
    uint256 public constant MILESTONE_INCREMENT = 1_000_000 * 1e6; // $1M in 6 decimals
    uint256 public constant PRIZE_AMOUNT = 1_000_000 * 1e6; // $1M prize in 6 decimals
    uint256 public constant ORACLE_STALENESS_THRESHOLD = 5 minutes;
    uint256 public constant MIN_DEPOSIT = 0.001 ether;
    
    // ============ State Variables ============
    
    IPriceOracle public immutable oracle;
    
    uint256 public totalBalance;
    uint256 public currentMilestone;
    
    address public lastContributor;
    uint256 public lastContributionAmount;
    uint256 public lastContributionTime;
    
    address public latestWinner;
    uint256 public latestWinAmount;
    uint256 public latestWinMilestone;
    uint256 public latestWinTime;
    
    uint256 public contributorCount;
    
    // Mapping to track unique contributors
    mapping(address => bool) public hasContributed;
    mapping(address => uint256) public contributorDeposits;
    
    // Winner history
    struct Winner {
        address winner;
        uint256 prize;
        uint256 milestone;
        uint256 timestamp;
    }
    Winner[] public winnerHistory;
    
    // ============ Events ============
    
    event Deposit(
        address indexed user,
        uint256 amount,
        uint256 totalBalance,
        uint256 usdValue,
        uint256 milestone
    );
    
    event Winner(
        address indexed winner,
        uint256 prize,
        uint256 milestone,
        uint256 timestamp
    );
    
    event MilestoneUpdated(
        uint256 indexed milestone,
        uint256 targetUsd
    );
    
    event EmergencyWithdraw(
        address indexed owner,
        uint256 amount
    );
    
    // ============ Errors ============
    
    error InvalidOracle();
    error StaleOraclePrice();
    error InsufficientDeposit();
    error TransferFailed();
    error NoFundsToWithdraw();
    
    // ============ Modifiers ============
    
    modifier validOracle() {
        (, uint256 timestamp) = oracle.getPrice();
        if (block.timestamp - timestamp > ORACLE_STALENESS_THRESHOLD) {
            revert StaleOraclePrice();
        }
        _;
    }
    
    // ============ Constructor ============
    
    constructor(address _oracle) Ownable(msg.sender) {
        if (_oracle == address(0)) revert InvalidOracle();
        oracle = IPriceOracle(_oracle);
        currentMilestone = 1;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get the current USD value of the pot
     * @return usdValue Current value in USD (6 decimals)
     */
    function currentUsdValue() public view validOracle returns (uint256 usdValue) {
        (uint256 price, ) = oracle.getPrice();
        // totalBalance is in wei (18 decimals)
        // price is in USD with 6 decimals
        // usdValue = totalBalance * price / 1e18 (to cancel wei) = USD with 6 decimals
        usdValue = (totalBalance * price) / 1e18;
    }
    
    /**
     * @notice Get the next milestone target in USD
     * @return target Target USD value (6 decimals)
     */
    function nextMilestoneTarget() public view returns (uint256 target) {
        target = currentMilestone * MILESTONE_INCREMENT;
    }
    
    /**
     * @notice Get the distance to the next milestone
     * @return distance USD amount needed to reach milestone (6 decimals)
     */
    function distanceToMilestone() public view validOracle returns (uint256 distance) {
        uint256 usdValue = currentUsdValue();
        uint256 target = nextMilestoneTarget();
        if (usdValue >= target) {
            distance = 0;
        } else {
            distance = target - usdValue;
        }
    }
    
    /**
     * @notice Get winner history with pagination
     * @param start Start index
     * @param limit Number of winners to return
     * @return winners Array of Winner structs
     */
    function getWinnerHistory(
        uint256 start,
        uint256 limit
    ) external view returns (Winner[] memory winners) {
        uint256 length = winnerHistory.length;
        if (start >= length) {
            return new Winner[](0);
        }
        
        uint256 end = start + limit;
        if (end > length) {
            end = length;
        }
        
        uint256 resultLength = end - start;
        winners = new Winner[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            winners[i] = winnerHistory[start + i];
        }
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Deposit native tokens into the jackpot
     * @dev Triggers winner check and payout if milestone is reached
     */
    function deposit() 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        validOracle 
    {
        if (msg.value < MIN_DEPOSIT) revert InsufficientDeposit();
        
        // Update contributor tracking
        if (!hasContributed[msg.sender]) {
            hasContributed[msg.sender] = true;
            contributorCount++;
        }
        contributorDeposits[msg.sender] += msg.value;
        
        // Update last contributor info
        lastContributor = msg.sender;
        lastContributionAmount = msg.value;
        lastContributionTime = block.timestamp;
        
        // Update total balance
        totalBalance += msg.value;
        
        // Get current USD value
        uint256 usdValue = currentUsdValue();
        uint256 target = nextMilestoneTarget();
        
        // Check if milestone reached
        if (usdValue >= target) {
            _payoutWinner();
        }
        
        emit Deposit(
            msg.sender,
            msg.value,
            totalBalance,
            usdValue,
            currentMilestone
        );
    }
    
    /**
     * @notice Internal function to handle winner payout
     */
    function _payoutWinner() internal {
        // Calculate prize in native tokens
        (uint256 price, ) = oracle.getPrice();
        // PRIZE_AMOUNT is in USD (6 decimals)
        // prizeInWei = PRIZE_AMOUNT * 1e18 / price (to get wei amount)
        uint256 prizeInWei = (PRIZE_AMOUNT * 1e18) / price;
        
        // Ensure we have enough balance
        if (prizeInWei > totalBalance) {
            prizeInWei = totalBalance;
        }
        
        // Update state before transfer
        address winner = lastContributor;
        uint256 milestone = currentMilestone;
        uint256 timestamp = block.timestamp;
        
        totalBalance -= prizeInWei;
        currentMilestone++;
        
        // Record winner
        latestWinner = winner;
        latestWinAmount = PRIZE_AMOUNT;
        latestWinMilestone = milestone;
        latestWinTime = timestamp;
        
        winnerHistory.push(Winner({
            winner: winner,
            prize: PRIZE_AMOUNT,
            milestone: milestone,
            timestamp: timestamp
        }));
        
        // Transfer prize to winner
        (bool success, ) = payable(winner).call{value: prizeInWei}("");
        if (!success) revert TransferFailed();
        
        emit Winner(winner, PRIZE_AMOUNT, milestone, timestamp);
        emit MilestoneUpdated(currentMilestone, nextMilestoneTarget());
    }
    
    /**
     * @notice Check if current market conditions triggered a milestone
     * @dev Can be called by anyone to process a pending milestone
     */
    function checkMilestone() 
        external 
        nonReentrant 
        whenNotPaused 
        validOracle 
    {
        uint256 usdValue = currentUsdValue();
        uint256 target = nextMilestoneTarget();
        
        if (usdValue >= target && lastContributor != address(0)) {
            _payoutWinner();
        }
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Pause the contract (emergency only)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Withdraw excess funds that exceed game requirements
     * @dev Only withdraws funds above the prize reserve
     */
    function withdrawExcess() external onlyOwner {
        (uint256 price, ) = oracle.getPrice();
        uint256 prizeReserve = (PRIZE_AMOUNT * 1e18) / price;
        
        if (totalBalance <= prizeReserve) revert NoFundsToWithdraw();
        
        uint256 excess = totalBalance - prizeReserve;
        totalBalance = prizeReserve;
        
        (bool success, ) = payable(owner()).call{value: excess}("");
        if (!success) revert TransferFailed();
        
        emit EmergencyWithdraw(owner(), excess);
    }
    
    /**
     * @notice Rescue stuck tokens (not for game funds)
     * @dev Only for recovering tokens sent by mistake
     */
    function rescueTokens(address token, uint256 amount) external onlyOwner {
        // Implementation for ERC20 rescue if needed
        // Native token rescue should be via withdrawExcess
        (bool success, ) = payable(owner()).call{value: address(this).balance - totalBalance}("");
        if (!success) revert TransferFailed();
    }
    
    // ============ Receive Function ============
    
    /**
     * @notice Handle direct ETH transfers
     * @dev Redirects to deposit function
     */
    receive() external payable {
        if (msg.value >= MIN_DEPOSIT) {
            // Treat as deposit
            deposit();
        }
        // Otherwise, just accept (could be from prize payout)
    }
}
