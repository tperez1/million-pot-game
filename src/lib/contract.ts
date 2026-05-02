export const MILLION_POT_ABI = [
  // Events
  "event Deposit(address indexed user, uint256 amount, uint256 totalBalance, uint256 usdValue, uint256 milestone)",
  "event Winner(address indexed winner, uint256 prize, uint256 milestone, uint256 timestamp)",
  "event MilestoneUpdated(uint256 indexed milestone, uint256 targetUsd)",
  "event Paused(address account)",
  "event Unpaused(address account)",
  
  // Read functions
  "function totalBalance() view returns (uint256)",
  "function currentUsdValue() view returns (uint256)",
  "function currentMilestone() view returns (uint256)",
  "function nextMilestoneTarget() view returns (uint256)",
  "function distanceToMilestone() view returns (uint256)",
  "function lastContributor() view returns (address)",
  "function lastContributionAmount() view returns (uint256)",
  "function lastContributionTime() view returns (uint256)",
  "function latestWinner() view returns (address)",
  "function latestWinAmount() view returns (uint256)",
  "function latestWinMilestone() view returns (uint256)",
  "function getWinnerHistory(uint256 start, uint256 limit) view returns (tuple(address winner, uint256 prize, uint256 milestone, uint256 timestamp)[])",
  "function getContributorCount() view returns (uint256)",
  "function paused() view returns (bool)",
  "function owner() view returns (address)",
  
  // Write functions
  "function deposit() payable",
  "function pause()",
  "function unpause()",
  "function withdrawExcess()"
];

export const MILLION_POT_ADDRESS = {
  // 0G Testnet
  16602: '0x0000000000000000000000000000000000000000', // Deploy and replace
  // 0G Mainnet  
  16661: '0x0000000000000000000000000000000000000000'
};

export const RPC_URLS: Record<number, string> = {
  16602: 'https://evmrpc-testnet.0g.ai',
  16661: 'https://evmrpc.0g.ai'
};

export const CHAIN_CONFIG = {
  16602: {
    chainId: '0x40DA',
    chainName: '0G Testnet',
    nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
    rpcUrls: ['https://evmrpc-testnet.0g.ai'],
    blockExplorerUrls: ['https://chainscan-newton.0g.ai']
  },
  16661: {
    chainId: '0x4105',
    chainName: '0G Mainnet',
    nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
    rpcUrls: ['https://evmrpc.0g.ai'],
    blockExplorerUrls: ['https://chainscan.0g.ai']
  }
};
