import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  Timestamp,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Interface for staking transaction data
 * Collection: stakingTransactions
 */
export interface StakingTransaction {
  // Transaction Details
  transactionHash: string;      // Blockchain transaction hash
  
  // User Details
  userId: string;               // Wallet address (lowercase)
  userEmail?: string;           // User email if available
  userName?: string;            // User name if available
  
  // Course Details
  courseId: number;             // Course ID
  courseName: string;           // Course name/title
  totalModules: number;         // Total number of modules in the course
  
  // Staking Details
  stakeAmount: string;          // Amount staked in ETH
  stakeAmountWei: string;       // Amount in Wei for precision
  network: string;              // Network name (e.g., "sepolia", "mainnet")
  chainId: number;              // Chain ID
  
  // Progress Tracking
  completedModules: number;     // Number of modules completed (initially 0)
  isCompleted: boolean;         // Whether course is completed
  
  // Timestamps
  stakedAt: Timestamp;          // When the transaction was created
  lastActivityAt: Timestamp;    // Last activity (module completion, etc.)
  completedAt?: Timestamp;      // When course was completed
  
  // Status
  status: 'active' | 'completed' | 'refunded';  // Transaction status
}
