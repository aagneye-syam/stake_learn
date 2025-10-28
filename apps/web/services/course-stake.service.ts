import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  Timestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Interface for course stake data
 */
export interface CourseStakeData {
  userId: string;           // Wallet address
  courseId: number;         // Course ID
  stakeAmount: string;      // Stake amount in ETH
  totalModules: number;     // Total number of modules in course
  completedModules: number; // Number of modules completed
  isCompleted: boolean;     // Whether the course is completed
  stakedAt: Timestamp;      // When the stake was created
  lastUpdated: Timestamp;   // Last update timestamp
}

/**
 * Generate a unique document ID for course stake
 */
function getCourseStakeId(userId: string, courseId: number): string {
  return `${userId.toLowerCase()}_${courseId}`;
}
