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

/**
 * Interface for course data from courses table
 */
export interface CourseData {
  id: number;
  title: string;
  modules: number;  // Total number of modules
}

/**
 * Courses lookup table
 * This matches the courses in your app
 */
const COURSES_DATA: { [key: number]: CourseData } = {
  1: { id: 1, title: "HTML & CSS Fundamentals", modules: 4 },
  2: { id: 2, title: "Solidity Smart Contracts", modules: 4 },
  3: { id: 3, title: "Rust Programming", modules: 4 },
  4: { id: 4, title: "React & Next.js", modules: 4 },
  5: { id: 5, title: "Web3 & DApp Development", modules: 4 },
  6: { id: 6, title: "Python for Data Science", modules: 4 },
};

/**
 * Get course data by ID
 */
export function getCourseData(courseId: number): CourseData | null {
  return COURSES_DATA[courseId] || null;
}

/**
 * Generate document ID for staking transaction
 * Format: transactionHash (unique blockchain identifier)
 */
function getStakingTransactionId(transactionHash: string): string {
  return transactionHash.toLowerCase();
}
