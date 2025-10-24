# Extended Multi-Network Setup Guide

This guide covers deployment and configuration for all supported blockchain networks including Filecoin, EVM networks, Yellow, Arbitrum, Binance Smart Chain, and 0G.

## Complete Network List

### Ethereum Networks
- **Ethereum Sepolia** (Chain ID: 11155111) - Testnet
- **Ethereum Mainnet** (Chain ID: 1) - Mainnet

### Layer 2 Networks
- **Base Sepolia** (Chain ID: 84532) - Testnet
- **Base** (Chain ID: 8453) - Mainnet
- **Arbitrum Sepolia** (Chain ID: 421614) - Testnet
- **Arbitrum One** (Chain ID: 42161) - Mainnet

### Alternative L1 Networks
- **Binance Smart Chain** (Chain ID: 56) - Mainnet
- **BSC Testnet** (Chain ID: 97) - Testnet
- **Avalanche C-Chain** (Chain ID: 43114) - Mainnet
- **Avalanche Fuji** (Chain ID: 43113) - Testnet
- **Polygon Mumbai** (Chain ID: 80001) - Testnet

### Specialized Networks
- **Filecoin Mainnet** (Chain ID: 314) - Mainnet
- **Filecoin Calibration** (Chain ID: 314159) - Testnet
- **Worldchain Testnet** (Chain ID: 480) - Testnet
- **Yellow Network** (Chain ID: 23011913) - Mainnet
- **0G Network** (Chain ID: 2043) - Mainnet

## Environment Variables

Create a comprehensive `.env` file in `packages/contracts/`:

```bash
# Deployer Configuration
DEPLOYER_PRIVATE_KEY=0x...

# Ethereum Networks
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

# Layer 2 Networks
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_RPC_URL=https://mainnet.base.org
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc

# Alternative L1 Networks
BSC_RPC_URL=https://bsc-dataseed1.binance.org
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
POLYGON_MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY

# Specialized Networks
FILECOIN_RPC_URL=https://api.node.glif.io/rpc/v1
FILECOIN_CALIBRATION_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
WORLDCHAIN_RPC_URL=https://worldchain-testnet.g.alchemy.com/v2/YOUR_KEY
YELLOW_RPC_URL=https://rpc.yellow.org
ZERO_G_RPC_URL=https://rpc.0g.ai

# Block Explorer API Keys
ETHERSCAN_API_KEY=...
BASESCAN_API_KEY=...
ARBISCAN_API_KEY=...
BSCSCAN_API_KEY=...
POLYGONSCAN_API_KEY=...
SNOWTRACE_API_KEY=...
```

## Deployment Commands

### Ethereum Networks
```bash
npm run deploy:sepolia
npm run deploy:ethereum  # Mainnet
```

### Layer 2 Networks
```bash
npm run deploy:base-sepolia
npm run deploy:base
npm run deploy:arbitrum-sepolia
npm run deploy:arbitrum
```

### Alternative L1 Networks
```bash
npm run deploy:bsc
npm run deploy:bsc-testnet
npm run deploy:avalanche
npm run deploy:avalanche-fuji
npm run deploy:polygon-mumbai
```

### Specialized Networks
```bash
npm run deploy:filecoin
npm run deploy:filecoin-calibration
npm run deploy:worldchain
npm run deploy:yellow
npm run deploy:0g
```

## Network-Specific Considerations

### Gas Costs & Performance
- **Ethereum**: Highest security, highest gas costs
- **Base**: Low gas, Coinbase ecosystem integration
- **Arbitrum**: Low gas, fast finality
- **BSC**: Very low gas, high throughput
- **Avalanche**: Low gas, sub-second finality
- **Filecoin**: Storage-focused, unique consensus
- **Yellow**: AI/ML optimized
- **0G**: AI data infrastructure

### Native Currencies
- **ETH**: Ethereum, Base, Arbitrum
- **BNB**: Binance Smart Chain
- **AVAX**: Avalanche
- **MATIC**: Polygon
- **FIL**: Filecoin
- **WLD**: Worldchain
- **YELLOW**: Yellow Network
- **0G**: 0G Network

### Faucets & Test Tokens

#### Testnet Faucets
- **Sepolia ETH**: https://sepoliafaucet.com
- **Base Sepolia ETH**: https://faucet.quicknode.com/base/sepolia
- **Arbitrum Sepolia ETH**: https://faucet.arbitrum.io/
- **BSC Testnet tBNB**: https://testnet.binance.org/faucet-smart
- **Avalanche Fuji AVAX**: https://faucet.avax.network/
- **Polygon Mumbai MATIC**: https://faucet.polygon.technology/
- **Filecoin Calibration tFIL**: https://faucet.calibration.fildev.network/
- **Worldchain WLD**: https://worldchain-testnet.blockscout.com/faucet

#### Mainnet Considerations
- **Ethereum**: Requires real ETH for gas
- **Base**: Requires ETH (can bridge from Ethereum)
- **Arbitrum**: Requires ETH (can bridge from Ethereum)
- **BSC**: Requires BNB for gas
- **Avalanche**: Requires AVAX for gas
- **Filecoin**: Requires FIL for gas
- **Yellow**: Requires YELLOW tokens
- **0G**: Requires 0G tokens

## Frontend Configuration

Update `apps/web/.env.local` with network-specific contract addresses:

```bash
# Ethereum Networks
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_SEPOLIA=0x...
NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_SEPOLIA=0x...
NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_SEPOLIA=0x...

NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_ETHEREUM=0x...
NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_ETHEREUM=0x...
NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_ETHEREUM=0x...

# Layer 2 Networks
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_BASE_SEPOLIA=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_BASE=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_ARBITRUM_SEPOLIA=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_ARBITRUM=0x...

# Alternative L1 Networks
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_BSC=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_BSC_TESTNET=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_AVALANCHE=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_AVALANCHE_FUJI=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_POLYGON_MUMBAI=0x...

# Specialized Networks
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_FILECOIN=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_FILECOIN_CALIBRATION=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_WORLDCHAIN=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_YELLOW=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_0G=0x...

# RPC URLs for Frontend
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed1.binance.org
NEXT_PUBLIC_BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_FILECOIN_RPC_URL=https://api.node.glif.io/rpc/v1
NEXT_PUBLIC_FILECOIN_CALIBRATION_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
NEXT_PUBLIC_WORLDCHAIN_RPC_URL=https://worldchain-testnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_YELLOW_RPC_URL=https://rpc.yellow.org
NEXT_PUBLIC_0G_RPC_URL=https://rpc.0g.ai
```

## Network Selection Strategy

### For Development & Testing
1. **Start with Sepolia** - Most stable Ethereum testnet
2. **Add Base Sepolia** - L2 testing with low costs
3. **Include Arbitrum Sepolia** - Fast finality testing
4. **Test on BSC Testnet** - High throughput testing

### For Production Deployment
1. **Ethereum Mainnet** - Maximum security and decentralization
2. **Base** - Coinbase ecosystem integration
3. **Arbitrum** - Cost-effective Ethereum scaling
4. **BSC** - High throughput, low costs
5. **Avalanche** - Sub-second finality
6. **Filecoin** - Storage-focused applications
7. **Yellow** - AI/ML optimized workloads
8. **0G** - AI data infrastructure

## Verification Commands

```bash
# Verify contracts on all networks
npm run verify:sepolia
npm run verify:ethereum
npm run verify:base-sepolia
npm run verify:base
npm run verify:arbitrum-sepolia
npm run verify:arbitrum
npm run verify:bsc
npm run verify:bsc-testnet
npm run verify:avalanche
npm run verify:avalanche-fuji
npm run verify:polygon-mumbai
npm run verify:filecoin
npm run verify:filecoin-calibration
npm run verify:worldchain
npm run verify:yellow
npm run verify:0g
```

## Monitoring & Maintenance

### Network Health Monitoring
- Monitor RPC endpoint availability
- Track gas price fluctuations
- Monitor network congestion
- Set up alerts for contract events

### Cost Optimization
- Choose networks based on use case
- Monitor gas costs across networks
- Implement gas price optimization
- Use appropriate networks for different operations

### Security Considerations
- Verify contracts on all networks
- Monitor for security updates
- Implement network-specific security measures
- Regular security audits

## Troubleshooting

### Common Issues
1. **RPC Rate Limits**: Use multiple RPC providers
2. **Gas Estimation**: Test with small amounts first
3. **Network Congestion**: Choose optimal deployment times
4. **Contract Verification**: Ensure all dependencies are available
5. **Cross-Chain Compatibility**: Test thoroughly across networks

### Support Resources
- Network documentation and status pages
- Community Discord/Telegram channels
- Block explorer support
- RPC provider support
- Network-specific developer resources
