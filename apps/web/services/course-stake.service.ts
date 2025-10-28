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

/**
 * Create a new course stake when user stakes a course
 */
export async function createCourseStake(
  userId: string,
  courseId: number,
  stakeAmount: string,
  totalModules: number
): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    const stakeId = getCourseStakeId(userId, courseId);
    const stakeRef = doc(db, 'courseStakes', stakeId);
    
    // Check if stake already exists
    const existingStake = await getDoc(stakeRef);
    if (existingStake.exists()) {
      throw new Error('Course already staked by this user');
    }

    const stakeData: CourseStakeData = {
      userId: userId.toLowerCase(),
      courseId,
      stakeAmount,
      totalModules,
      completedModules: 0,
      isCompleted: false,
      stakedAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
    };
    
    await setDoc(stakeRef, stakeData);
    console.log('Course stake created:', stakeId);
  } catch (error: any) {
    console.error('Error creating course stake:', error);
    throw new Error(error.message || 'Failed to create course stake');
  }
}

/**
 * Get course stake data for a specific user and course
 */
export async function getCourseStake(
  userId: string,
  courseId: number
): Promise<CourseStakeData | null> {
  try {
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    const stakeId = getCourseStakeId(userId, courseId);
    const stakeRef = doc(db, 'courseStakes', stakeId);
    const stakeSnap = await getDoc(stakeRef);
    
    if (stakeSnap.exists()) {
      return stakeSnap.data() as CourseStakeData;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error getting course stake:', error);
    throw new Error(error.message || 'Failed to get course stake');
  }
}

/**
 * Update completed modules count for a course stake
 */
export async function updateModuleCompletion(
  userId: string,
  courseId: number,
  completedModules: number
): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    const stakeId = getCourseStakeId(userId, courseId);
    const stakeRef = doc(db, 'courseStakes', stakeId);
    
    // Verify stake exists
    const stakeSnap = await getDoc(stakeRef);
    if (!stakeSnap.exists()) {
      throw new Error('Course stake not found');
    }

    await updateDoc(stakeRef, {
      completedModules,
      lastUpdated: Timestamp.now(),
    });
    
    console.log('Module completion updated:', stakeId, completedModules);
  } catch (error: any) {
    console.error('Error updating module completion:', error);
    throw new Error(error.message || 'Failed to update module completion');
  }
}

/**
 * Mark course as completed
 */
export async function markCourseCompleted(
  userId: string,
  courseId: number
): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    const stakeId = getCourseStakeId(userId, courseId);
    const stakeRef = doc(db, 'courseStakes', stakeId);
    
    // Verify stake exists
    const stakeSnap = await getDoc(stakeRef);
    if (!stakeSnap.exists()) {
      throw new Error('Course stake not found');
    }

    const stakeData = stakeSnap.data() as CourseStakeData;
    
    // Verify all modules are completed
    if (stakeData.completedModules !== stakeData.totalModules) {
      throw new Error('Not all modules are completed');
    }

    await updateDoc(stakeRef, {
      isCompleted: true,
      lastUpdated: Timestamp.now(),
    });
    
    console.log('Course marked as completed:', stakeId);
  } catch (error: any) {
    console.error('Error marking course completed:', error);
    throw new Error(error.message || 'Failed to mark course completed');
  }
}
