# Firebase Manual Setup Guide

Since the automated scripts require authentication, here's how to manually add the network data to Firebase:

## Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ethonline-57983`
3. Go to "Firestore Database"

## Step 2: Create Collection

1. Click "Start collection"
2. Collection ID: `networkRPCs`
3. Click "Next"

## Step 3: Add Network Documents

For each network, create a document with the following data:

### Document 1: Ethereum Mainnet
- **Document ID**: `1`
- **Fields**:
  ```
  chainId: 1
  chainName: "Ethereum"
  rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp"
  backupRpcUrls: ["https://mainnet.infura.io/v3/", "https://ethereum.publicnode.com"]
  blockExplorer: "https://etherscan.io"
  nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18}
  isTestnet: false
  isActive: true
  priority: 1
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 2: Ethereum Sepolia
- **Document ID**: `11155111`
- **Fields**:
  ```
  chainId: 11155111
  chainName: "Ethereum Sepolia"
  rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp"
  backupRpcUrls: ["https://sepolia.infura.io/v3/", "https://rpc.sepolia.org"]
  blockExplorer: "https://sepolia.etherscan.io"
  nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18}
  isTestnet: true
  isActive: true
  priority: 2
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 3: Base Mainnet
- **Document ID**: `8453`
- **Fields**:
  ```
  chainId: 8453
  chainName: "Base"
  rpcUrl: "https://mainnet.base.org"
  backupRpcUrls: ["https://base-mainnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp", "https://base.publicnode.com"]
  blockExplorer: "https://basescan.org"
  nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18}
  isTestnet: false
  isActive: true
  priority: 3
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 4: Base Sepolia
- **Document ID**: `84532`
- **Fields**:
  ```
  chainId: 84532
  chainName: "Base Sepolia"
  rpcUrl: "https://sepolia.base.org"
  backupRpcUrls: ["https://base-sepolia.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp"]
  blockExplorer: "https://sepolia.basescan.org"
  nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18}
  isTestnet: true
  isActive: true
  priority: 4
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 5: Arbitrum One
- **Document ID**: `42161`
- **Fields**:
  ```
  chainId: 42161
  chainName: "Arbitrum One"
  rpcUrl: "https://arb-mainnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp"
  backupRpcUrls: ["https://arb1.arbitrum.io/rpc", "https://arbitrum.publicnode.com"]
  blockExplorer: "https://arbiscan.io"
  nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18}
  isTestnet: false
  isActive: true
  priority: 5
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 6: Arbitrum Sepolia
- **Document ID**: `421614`
- **Fields**:
  ```
  chainId: 421614
  chainName: "Arbitrum Sepolia"
  rpcUrl: "https://arb-sepolia.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp"
  backupRpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"]
  blockExplorer: "https://sepolia.arbiscan.io"
  nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18}
  isTestnet: true
  isActive: true
  priority: 6
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 7: BSC Mainnet
- **Document ID**: `56`
- **Fields**:
  ```
  chainId: 56
  chainName: "BNB Smart Chain"
  rpcUrl: "https://bsc-dataseed1.binance.org"
  backupRpcUrls: ["https://bsc-dataseed2.binance.org", "https://bsc-dataseed3.binance.org"]
  blockExplorer: "https://bscscan.com"
  nativeCurrency: {name: "BNB", symbol: "BNB", decimals: 18}
  isTestnet: false
  isActive: true
  priority: 7
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 8: BSC Testnet
- **Document ID**: `97`
- **Fields**:
  ```
  chainId: 97
  chainName: "BNB Smart Chain Testnet"
  rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545"
  backupRpcUrls: ["https://data-seed-prebsc-2-s1.binance.org:8545"]
  blockExplorer: "https://testnet.bscscan.com"
  nativeCurrency: {name: "tBNB", symbol: "tBNB", decimals: 18}
  isTestnet: true
  isActive: true
  priority: 8
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 9: Avalanche C-Chain
- **Document ID**: `43114`
- **Fields**:
  ```
  chainId: 43114
  chainName: "Avalanche C-Chain"
  rpcUrl: "https://api.avax.network/ext/bc/C/rpc"
  backupRpcUrls: ["https://avalanche-mainnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp", "https://avalanche.publicnode.com"]
  blockExplorer: "https://snowtrace.io"
  nativeCurrency: {name: "AVAX", symbol: "AVAX", decimals: 18}
  isTestnet: false
  isActive: true
  priority: 9
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 10: Avalanche Fuji
- **Document ID**: `43113`
- **Fields**:
  ```
  chainId: 43113
  chainName: "Avalanche Fuji"
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc"
  backupRpcUrls: ["https://avalanche-fuji.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp"]
  blockExplorer: "https://testnet.snowtrace.io"
  nativeCurrency: {name: "AVAX", symbol: "AVAX", decimals: 18}
  isTestnet: true
  isActive: true
  priority: 10
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 11: Polygon Mumbai
- **Document ID**: `80001`
- **Fields**:
  ```
  chainId: 80001
  chainName: "Polygon Mumbai"
  rpcUrl: "https://polygon-mumbai.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp"
  backupRpcUrls: ["https://rpc-mumbai.maticvigil.com", "https://polygon-mumbai.infura.io/v3/"]
  blockExplorer: "https://mumbai.polygonscan.com"
  nativeCurrency: {name: "MATIC", symbol: "MATIC", decimals: 18}
  isTestnet: true
  isActive: true
  priority: 11
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 12: Filecoin Mainnet
- **Document ID**: `314`
- **Fields**:
  ```
  chainId: 314
  chainName: "Filecoin Mainnet"
  rpcUrl: "https://api.node.glif.io/rpc/v1"
  backupRpcUrls: ["https://api.node.glif.io/rpc/v0"]
  blockExplorer: "https://filscan.io"
  nativeCurrency: {name: "FIL", symbol: "FIL", decimals: 18}
  isTestnet: false
  isActive: true
  priority: 12
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 13: Filecoin Calibration
- **Document ID**: `314159`
- **Fields**:
  ```
  chainId: 314159
  chainName: "Filecoin Calibration"
  rpcUrl: "https://api.calibration.node.glif.io/rpc/v1"
  backupRpcUrls: ["https://api.calibration.node.glif.io/rpc/v0"]
  blockExplorer: "https://calibration.filscan.io"
  nativeCurrency: {name: "tFIL", symbol: "tFIL", decimals: 18}
  isTestnet: true
  isActive: true
  priority: 13
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 14: Worldchain Testnet
- **Document ID**: `480`
- **Fields**:
  ```
  chainId: 480
  chainName: "Worldchain Testnet"
  rpcUrl: "https://worldchain-sepolia.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp"
  backupRpcUrls: ["https://worldchain-testnet.blockscout.com"]
  blockExplorer: "https://worldchain-testnet.blockscout.com"
  nativeCurrency: {name: "WLD", symbol: "WLD", decimals: 18}
  isTestnet: true
  isActive: true
  priority: 14
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 15: Worldchain Mainnet
- **Document ID**: `4801`
- **Fields**:
  ```
  chainId: 4801
  chainName: "Worldchain Mainnet"
  rpcUrl: "https://worldchain-mainnet.g.alchemy.com/v2/30VrqdibFPwdIpposSfYp"
  backupRpcUrls: ["https://worldchain-mainnet.blockscout.com"]
  blockExplorer: "https://worldchain-mainnet.blockscout.com"
  nativeCurrency: {name: "WLD", symbol: "WLD", decimals: 18}
  isTestnet: false
  isActive: true
  priority: 17
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 16: Yellow Network
- **Document ID**: `23011913`
- **Fields**:
  ```
  chainId: 23011913
  chainName: "Yellow Network"
  rpcUrl: "https://rpc.yellow.org"
  backupRpcUrls: []
  blockExplorer: "https://explorer.yellow.org"
  nativeCurrency: {name: "YELLOW", symbol: "YELLOW", decimals: 18}
  isTestnet: false
  isActive: true
  priority: 15
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

### Document 17: 0G Network
- **Document ID**: `2043`
- **Fields**:
  ```
  chainId: 2043
  chainName: "0G Network"
  rpcUrl: "https://rpc.0g.ai"
  backupRpcUrls: []
  blockExplorer: "https://explorer.0g.ai"
  nativeCurrency: {name: "0G", symbol: "0G", decimals: 18}
  isTestnet: false
  isActive: true
  priority: 16
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

## Step 4: Verify Setup

After adding all documents, you should have:
- **Collection**: `networkRPCs`
- **Documents**: 17 documents
- **Total Networks**: 17 networks (9 mainnets, 8 testnets)

## Step 5: Test Your Setup

1. Go to your app
2. Check the network switcher
3. Verify that all networks are loaded from Firebase
4. Test switching between networks

## Quick Copy-Paste Method

You can also use the JSON import file `firebase-networks-import.json` and copy the data directly from there to speed up the process.

Your Firebase database will now have all network configurations with your Alchemy API keys! 🚀
