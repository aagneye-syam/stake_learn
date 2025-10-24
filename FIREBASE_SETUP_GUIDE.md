# Firebase Setup Guide - Add Network RPC URLs

This guide will help you add all the network RPC URLs to your Firebase Firestore database.

## Method 1: Using Firebase Console (Easiest)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `stake-learn-rpc`
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Firestore
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

### Step 3: Add Network Data
1. In Firestore, click "Start collection"
2. Collection ID: `networkRPCs`
3. Add documents with the following data:

#### Document 1: Ethereum Mainnet
- **Document ID**: `1`
- **Fields**:
  ```
  chainId: 1
  chainName: "Ethereum"
  rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/"
  backupRpcUrls: ["https://mainnet.infura.io/v3/", "https://ethereum.publicnode.com"]
  blockExplorer: "https://etherscan.io"
  nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18}
  isTestnet: false
  isActive: true
  priority: 1
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

#### Document 2: Ethereum Sepolia
- **Document ID**: `11155111`
- **Fields**:
  ```
  chainId: 11155111
  chainName: "Ethereum Sepolia"
  rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/"
  backupRpcUrls: ["https://sepolia.infura.io/v3/", "https://rpc.sepolia.org"]
  blockExplorer: "https://sepolia.etherscan.io"
  nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18}
  isTestnet: true
  isActive: true
  priority: 2
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

#### Document 3: Base Mainnet
- **Document ID**: `8453`
- **Fields**:
  ```
  chainId: 8453
  chainName: "Base"
  rpcUrl: "https://mainnet.base.org"
  backupRpcUrls: ["https://base-mainnet.g.alchemy.com/v2/", "https://base.publicnode.com"]
  blockExplorer: "https://basescan.org"
  nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18}
  isTestnet: false
  isActive: true
  priority: 3
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

#### Document 4: Base Sepolia
- **Document ID**: `84532`
- **Fields**:
  ```
  chainId: 84532
  chainName: "Base Sepolia"
  rpcUrl: "https://sepolia.base.org"
  backupRpcUrls: ["https://base-sepolia.g.alchemy.com/v2/"]
  blockExplorer: "https://sepolia.basescan.org"
  nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18}
  isTestnet: true
  isActive: true
  priority: 4
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

#### Document 5: Arbitrum One
- **Document ID**: `42161`
- **Fields**:
  ```
  chainId: 42161
  chainName: "Arbitrum One"
  rpcUrl: "https://arb1.arbitrum.io/rpc"
  backupRpcUrls: ["https://arbitrum-mainnet.g.alchemy.com/v2/", "https://arbitrum.publicnode.com"]
  blockExplorer: "https://arbiscan.io"
  nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18}
  isTestnet: false
  isActive: true
  priority: 5
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

#### Document 6: Arbitrum Sepolia
- **Document ID**: `421614`
- **Fields**:
  ```
  chainId: 421614
  chainName: "Arbitrum Sepolia"
  rpcUrl: "https://sepolia-rollup.arbitrum.io/rpc"
  backupRpcUrls: ["https://arbitrum-sepolia.g.alchemy.com/v2/"]
  blockExplorer: "https://sepolia.arbiscan.io"
  nativeCurrency: {name: "ETH", symbol: "ETH", decimals: 18}
  isTestnet: true
  isActive: true
  priority: 6
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

#### Document 7: BSC Mainnet
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

#### Document 8: BSC Testnet
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

#### Document 9: Avalanche C-Chain
- **Document ID**: `43114`
- **Fields**:
  ```
  chainId: 43114
  chainName: "Avalanche C-Chain"
  rpcUrl: "https://api.avax.network/ext/bc/C/rpc"
  backupRpcUrls: ["https://avalanche-mainnet.g.alchemy.com/v2/", "https://avalanche.publicnode.com"]
  blockExplorer: "https://snowtrace.io"
  nativeCurrency: {name: "AVAX", symbol: "AVAX", decimals: 18}
  isTestnet: false
  isActive: true
  priority: 9
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

#### Document 10: Avalanche Fuji
- **Document ID**: `43113`
- **Fields**:
  ```
  chainId: 43113
  chainName: "Avalanche Fuji"
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc"
  backupRpcUrls: ["https://avalanche-fuji.g.alchemy.com/v2/"]
  blockExplorer: "https://testnet.snowtrace.io"
  nativeCurrency: {name: "AVAX", symbol: "AVAX", decimals: 18}
  isTestnet: true
  isActive: true
  priority: 10
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

#### Document 11: Polygon Mumbai
- **Document ID**: `80001`
- **Fields**:
  ```
  chainId: 80001
  chainName: "Polygon Mumbai"
  rpcUrl: "https://polygon-mumbai.g.alchemy.com/v2/"
  backupRpcUrls: ["https://rpc-mumbai.maticvigil.com", "https://polygon-mumbai.infura.io/v3/"]
  blockExplorer: "https://mumbai.polygonscan.com"
  nativeCurrency: {name: "MATIC", symbol: "MATIC", decimals: 18}
  isTestnet: true
  isActive: true
  priority: 11
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

#### Document 12: Filecoin Mainnet
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

#### Document 13: Filecoin Calibration
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

#### Document 14: Worldchain Testnet
- **Document ID**: `480`
- **Fields**:
  ```
  chainId: 480
  chainName: "Worldchain Testnet"
  rpcUrl: "https://worldchain-testnet.g.alchemy.com/v2/"
  backupRpcUrls: ["https://worldchain-testnet.blockscout.com"]
  blockExplorer: "https://worldchain-testnet.blockscout.com"
  nativeCurrency: {name: "WLD", symbol: "WLD", decimals: 18}
  isTestnet: true
  isActive: true
  priority: 14
  lastUpdated: 1703123456789
  createdBy: "admin"
  ```

#### Document 15: Yellow Network
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

#### Document 16: 0G Network
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

## Method 2: Using Script (Automated)

### Step 1: Install Firebase Admin SDK
```bash
npm install firebase-admin
```

### Step 2: Get Service Account Key
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Rename it to `firebase-service-account.json`
5. Place it in your project root

### Step 3: Run the Script
```bash
node init-firebase.js
```

## Method 3: Using Firebase CLI

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```

### Step 3: Initialize Firebase in your project
```bash
firebase init firestore
```

### Step 4: Use the provided script
```bash
node init-firebase.js
```

## Verification

After adding the data, you should see:
- **Collection**: `networkRPCs`
- **Documents**: 16 documents (one for each network)
- **Fields**: Each document should have all the required fields

## Next Steps

1. **Configure Environment Variables** in your `.env.local`:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

2. **Test the Integration** by running your app and checking the network switcher

3. **Access Admin Panel** at `/admin/networks` to manage networks

Your Firebase database is now ready with all network RPC configurations! 🚀
