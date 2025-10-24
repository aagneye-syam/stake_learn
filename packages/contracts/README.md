# Proof of Contribution - Smart Contracts

## Overview

This package contains Ethereum smart contracts for the Stake-to-Learn platform.

### Contracts

1. **StakingManager.sol** - Main contract for managing course stakes and completions
2. **Soulbound.sol** - Non-transferable NFTs for proof of contribution
3. **Reputation.sol** - On-chain reputation tracking system
4. **CourseRegistry.sol** - Course management and metadata

## StakingManager Contract

The StakingManager contract is the core of the staking system:

### Features

- **Stake ETH**: Users stake ETH to enroll in courses
- **Course Completion**: Authorized verifiers mark courses as complete
- **Automatic Refund**: Stakes are automatically refunded upon course completion
- **Multi-Course Support**: Users can stake for multiple courses
- **Batch Operations**: Efficient batch processing for multiple completions
- **Emergency Controls**: Owner can perform emergency withdrawals if needed

### Key Functions

#### For Users
- `stake(courseId)` - Stake ETH for a course
- `getStake(user, courseId)` - View stake details
- `hasStaked(user, courseId)` - Check if user has staked
- `hasCompleted(user, courseId)` - Check if user completed course

#### For Administrators
- `addCourse(courseId, stakeAmount)` - Add new course with stake requirement
- `updateCourse(courseId, stakeAmount, active)` - Update course details
- `addVerifier(address)` - Add authorized verifier
- `removeVerifier(address)` - Remove verifier authorization

#### For Verifiers
- `completeCourse(user, courseId)` - Mark course complete and refund stake
- `batchCompleteCourses(users[], courseIds[])` - Batch complete multiple courses

### Events

- `Staked(user, courseId, amount)` - Emitted when user stakes
- `CourseCompleted(user, courseId)` - Emitted when course is completed
- `StakeRefunded(user, courseId, amount)` - Emitted when stake is refunded
- `CourseAdded(courseId, stakeAmount)` - Emitted when course is added
- `CourseUpdated(courseId, stakeAmount, active)` - Emitted when course is updated

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Admin functions restricted to owner
- **Role-Based Access**: Verifiers have limited permissions
- **State Validation**: Multiple checks prevent double-staking and double-refunds
- **Emergency Functions**: Owner can withdraw in emergencies

## Testing

Run comprehensive test suite:

```bash
npm test
```

Tests cover:
- Deployment and initialization
- Course management
- Verifier management
- Staking functionality
- Course completion and refunds
- Batch operations
- Emergency functions
- Access control

## Gas Optimization

- Use of mappings for O(1) lookups
- Batch operations reduce transaction costs
- Efficient event emission
- Minimal storage usage

## Development

### Compile Contracts
```bash
npm run build
```

### Run Tests
```bash
npm test
```

### Deploy to Testnet
```bash
npm run deploy
```

### Deploy to Local Network
```bash
npm run deploy:local
```

### Export Addresses
```bash
npm run export
```

## Integration

Import the ABI and contract address in your frontend:

```typescript
import { StakingManagerABI } from "@/packages/contracts/abis/StakingManagerABI";
import { CONTRACTS } from "@/packages/contracts/exported-addresses";

// Use with wagmi or ethers.js
const stakingManager = new Contract(
  CONTRACTS.STAKING_MANAGER,
  StakingManagerABI,
  signer
);
```

## License

MIT
