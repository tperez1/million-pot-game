// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title SimplePriceOracle
 * @dev A simple oracle for testing - should be replaced with Chainlink or similar in production
 * @notice In production, use a decentralized oracle network
 */
contract SimplePriceOracle is Ownable {
    uint256 private _price;
    uint256 private _timestamp;
    
    event PriceUpdated(uint256 price, uint256 timestamp);
    
    constructor(uint256 initialPrice) Ownable(msg.sender) {
        _price = initialPrice; // Price in USD with 6 decimals (e.g., $1.05 = 1050000)
        _timestamp = block.timestamp;
    }
    
    /**
     * @notice Get the current price
     * @return price Price in USD with 6 decimals
     * @return timestamp Unix timestamp of last update
     */
    function getPrice() external view returns (uint256 price, uint256 timestamp) {
        price = _price;
        timestamp = _timestamp;
    }
    
    /**
     * @notice Update the price (owner only)
     * @dev In production, this would be updated by an automated system
     * or replaced with a decentralized oracle
     */
    function updatePrice(uint256 newPrice) external onlyOwner {
        _price = newPrice;
        _timestamp = block.timestamp;
        emit PriceUpdated(newPrice, block.timestamp);
    }
}

/**
 * @title ChainlinkPriceOracle
 * @dev Interface for Chainlink price feeds
 * @notice Use this in production with actual Chainlink feeds
 */
interface ChainlinkAggregatorV3 {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
    
    function decimals() external view returns (uint8);
}

contract ChainlinkPriceOracle {
    ChainlinkAggregatorV3 internal priceFeed;
    
    constructor(address _priceFeed) {
        priceFeed = ChainlinkAggregatorV3(_priceFeed);
    }
    
    /**
     * @notice Get the current price from Chainlink
     * @return price Price in USD with 6 decimals
     * @return timestamp Unix timestamp of last update
     */
    function getPrice() external view returns (uint256 price, uint256 timestamp) {
        (
            ,
            int256 answer,
            ,
            uint256 updatedAt,
            
        ) = priceFeed.latestRoundData();
        
        uint8 decimals = priceFeed.decimals();
        
        // Convert to 6 decimals
        price = uint256(answer) * 1e6 / (10 ** decimals);
        timestamp = updatedAt;
    }
}
