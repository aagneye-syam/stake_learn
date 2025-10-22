# Web App - Staking Integration Guide

## Overview

The web application now integrates with the StakingManager smart contract deployed on Ethereum Sepolia testnet.

## Features

✅ **Wallet Connection** - Connect MetaMask, Coinbase, WalletConnect, and more
✅ **Real Staking** - Stake ETH directly to smart contract
✅ **Course Enrollment** - Automatic enrollment after staking
✅ **Transaction Tracking** - View transaction status on Etherscan
✅ **Stake Status** - Check if user has staked or completed courses
✅ **Auto Refund** - Stake returned automatically upon course completion

## Setup

### 1. Install Dependencies

```bash
cd apps/web
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the contract addresses after deployment:

```env
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=0xYourStakingContractAddress
NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS=0xYourSoulboundContractAddress
NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS=0xYourReputationContractAddress
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## How It Works

### User Flow

1. **Browse Courses** - User views available courses on dashboard
2. **Select Course** - Click "Start Learning" to view course details
3. **Connect Wallet** - Click "Connect Wallet" to connect Web3 wallet
4. **Stake ETH** - Click "Stake & Start Learning" to stake required ETH
5. **Confirm Transaction** - Approve transaction in wallet
6. **Start Learning** - Access course content after successful stake
7. **Complete Course** - Submit assignments and complete course
8. **Receive Refund** - Stake automatically returned upon completion

### Smart Contract Integration

The app uses custom React hooks to interact with the smart contract:

#### `useStaking(courseId)`

Handles staking operations:
- Get required stake amount from contract
- Check if course is active
- Execute stake transaction
- Monitor transaction status

#### `useUserStake(userAddress, courseId)`

Checks user's stake status:
- Has user staked for this course?
- Has user completed the course?
- Get stake info (amount, timestamp, etc.)

### File Structure

```
apps/web/
├── abis/
│   └── StakingManagerABI.ts       # Contract ABI
├── config/
│   └── contracts.ts                # Contract addresses & config
├── hooks/
│   └── useStaking.ts               # Custom staking hooks
├── components/
│   └── WalletConnectModal.tsx      # Wallet connection UI
└── app/
    └── (routes)/
        └── courses/
            └── [id]/
                └── page.tsx         # Course details & staking
```

## Development

### Testing Staking Flow

1. Get Sepolia ETH from faucet: [https://sepoliafaucet.com/](https://sepoliafaucet.com/)
2. Connect wallet to Sepolia network
3. Navigate to a course
4. Click "Connect Wallet"
5. Click "Stake & Start Learning"
6. Approve transaction (0.002 ETH + gas)
7. Wait for confirmation
8. View transaction on Etherscan

### Troubleshooting

**Issue: Contract address not set**
- Solution: Update `.env.local` with deployed contract addresses

**Issue: Transaction fails**
- Check you have enough Sepolia ETH
- Ensure you're on Sepolia network
- Verify course is active in contract
- Check you haven't already staked for this course

**Issue: Wallet doesn't connect**
- Ensure MetaMask or other wallet is installed
- Try refreshing the page
- Check browser console for errors

## API Reference

### Contract Functions Used

```typescript
// Read functions
getCourseStakeAmount(courseId)  // Get required stake for course
hasStaked(user, courseId)       // Check if user staked
hasCompleted(user, courseId)    // Check if user completed
getStake(user, courseId)        // Get full stake details

// Write functions
stake(courseId)                 // Stake ETH for course (payable)
```

### Events

```typescript
Staked(user, courseId, amount)           // User staked
CourseCompleted(user, courseId)          // Course completed
StakeRefunded(user, courseId, amount)    // Stake refunded
```

## Next Steps

- [ ] Implement course content access after staking
- [ ] Add admin panel for marking courses complete
- [ ] Integrate with AI verification for automatic completion
- [ ] Add reputation system integration
- [ ] Deploy to production (mainnet)
- [ ] Add more payment options (USDC, DAI, etc.)

## Security Notes

- Never commit `.env.local` file
- Always verify contract addresses
- Test thoroughly on testnet first
- Use hardware wallet for large amounts
- Audit contracts before mainnet deployment

## Support

For issues or questions:
- Check the [contracts README](../../packages/contracts/README.md)
- Review [deployment guide](../../packages/contracts/DEPLOYMENT.md)
- Check transaction on [Sepolia Etherscan](https://sepolia.etherscan.io)
