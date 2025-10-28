# Course Stake Feature

## Overview
This feature tracks user course stakes in Firestore, storing information about staked courses, progress, and completion status.

## Firestore Collection: `courseStakes`

### Document Structure
Each document is identified by: `{walletAddress}_{courseId}`

```typescript
{
  userId: string;           // Wallet address (lowercase)
  courseId: number;         // Course ID
  stakeAmount: string;      // Stake amount in ETH
  totalModules: number;     // Total number of modules in course
  completedModules: number; // Number of modules completed
  isCompleted: boolean;     // Whether the course is completed
  stakedAt: Timestamp;      // When the stake was created
  lastUpdated: Timestamp;   // Last update timestamp
}
```

## Service Functions

### `createCourseStake(userId, courseId, stakeAmount, totalModules)`
Creates a new course stake record when a user stakes ETH for a course.

**Called by:** `StakingButton` component after successful blockchain transaction

### `getCourseStake(userId, courseId)`
Retrieves the course stake data for a specific user and course.

**Usage:** Check if a user has staked a course and view their progress

### `updateModuleCompletion(userId, courseId, completedModules)`
Updates the number of completed modules for a course.

**Called by:** `useModuleProgress` hook when a module is completed

### `markCourseCompleted(userId, courseId)`
Marks a course as completed. Validates that all modules are completed.

**Called by:** `useModuleProgress` hook when the last module is completed

### `getUserCourseStakes(userId)`
Gets all course stakes for a specific user.

**Usage:** Display user's enrolled courses on dashboard

## Integration Points

1. **StakingButton Component** (`_components/StakingButton.tsx`)
   - Creates Firestore record after successful stake transaction
   - Passes `totalModules` prop from course data

2. **useModuleProgress Hook** (`hooks/useModuleProgress.ts`)
   - Updates `completedModules` count when modules are completed
   - Marks course as completed when all modules are done

3. **Course Detail Page** (`app/(routes)/courses/[id]/page.tsx`)
   - Passes course metadata (totalModules) to components

## Workflow

1. **User Stakes Course**
   - User clicks "Stake & Start Learning" button
   - Blockchain transaction is executed
   - On success, Firestore record is created via `createCourseStake()`
   - Record includes: userId, courseId, stakeAmount, totalModules, 0 completed modules

2. **User Completes Modules**
   - User completes a module
   - `useModuleProgress` hook calls API to mint DataCoins
   - On success, `updateModuleCompletion()` updates the count in Firestore

3. **Course Completion**
   - When last module is completed
   - `markCourseCompleted()` validates all modules are done
   - Sets `isCompleted: true` in Firestore
   - Certificate is generated and stored on Lighthouse IPFS

## Database Queries

### Get user's staked courses
```typescript
const stakes = await getUserCourseStakes(walletAddress);
```

### Check if user staked a course
```typescript
const stake = await getCourseStake(walletAddress, courseId);
const hasStaked = stake !== null;
```

### Get course progress
```typescript
const stake = await getCourseStake(walletAddress, courseId);
const progress = stake ? (stake.completedModules / stake.totalModules) * 100 : 0;
```

## Future Enhancements

- [ ] Add course start date tracking
- [ ] Track time spent per module
- [ ] Add course rating/feedback after completion
- [ ] Implement course expiration/deadline tracking
- [ ] Add streak tracking for consecutive module completions
