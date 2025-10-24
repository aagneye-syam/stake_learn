# 🚀 Quick Start: Deploy & Test Staking System

## Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] MetaMask wallet installed
- [ ] Some Sepolia ETH (get from [sepoliafaucet.com](https://sepoliafaucet.com))
- [ ] Alchemy account (free tier works)

## 🔧 Part 1: Deploy Smart Contracts (5 minutes)

### Step 1: Setup Contracts Package

```bash
cd packages/contracts
npm install
```

### Step 2: Configure Environment

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DEPLOYER_PRIVATE_KEY=your_metamask_private_key
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

### Step 3: Compile Contracts

```bash
npm run build
```

### Step 4: Deploy to Sepolia

```bash
npm run deploy
```

**Save the contract addresses!** They'll be in `deployments.json`

```json
{
  "contracts": {
    "StakingManager": "0x...",  // ⭐ You need this!
    "Soulbound": "0x...",
    "Reputation": "0x..."
  }
}
```

## 💻 Part 2: Setup Web App (3 minutes)

### Step 1: Install Web Dependencies

```bash
cd ../../apps/web
npm install
```

### Step 2: Configure Web Environment

Create `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your deployed contract address:
```env
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0xYourStakingManagerAddress
```

### Step 3: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎮 Part 3: Test the Flow (2 minutes)

### Step 1: Get Test ETH

Visit [https://sepoliafaucet.com/](https://sepoliafaucet.com/) and get 0.5 Sepolia ETH

### Step 2: Connect Wallet

1. Open the app
2. Click "Dashboard"
3. Click on any course
4. Click "Connect Wallet"
5. Select MetaMask
6. Switch to Sepolia network if prompted

### Step 3: Stake for a Course

1. Click "Stake & Start Learning"
2. Approve transaction in MetaMask (0.002 ETH + gas)
3. Wait for confirmation (30-60 seconds)
4. See success message with Etherscan link

### Step 4: Verify on Blockchain

Click the Etherscan link to see your transaction on the blockchain!

## 🎉 You're Done!

Your staking system is now live on Sepolia testnet.

## 🐛 Troubleshooting

### "Insufficient funds"
- Get more Sepolia ETH from faucet

### "Transaction failed"
- Check you're on Sepolia network
- Ensure you haven't already staked for this course
- Try again with higher gas limit

### "Contract not found"
- Double-check contract address in `.env.local`
- Ensure contract deployment succeeded

### "Wallet won't connect"
- Install MetaMask extension
- Refresh the page
- Clear browser cache

## 📚 Next Steps

1. **Test Course Completion**: 
   - Use Hardhat console to mark course complete
   - Watch your stake get refunded automatically

2. **Add More Courses**:
   ```bash
   cd packages/contracts
   npx hardhat console --network sepolia
   ```
   ```javascript
   const staking = await ethers.getContractAt("StakingManager", "YOUR_ADDRESS")
   await staking.addCourse(3, ethers.parseEther("0.003"))
   ```

3. **Deploy to Production**:
   - Get Ethereum mainnet ETH
   - Update `hardhat.config.ts` with mainnet RPC
   - Deploy with `npm run deploy`
   - Update web app with mainnet addresses

## 🔐 Security Reminders

- ✅ Never commit `.env` or `.env.local`
- ✅ Use separate wallets for testing and production
- ✅ Test everything on testnet first
- ✅ Get contracts audited before mainnet
- ✅ Use hardware wallet for mainnet deployment

## 📖 Full Documentation

- [Contracts README](../packages/contracts/README.md)
- [Deployment Guide](../packages/contracts/DEPLOYMENT.md)
- [Staking Integration](../apps/web/STAKING_INTEGRATION.md)
- [Main README](../README.md)
