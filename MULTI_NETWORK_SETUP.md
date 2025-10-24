# Multi-Network Setup Guide

This guide explains how to deploy and configure your Stake-to-Learn platform across multiple blockchain networks.

## Supported Networks

### Testnets
- **Ethereum Sepolia** (Chain ID: 11155111)
- **Base Sepolia** (Chain ID: 84532)
- **Arbitrum Sepolia** (Chain ID: 421614)
- **Worldchain Testnet** (Chain ID: 480)
- **Polygon Mumbai** (Chain ID: 80001)

### Mainnets
- **Ethereum Mainnet** (Chain ID: 1)
- **Base** (Chain ID: 8453)

## Environment Variables

Create a `.env` file in `packages/contracts/` with the following variables:

```bash
# Deployer Configuration
DEPLOYER_PRIVATE_KEY=0x...

# RPC URLs
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_RPC_URL=https://mainnet.base.org
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
WORLDCHAIN_RPC_URL=https://worldchain-testnet.g.alchemy.com/v2/YOUR_KEY
POLYGON_MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

# Block Explorer API Keys
ETHERSCAN_API_KEY=...
BASESCAN_API_KEY=...
ARBISCAN_API_KEY=...
POLYGONSCAN_API_KEY=...
```

## Deployment Commands

### Deploy to Specific Networks

```bash
# Ethereum Sepolia
npm run deploy:sepolia

# Base Sepolia
npm run deploy:base-sepolia

# Base Mainnet
npm run deploy:base

# Arbitrum Sepolia
npm run deploy:arbitrum-sepolia

# Worldchain Testnet
npm run deploy:worldchain

# Polygon Mumbai
npm run deploy:polygon-mumbai
```

### Verify Contracts

```bash
# Verify on specific networks
npm run verify:sepolia
npm run verify:base-sepolia
npm run verify:base
npm run verify:arbitrum-sepolia
npm run verify:worldchain
npm run verify:polygon-mumbai
```

## Frontend Configuration

After deployment, update your frontend environment variables in `apps/web/.env.local`:

```bash
# Network-specific contract addresses
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_SEPOLIA=0x...
NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_SEPOLIA=0x...
NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_SEPOLIA=0x...

NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_BASE_SEPOLIA=0x...
NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_BASE_SEPOLIA=0x...
NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_BASE_SEPOLIA=0x...

NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_BASE=0x...
NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_BASE=0x...
NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_BASE=0x...

# RPC URLs for frontend
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_WORLDCHAIN_RPC_URL=https://worldchain-testnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
```

## Network-Specific Considerations

### Gas Costs
- **Ethereum**: Highest gas costs, most secure
- **Base**: Low gas costs, Coinbase's L2
- **Arbitrum**: Low gas costs, fast transactions
- **Worldchain**: Optimized for AI/ML workloads
- **Polygon**: Very low gas costs, high throughput

### Native Currencies
- **Ethereum/Base/Arbitrum**: ETH
- **Worldchain**: WLD (Worldcoin)
- **Polygon**: MATIC

### Faucets for Testnets
- **Sepolia ETH**: https://sepoliafaucet.com
- **Base Sepolia ETH**: https://faucet.quicknode.com/base/sepolia
- **Arbitrum Sepolia ETH**: https://faucet.arbitrum.io/
- **Worldchain WLD**: https://worldchain-testnet.blockscout.com/faucet
- **Polygon Mumbai MATIC**: https://faucet.polygon.technology/

## Deployment Workflow

1. **Choose Target Networks**: Decide which networks to deploy to
2. **Set Environment Variables**: Configure RPC URLs and API keys
3. **Deploy Contracts**: Run deployment scripts for each network
4. **Verify Contracts**: Verify contracts on block explorers
5. **Update Frontend**: Configure frontend with contract addresses
6. **Test Integration**: Test the application on each network

## Network Selection Strategy

### For Development
- Start with **Sepolia** (Ethereum testnet)
- Add **Base Sepolia** for L2 testing
- Use **Arbitrum Sepolia** for low-cost testing

### For Production
- **Ethereum Mainnet** for maximum security
- **Base** for Coinbase ecosystem integration
- **Arbitrum** for cost-effective transactions

## Monitoring and Maintenance

- Monitor gas costs across networks
- Track contract interactions on block explorers
- Set up alerts for contract events
- Maintain separate deployment records for each network

## Troubleshooting

### Common Issues
1. **RPC Rate Limits**: Use multiple RPC providers
2. **Gas Estimation**: Test with small amounts first
3. **Network Congestion**: Choose optimal deployment times
4. **Contract Verification**: Ensure all dependencies are available

### Support Resources
- Network documentation and status pages
- Community Discord/Telegram channels
- Block explorer support
- RPC provider support
