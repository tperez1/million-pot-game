# 0G Jackpot Game - Deployment Guide

## Prerequisites

1. Node.js 18+ and npm
2. Foundry or Hardhat for contract deployment
3. MetaMask or Rabby wallet with 0G tokens

## Network Configuration

### 0G Testnet (Newton)
- Chain ID: 16602 (0x40DA)
- RPC URL: https://evmrpc-testnet.0g.ai
- Explorer: https://chainscan-newton.0g.ai
- Faucet: https://faucet.0g.ai

### 0G Mainnet
- Chain ID: 16661 (0x4105)
- RPC URL: https://evmrpc.0g.ai
- Explorer: https://chainscan.0g.ai

## Contract Deployment

### Using Foundry

```bash
# Install Foundry if not already installed
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install OpenZeppelin/openzeppelin-contracts

# Deploy to testnet
forge create contracts/JackpotGame.sol:JackpotGame \
  --rpc-url https://evmrpc-testnet.0g.ai \
  --private-key YOUR_PRIVATE_KEY \
  --constructor-args ORACLE_ADDRESS \
  --verify

# Deploy oracle first if needed
forge create contracts/oracle/PriceOracle.sol:SimplePriceOracle \
  --rpc-url https://evmrpc-testnet.0g.ai \
  --private-key YOUR_PRIVATE_KEY \
  --constructor-args 1050000 # $1.05 in 6 decimals
```

### Using Hardhat

```bash
# Create deployment script
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Create hardhat.config.js
```

```javascript
// hardhat.config.js
module.exports = {
  solidity: "0.8.20",
  networks: {
    "0g-testnet": {
      url: "https://evmrpc-testnet.0g.ai",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 16602
    },
    "0g-mainnet": {
      url: "https://evmrpc.0g.ai",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 16661
    }
  }
};
```

## Post-Deployment Steps

1. **Update Contract Address**
   - Copy deployed contract address
   - Update `JACKPOT_ADDRESS` in `src/lib/contract.ts`

2. **Verify Contract**
   ```bash
   # On 0G Chainscan
   # Go to contract tab → Verify and Publish
   # Enter source code and constructor arguments
   ```

3. **Initialize Oracle**
   - Set initial price if using SimplePriceOracle
   - Set up price update automation (Chainlink Automation, Gelato, etc.)

4. **Fund the Contract (Optional)**
   - Send initial 0G tokens to seed the pot
   - This creates initial excitement for early players

## Security Checklist

- [ ] Oracle address is valid and not stale
- [ ] Contract owner is a secure multisig or governance contract
- [ ] Pause function tested
- [ ] Withdraw function tested (only withdraws excess, not player funds)
- [ ] Reentrancy protection verified
- [ ] All events emitting correctly
- [ ] Frontend properly displays all values

## Production Considerations

### Oracle Setup
Use Chainlink or similar decentralized oracle:
```solidity
// Chainlink 0G/USD price feed address (example)
address CHAINLINK_ORACLE = 0x...;
```

### Automation
Set up automated price updates:
- Chainlink Automation
- Gelato Network
- Custom keeper bot

### Monitoring
- Monitor oracle freshness
- Alert on large deposits
- Track milestone progress

### Frontend
1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy to hosting (Vercel, Netlify, etc.)

3. Update environment variables:
   ```
   VITE_CONTRACT_ADDRESS=0x...
   VITE_ORACLE_ADDRESS=0x...
   VITE_CHAIN_ID=16602
   ```

## Testing

```bash
# Run contract tests
forge test

# Run with coverage
forge test --coverage

# Run frontend tests
npm test
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Wallet    │  │   Game UI   │  │   Transaction   │  │
│  │ Connection  │  │ Components  │  │    Handling     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ ethers.js
┌────────────────────────▼────────────────────────────────┐
│               Smart Contract (JackpotGame)               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Deposit   │  │   Winner    │  │     Oracle      │  │
│  │   Logic     │──│   Payout    │──│   Integration   │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              Price Oracle (Chainlink/Custom)             │
│                    Returns 0G/USD Price                  │
└─────────────────────────────────────────────────────────┘
```

## Support

For issues or questions:
- GitHub Issues: [repository-url]
- Discord: [discord-link]
- Twitter: [@0glabs]
