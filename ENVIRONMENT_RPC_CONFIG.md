# Environment-based RPC Configuration

This document explains how to use environment variables instead of Firebase for RPC configuration.

## Overview

The application now supports two modes for RPC configuration:

1. **Firebase Mode** (default): Uses Firebase Firestore to store and retrieve network RPC configurations
2. **Environment Mode**: Uses environment variables to configure network RPCs

## Configuration

### Toggle Between Modes

Set the `NEXT_PUBLIC_USE_FIREBASE_RPC` environment variable:

```bash
# Use Firebase for RPC configuration (default)
NEXT_PUBLIC_USE_FIREBASE_RPC=true

# Use environment variables for RPC configuration
NEXT_PUBLIC_USE_FIREBASE_RPC=false
```

### Environment Variables

When `NEXT_PUBLIC_USE_FIREBASE_RPC=false`, the application will use environment variables for RPC configuration.

#### Required Environment Variables

For each network you want to support, you need to set these environment variables:

```bash
# Pattern: NEXT_PUBLIC_{NETWORK_NAME}_RPC_URL
# Pattern: NEXT_PUBLIC_{NETWORK_NAME}_BACKUP_RPC_URLS (comma-separated)
# Pattern: NEXT_PUBLIC_{NETWORK_NAME}_BLOCK_EXPLORER
```

#### Example Configuration

```bash
# Toggle to environment mode
NEXT_PUBLIC_USE_FIREBASE_RPC=false

# Ethereum Mainnet
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your_key_here
NEXT_PUBLIC_ETHEREUM_BACKUP_RPC_URLS=https://mainnet.infura.io/v3/your_key_here,https://ethereum.publicnode.com
NEXT_PUBLIC_ETHEREUM_BLOCK_EXPLORER=https://etherscan.io

# Ethereum Sepolia
NEXT_PUBLIC_ETHEREUM_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key_here
NEXT_PUBLIC_ETHEREUM_SEPOLIA_BACKUP_RPC_URLS=https://sepolia.infura.io/v3/your_key_here,https://rpc.sepolia.org
NEXT_PUBLIC_ETHEREUM_SEPOLIA_BLOCK_EXPLORER=https://sepolia.etherscan.io

# Base Mainnet
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASE_BACKUP_RPC_URLS=https://base-mainnet.g.alchemy.com/v2/your_key_here,https://base.publicnode.com
NEXT_PUBLIC_BASE_BLOCK_EXPLORER=https://basescan.org

# Base Sepolia
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_BASE_SEPOLIA_BACKUP_RPC_URLS=https://base-sepolia.g.alchemy.com/v2/your_key_here
NEXT_PUBLIC_BASE_SEPOLIA_BLOCK_EXPLORER=https://sepolia.basescan.org

# Arbitrum One
NEXT_PUBLIC_ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_ARBITRUM_BACKUP_RPC_URLS=https://arbitrum-mainnet.g.alchemy.com/v2/your_key_here,https://arbitrum.publicnode.com
NEXT_PUBLIC_ARBITRUM_BLOCK_EXPLORER=https://arbiscan.io

# Arbitrum Sepolia
NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
NEXT_PUBLIC_ARBITRUM_SEPOLIA_BACKUP_RPC_URLS=https://arbitrum-sepolia.g.alchemy.com/v2/your_key_here
NEXT_PUBLIC_ARBITRUM_SEPOLIA_BLOCK_EXPLORER=https://sepolia.arbiscan.io

# BSC Mainnet
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed1.binance.org
NEXT_PUBLIC_BSC_BACKUP_RPC_URLS=https://bsc-dataseed2.binance.org,https://bsc-dataseed3.binance.org
NEXT_PUBLIC_BSC_BLOCK_EXPLORER=https://bscscan.com

# BSC Testnet
NEXT_PUBLIC_BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
NEXT_PUBLIC_BSC_TESTNET_BACKUP_RPC_URLS=https://data-seed-prebsc-2-s1.binance.org:8545
NEXT_PUBLIC_BSC_TESTNET_BLOCK_EXPLORER=https://testnet.bscscan.com

# Avalanche C-Chain
NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
NEXT_PUBLIC_AVALANCHE_BACKUP_RPC_URLS=https://avalanche-mainnet.g.alchemy.com/v2/your_key_here,https://avalanche.publicnode.com
NEXT_PUBLIC_AVALANCHE_BLOCK_EXPLORER=https://snowtrace.io

# Avalanche Fuji
NEXT_PUBLIC_AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_AVALANCHE_FUJI_BACKUP_RPC_URLS=https://avalanche-fuji.g.alchemy.com/v2/your_key_here
NEXT_PUBLIC_AVALANCHE_FUJI_BLOCK_EXPLORER=https://testnet.snowtrace.io

# Polygon Mumbai
NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/your_key_here
NEXT_PUBLIC_POLYGON_MUMBAI_BACKUP_RPC_URLS=https://rpc-mumbai.maticvigil.com,https://polygon-mumbai.infura.io/v3/your_key_here
NEXT_PUBLIC_POLYGON_MUMBAI_BLOCK_EXPLORER=https://mumbai.polygonscan.com

# Filecoin Mainnet
NEXT_PUBLIC_FILECOIN_RPC_URL=https://api.node.glif.io/rpc/v1
NEXT_PUBLIC_FILECOIN_BACKUP_RPC_URLS=https://api.node.glif.io/rpc/v0
NEXT_PUBLIC_FILECOIN_BLOCK_EXPLORER=https://filscan.io

# Filecoin Calibration
NEXT_PUBLIC_FILECOIN_CALIBRATION_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
NEXT_PUBLIC_FILECOIN_CALIBRATION_BACKUP_RPC_URLS=https://api.calibration.node.glif.io/rpc/v0
NEXT_PUBLIC_FILECOIN_CALIBRATION_BLOCK_EXPLORER=https://calibration.filscan.io

# Worldchain Testnet
NEXT_PUBLIC_WORLDCHAIN_TESTNET_RPC_URL=https://worldchain-testnet.g.alchemy.com/v2/your_key_here
NEXT_PUBLIC_WORLDCHAIN_TESTNET_BACKUP_RPC_URLS=https://worldchain-testnet.blockscout.com
NEXT_PUBLIC_WORLDCHAIN_TESTNET_BLOCK_EXPLORER=https://worldchain-testnet.blockscout.com

# Worldchain Mainnet
NEXT_PUBLIC_WORLDCHAIN_MAINNET_RPC_URL=https://worldchain-mainnet.g.alchemy.com/v2/your_key_here
NEXT_PUBLIC_WORLDCHAIN_MAINNET_BACKUP_RPC_URLS=https://worldchain-mainnet.blockscout.com
NEXT_PUBLIC_WORLDCHAIN_MAINNET_BLOCK_EXPLORER=https://worldchain-mainnet.blockscout.com

# Yellow Network
NEXT_PUBLIC_YELLOW_RPC_URL=https://rpc.yellow.org
NEXT_PUBLIC_YELLOW_BACKUP_RPC_URLS=
NEXT_PUBLIC_YELLOW_BLOCK_EXPLORER=https://explorer.yellow.org

# 0G Network
NEXT_PUBLIC_0G_RPC_URL=https://rpc.0g.ai
NEXT_PUBLIC_0G_BACKUP_RPC_URLS=
NEXT_PUBLIC_0G_BLOCK_EXPLORER=https://explorer.0g.ai
```

## Supported Networks

The following networks are supported in environment mode:

| Chain ID | Network Name | Environment Prefix |
|----------|--------------|-------------------|
| 1 | Ethereum | ETHEREUM |
| 11155111 | Ethereum Sepolia | ETHEREUM_SEPOLIA |
| 8453 | Base | BASE |
| 84532 | Base Sepolia | BASE_SEPOLIA |
| 42161 | Arbitrum One | ARBITRUM |
| 421614 | Arbitrum Sepolia | ARBITRUM_SEPOLIA |
| 56 | BSC Mainnet | BSC |
| 97 | BSC Testnet | BSC_TESTNET |
| 43114 | Avalanche C-Chain | AVALANCHE |
| 43113 | Avalanche Fuji | AVALANCHE_FUJI |
| 80001 | Polygon Mumbai | POLYGON_MUMBAI |
| 314 | Filecoin Mainnet | FILECOIN |
| 314159 | Filecoin Calibration | FILECOIN_CALIBRATION |
| 480 | Worldchain Testnet | WORLDCHAIN_TESTNET |
| 4801 | Worldchain Mainnet | WORLDCHAIN_MAINNET |
| 23011913 | Yellow Network | YELLOW |
| 2043 | 0G Network | 0G |

## Usage

### Firebase Mode (Default)
```bash
NEXT_PUBLIC_USE_FIREBASE_RPC=true
# Configure Firebase credentials
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

### Environment Mode
```bash
NEXT_PUBLIC_USE_FIREBASE_RPC=false
# Configure network RPCs via environment variables
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your_key
# ... other network configs
```

## Benefits

### Firebase Mode
- ✅ Centralized configuration management
- ✅ Real-time updates
- ✅ Admin interface for easy management
- ✅ Dynamic configuration changes

### Environment Mode
- ✅ No external dependencies
- ✅ Simple configuration
- ✅ Version control friendly
- ✅ No authentication setup required
- ✅ Faster startup (no Firebase connection)

## Migration

To switch from Firebase to Environment mode:

1. Set `NEXT_PUBLIC_USE_FIREBASE_RPC=false`
2. Add the required environment variables for your networks
3. Restart the application

To switch from Environment to Firebase mode:

1. Set `NEXT_PUBLIC_USE_FIREBASE_RPC=true`
2. Configure Firebase credentials
3. Set up Firebase with network data (see FIREBASE_SETUP_GUIDE.md)
4. Restart the application

## Notes

- Environment mode doesn't support real-time updates
- Environment mode doesn't support dynamic network management
- Both modes use the same caching mechanism for performance
- The application will automatically fall back gracefully if environment variables are missing
