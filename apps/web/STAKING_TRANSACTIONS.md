# Staking Transactions Collection

## Overview
The `stakingTransactions` collection stores comprehensive transaction records for all course stakes, including blockchain transaction details, user information, and progress tracking.

## Collection: `stakingTransactions`

### Document ID Format
`{transactionHash}` - The blockchain transaction hash (lowercase)

### Document Structure

```typescript
{
  // Transaction Details
  transactionHash: string;      // Blockchain transaction hash (unique ID)
  
  // User Details
  userId: string;               // Wallet address (lowercase)
  userEmail?: string;           // User email from users collection
  userName?: string;            // User name from users collection
  
  // Course Details
  courseId: number;             // Course ID (1-6)
  courseName: string;           // Course title
  totalModules: number;         // Total modules (from courses data)
  
  // Staking Details
  stakeAmount: string;          // Amount in ETH (e.g., "0.0001")
  stakeAmountWei: string;       // Amount in Wei for precision
  network: string;              // Network name (sepolia, mainnet, etc.)
  chainId: number;              // Chain ID (11155111, 1, etc.)
  
  // Progress Tracking
  completedModules: number;     // Modules completed (0 to totalModules)
  isCompleted: boolean;         // Course completion status
  
  // Timestamps
  stakedAt: Timestamp;          // Transaction creation time
  lastActivityAt: Timestamp;    // Last update (module completion, etc.)
  completedAt?: Timestamp;      // Course completion time
  
  // Status
  status: 'active' | 'completed' | 'refunded';
}
```

## Courses Data

The service includes a lookup table for all courses:

```typescript
{
  1: { id: 1, title: "HTML & CSS Fundamentals", modules: 4 },
  2: { id: 2, title: "Solidity Smart Contracts", modules: 4 },
  3: { id: 3, title: "Rust Programming", modules: 4 },
  4: { id: 4, title: "React & Next.js", modules: 4 },
  5: { id: 5, title: "Web3 & DApp Development", modules: 4 },
  6: { id: 6, title: "Python for Data Science", modules: 4 }
}
```

## Service Functions

### Transaction Creation
```typescript
createStakingTransaction(
  transactionHash: string,
  userId: string,
  courseId: number,
  stakeAmount: string,
  stakeAmountWei: string,
  network: string,
  chainId: number
): Promise<void>
```
**When:** Called after successful blockchain transaction
**Creates:** New document with transaction hash as ID, completedModules: 0

### Get Transaction
```typescript
getStakingTransactionByHash(transactionHash: string): Promise<StakingTransaction | null>
```
**Purpose:** Retrieve transaction by blockchain hash

### Get User Transactions
```typescript
getUserStakingTransactions(userId: string): Promise<StakingTransaction[]>
```
**Purpose:** Get all transactions for a user (ordered by date, newest first)

### Get User Course Transaction
```typescript
getUserCourseTransaction(userId: string, courseId: number): Promise<StakingTransaction | null>
```
**Purpose:** Get the most recent transaction for a user + course combination
**Use Case:** Check if user has staked a specific course

### Update Progress
```typescript
updateTransactionModuleProgress(transactionHash: string, completedModules: number): Promise<void>
```
**When:** User completes a module
**Updates:** completedModules count, lastActivityAt timestamp

### Mark Completed
```typescript
markTransactionCompleted(transactionHash: string): Promise<void>
```
**When:** User completes final module
**Updates:** isCompleted: true, status: 'completed', completedAt timestamp
**Validates:** All modules must be completed

### Check Staking Status
```typescript
hasUserStakedCourse(userId: string, courseId: number): Promise<boolean>
```
**Purpose:** Quick check if user has active or completed stake

## Integration Flow

### 1. User Stakes Course
```typescript
// In StakingButton.tsx after successful blockchain transaction
if (isSuccess && hash) {
  await createStakingTransaction(
    hash,                    // Transaction hash
    address,                 // User wallet
    courseId,               // Course ID
    "0.0001",               // ETH amount
    "100000000000000",      // Wei amount
    "sepolia",              // Network
    11155111                // Chain ID
  );
}
```

### 2. Check if User Has Staked
```typescript
// In any component
const transaction = await getUserCourseTransaction(walletAddress, courseId);
if (transaction) {
  console.log('User has staked:', transaction.stakeAmount);
  console.log('Progress:', transaction.completedModules, '/', transaction.totalModules);
}
```

### 3. Update Module Progress
```typescript
// In useModuleProgress hook after module completion
const transaction = await getUserCourseTransaction(address, courseId);
if (transaction) {
  await updateTransactionModuleProgress(
    transaction.transactionHash,
    completedModules
  );
}
```

### 4. Complete Course
```typescript
// In useModuleProgress when all modules done
const transaction = await getUserCourseTransaction(address, courseId);
if (transaction) {
  await markTransactionCompleted(transaction.transactionHash);
}
```

## Helper Hook

### useStakingStatus
```typescript
const {
  hasStaked,           // boolean
  transaction,         // StakingTransaction | null
  loading,            // boolean
  completedModules,   // number
  totalModules,       // number
  isCompleted,        // boolean
  progressPercentage  // number (0-100)
} = useStakingStatus(walletAddress, courseId);
```

**Usage Example:**
```typescript
const { hasStaked, progressPercentage } = useStakingStatus(address, 1);

if (hasStaked) {
  return <div>Progress: {progressPercentage}%</div>;
}
```

## Firestore Queries

### Get all user stakes
```
Collection: stakingTransactions
Filter: userId == "0x..."
Order: stakedAt DESC
```

### Get active courses
```
Collection: stakingTransactions
Filter: userId == "0x..." AND status == "active"
```

### Get completed courses
```
Collection: stakingTransactions
Filter: userId == "0x..." AND isCompleted == true
```

### Get course-specific stakes
```
Collection: stakingTransactions
Filter: courseId == 1
Order: stakedAt DESC
```

## Benefits Over courseStakes Collection

1. **Transaction Hash**: Unique blockchain identifier
2. **User Details**: Stores email and name for easy reference
3. **Course Name**: Includes course title, not just ID
4. **Network Info**: Tracks which network transaction occurred on
5. **Wei Precision**: Stores exact amount in Wei
6. **Activity Tracking**: lastActivityAt for any update
7. **Completion Time**: Exact timestamp when course finished

## Future Use Cases

- **Dashboard**: Show all user's staked courses with progress
- **Analytics**: Track which courses are most popular
- **Refunds**: Update status to 'refunded' if user withdraws stake
- **Rewards**: Reference transaction for reward distribution
- **Certificates**: Link certificate to transaction hash
- **Leaderboard**: Query fastest completions by (completedAt - stakedAt)
