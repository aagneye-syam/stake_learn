# Complete Smart Contract Deployment Guide

## 📋 **Contracts Overview**

Your Stake-to-Learn platform now includes **5 comprehensive smart contracts**:

### ✅ **Core Contracts:**
1. **DataCoin.sol** - ERC20 token for course rewards and DataCoin minting
2. **StakingManager.sol** - Main contract for course staking and completion
3. **Soulbound.sol** - Non-transferable NFTs for proof of contribution
4. **Reputation.sol** - On-chain reputation tracking system
5. **CourseRegistry.sol** - Course management and metadata

## 🚀 **Quick Deployment**

### **1. Environment Setup**
```bash
cd packages/contracts
npm install
```

Create `.env` file:
```env
# Required: Your wallet private key (DO NOT COMMIT!)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Required: RPC URL for your target network
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Optional: For contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: AI verifier address (defaults to deployer)
AI_VERIFIER_ADDRESS=0x...

# Optional: Default stake amount for courses (default: 0.0001 ETH)
DEFAULT_STAKE_AMOUNT=0.0001
```

### **2. Compile Contracts**
```bash
npm run build
```

### **3. Run Tests**
```bash
npm test
```

### **4. Deploy to Sepolia (Recommended)**
```bash
npm run deploy
```

### **5. Deploy to Multiple Networks**
```bash
# Deploy to specific network
npm run deploy:sepolia
npm run deploy:base-sepolia
npm run deploy:arbitrum-sepolia

# Or deploy to all networks
npm run deploy:multi
```

## 📊 **Deployment Output**

After deployment, you'll get:

### **Contract Addresses:**
```
DataCoin: 0x...
StakingManager: 0x...
Soulbound: 0x...
Reputation: 0x...
CourseRegistry: 0x...
```

### **Environment Variables:**
```env
NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_SEPOLIA=0x...
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_SEPOLIA=0x...
NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_SEPOLIA=0x...
NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_SEPOLIA=0x...
NEXT_PUBLIC_COURSE_REGISTRY_CONTRACT_ADDRESS_SEPOLIA=0x...
```

## 🔧 **Contract Features**

### **DataCoin Contract:**
- ✅ **Mintable** by authorized minters (course completion system)
- ✅ **Burnable** by users and authorized burners
- ✅ **Role-based access control** (minters, burners)
- ✅ **Max supply limit** (1 billion tokens)
- ✅ **Self-burning** functionality for users
- ✅ **Event tracking** for all mint/burn operations

### **StakingManager Contract:**
- ✅ **Course staking** with ETH
- ✅ **Course completion** by authorized verifiers
- ✅ **Automatic stake refunds** upon completion
- ✅ **Multi-course support**
- ✅ **Batch operations** for efficiency
- ✅ **Emergency controls** for owner

### **Soulbound Contract:**
- ✅ **Non-transferable NFTs** (Soulbound tokens)
- ✅ **EIP-712 signature verification**
- ✅ **Replay attack prevention**
- ✅ **Metadata support** (IPFS URIs)
- ✅ **Expiry-based permits**

### **Reputation Contract:**
- ✅ **On-chain reputation tracking**
- ✅ **Leaderboard functionality**
- ✅ **Contribution scoring**
- ✅ **Minter authorization**

### **CourseRegistry Contract:**
- ✅ **Course management**
- ✅ **Stake amount configuration**
- ✅ **Active/inactive course status**
- ✅ **Statistics tracking**

## 🧪 **Testing**

### **Run All Tests:**
```bash
npm test
```

### **Test Coverage:**
- ✅ **DataCoin**: Minting, burning, access control, integration
- ✅ **StakingManager**: Staking, completion, batch operations, emergency functions
- ✅ **Soulbound**: EIP-712 signatures, non-transferability, replay prevention
- ✅ **Reputation**: Contribution tracking, leaderboards
- ✅ **Integration**: Cross-contract interactions

## 🔐 **Security Features**

### **Access Control:**
- ✅ **Ownable pattern** for admin functions
- ✅ **Role-based permissions** (minters, burners, verifiers)
- ✅ **ReentrancyGuard** protection
- ✅ **Input validation** and bounds checking

### **Token Security:**
- ✅ **Max supply limits** prevent inflation
- ✅ **Zero address protection**
- ✅ **Amount validation**
- ✅ **Balance checks** before operations

### **Staking Security:**
- ✅ **Double-staking prevention**
- ✅ **Double-refund prevention**
- ✅ **State validation**
- ✅ **Emergency withdrawal** capabilities

## 🌐 **Multi-Network Support**

### **Supported Networks:**
- ✅ **Ethereum Sepolia** (testnet)
- ✅ **Base Sepolia** (testnet)
- ✅ **Arbitrum Sepolia** (testnet)
- ✅ **Worldchain** (testnet)
- ✅ **Polygon Mumbai** (testnet)
- ✅ **BSC Testnet** (testnet)
- ✅ **Filecoin Calibration** (testnet)
- ✅ **Yellow Network** (testnet)
- ✅ **0G Network** (testnet)
- ✅ **Avalanche Fuji** (testnet)

### **Mainnet Networks:**
- ✅ **Ethereum Mainnet**
- ✅ **Base Mainnet**
- ✅ **Arbitrum One**
- ✅ **BSC Mainnet**
- ✅ **Filecoin Mainnet**
- ✅ **Avalanche C-Chain**

## 📝 **Integration with Frontend**

### **Required Environment Variables:**
```env
# DataCoin contract (for minting rewards)
NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_SEPOLIA=0x...

# StakingManager contract (for course staking)
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_SEPOLIA=0x...

# Soulbound contract (for NFTs)
NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_SEPOLIA=0x...

# Reputation contract (for scoring)
NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_SEPOLIA=0x...

# CourseRegistry contract (for course data)
NEXT_PUBLIC_COURSE_REGISTRY_CONTRACT_ADDRESS_SEPOLIA=0x...
```

### **Frontend Integration:**
1. **DataCoin minting** for course progress rewards
2. **StakingManager** for course enrollment
3. **Soulbound NFTs** for completion certificates
4. **Reputation tracking** for user scores
5. **CourseRegistry** for course metadata

## 🚨 **Important Notes**

### **Before Deployment:**
- ✅ **Test thoroughly** on testnet first
- ✅ **Verify all contracts** on block explorer
- ✅ **Keep private keys secure**
- ✅ **Use hardware wallet** for mainnet
- ✅ **Consider multi-sig** for production

### **After Deployment:**
- ✅ **Update frontend** environment variables
- ✅ **Test all functionality** end-to-end
- ✅ **Monitor contract events**
- ✅ **Set up monitoring** and alerts
- ✅ **Document all addresses**

## 🎯 **Next Steps**

1. **Deploy contracts** to your preferred testnet
2. **Update frontend** with contract addresses
3. **Test complete flow** (staking → completion → rewards)
4. **Deploy to mainnet** when ready
5. **Set up monitoring** and maintenance

Your smart contract system is now **complete and production-ready**! 🚀
