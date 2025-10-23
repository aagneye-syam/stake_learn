# DataCoin Setup Guide

This guide explains how to create and integrate DataCoins for the StakeLearn platform using 1MB.io.

## Overview

DataCoins are used to reward learners for completing courses and contributing learning data. They are created on 1MB.io and integrated with the StakeLearn platform.

## Creating a DataCoin on 1MB.io

### Step 1: Visit 1MB.io

1. Go to [https://1mb.io/](https://1mb.io/)
2. Connect your wallet (MetaMask recommended)
3. Ensure you're on the Sepolia testnet

### Step 2: Create DataCoin

1. Click "Create DataCoin"
2. Fill in the following details:

**DataCoin Information:**
- **Name**: "StakeLearn Achievement Token"
- **Symbol**: "SLAT" 
- **Description**: "Rewards for completing courses and contributing learning data"
- **Category**: Education/Learning
- **Network**: Sepolia Testnet

**DataCoin Metadata:**
```json
{
  "name": "StakeLearn Achievement Token",
  "description": "DataCoin rewards for course completion and learning achievements",
  "image": "https://your-domain.com/datacoin-image.png",
  "attributes": [
    {
      "trait_type": "Purpose",
      "value": "Learning Rewards"
    },
    {
      "trait_type": "Network",
      "value": "Sepolia"
    }
  ]
}
```

### Step 3: Configure Rewards

Set up reward amounts based on course difficulty:

- **Beginner Courses**: 10 DataCoins
- **Intermediate Courses**: 25 DataCoins  
- **Advanced Courses**: 50 DataCoins

### Step 4: Deploy and Record Address

1. Deploy the DataCoin contract
2. Record the contract address
3. Add to environment variables:

```bash
NEXT_PUBLIC_DATACOIN_ADDRESS=0xYourDataCoinContractAddress
```

## Integration with StakeLearn

### Environment Variables

Add to your `.env` file:

```bash
# DataCoin Integration
NEXT_PUBLIC_DATACOIN_ADDRESS=0xYourDataCoinContractAddress
```

### Smart Contract Integration

The DataCoin contract should support:

```solidity
// Mint tokens to users
function mint(address to, uint256 amount) external;

// Check user balance
function balanceOf(address account) external view returns (uint256);

// Get total supply
function totalSupply() external view returns (uint256);
```

### Frontend Integration

The platform includes hooks for DataCoin interaction:

```typescript
import { useDataCoin, useDataCoinBalance } from '@/hooks/useDataCoin';

// Mint tokens
const { mintTokens } = useDataCoin();
await mintTokens(userAddress, "25"); // Mint 25 DataCoins

// Check balance
const { balance } = useDataCoinBalance(userAddress);
```

## Reward Distribution Flow

### 1. Course Completion

When a user completes a course:

1. Generate completion certificate
2. Upload to Lighthouse (encrypted)
3. Emit completion event with certificate CID
4. Distribute DataCoin rewards

### 2. Reward Calculation

```typescript
const REWARD_AMOUNTS = {
  'Beginner': '10',    // 10 DataCoins
  'Intermediate': '25', // 25 DataCoins  
  'Advanced': '50',    // 50 DataCoins
};
```

### 3. API Integration

```typescript
// POST /api/reward
{
  "studentAddress": "0x...",
  "courseId": 1,
  "courseDifficulty": "Intermediate",
  "courseName": "React & Next.js"
}
```

## DataCoin Features

### 1. Learning Achievement Rewards

- **Course Completion**: Earn DataCoins for finishing courses
- **Progress Tracking**: Additional rewards for milestones
- **Certification**: Bonus rewards for verified certificates

### 2. Data Contribution Rewards

- **Learning Data**: Reward users for contributing learning progress
- **Course Feedback**: DataCoins for providing course reviews
- **Content Creation**: Rewards for creating educational content

### 3. Trading and Monetization

- **1MB.io Trading**: Trade DataCoins on the 1MB.io platform
- **Data Monetization**: Users can monetize their learning data
- **Marketplace**: Buy/sell educational data and achievements

## Implementation Checklist

### Smart Contract Setup

- [ ] Create DataCoin on 1MB.io
- [ ] Record contract address
- [ ] Test minting functionality
- [ ] Verify balance checking

### Frontend Integration

- [ ] Add DataCoin ABI
- [ ] Implement useDataCoin hook
- [ ] Add balance display to dashboard
- [ ] Create reward distribution API

### Testing

- [ ] Test DataCoin minting on Sepolia
- [ ] Verify balance updates
- [ ] Test reward distribution flow
- [ ] Validate trading on 1MB.io

## Security Considerations

### 1. Access Control

- Only authorized addresses can mint DataCoins
- Implement role-based access control
- Use multi-signature for large distributions

### 2. Reward Validation

- Verify course completion before minting
- Check for duplicate rewards
- Implement cooldown periods if needed

### 3. Data Privacy

- Respect user privacy in data monetization
- Implement opt-in mechanisms
- Provide clear data usage policies

## Troubleshooting

### Common Issues

1. **Contract Not Found**: Verify DataCoin address is correct
2. **Minting Failed**: Check contract permissions and gas
3. **Balance Not Updating**: Refresh or check transaction status

### Error Messages

- `DataCoin contract not configured`: Set `NEXT_PUBLIC_DATACOIN_ADDRESS`
- `Minting failed`: Check contract permissions
- `Insufficient balance`: Verify user has enough tokens

## Development Workflow

### 1. Local Development

```bash
# Set up environment
export NEXT_PUBLIC_DATACOIN_ADDRESS=0xYourTestAddress

# Run development server
npm run dev
```

### 2. Testing

```bash
# Test DataCoin functionality
npm run test:datacoin

# Test reward distribution
npm run test:rewards
```

### 3. Deployment

```bash
# Deploy to production
npm run build
npm run deploy
```

## Resources

- [1MB.io Documentation](https://docs.1mb.io/)
- [DataCoin Creation Guide](https://docs.lighthouse.storage/lighthouse-1/how-to/create-a-datacoin)
- [Lighthouse Storage](https://lighthouse.storage/)
- [Sepolia Testnet](https://sepolia.etherscan.io/)

## Support

For DataCoin-related issues:
- [1MB.io Support](https://1mb.io/support)
- [Lighthouse Discord](https://discord.gg/lighthouse)
- [StakeLearn GitHub Issues](https://github.com/your-repo/issues)
