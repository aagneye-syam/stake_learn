import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CourseStake {
  id?: string; // Firestore document ID
  userId: string; // Wallet address
  courseId: string;
  stakeAmount: string; // In ETH as string to preserve precision
  totalModules: number;
  completedModules: number;
  isCourseCompleted: boolean;
  stakedAt: Timestamp;
  completedAt?: Timestamp;
  transactionHash?: string;
}

const COLLECTION_NAME = 'courseStakes';

/**
 * Create a new course stake record
 */
export async function createCourseStake(
  userId: string,
  courseId: string,
  stakeAmount: string,
  totalModules: number,
  transactionHash?: string
): Promise<CourseStake> {
  try {
    // Create a composite ID from userId and courseId
    const docId = `${userId}_${courseId}`;
    
    const stakeData: CourseStake = {
      userId,
      courseId,
      stakeAmount,
      totalModules,
      completedModules: 0,
      isCourseCompleted: false,
      stakedAt: Timestamp.now(),
      transactionHash,
    };

    const docRef = doc(db, COLLECTION_NAME, docId);
    await setDoc(docRef, stakeData);

    return { ...stakeData, id: docId };
  } catch (error) {
    console.error('Error creating course stake:', error);
    throw error;
  }
}

/**
 * Get a course stake by userId and courseId
 */
export async function getCourseStake(
  userId: string,
  courseId: string
): Promise<CourseStake | null> {
  try {
    const docId = `${userId}_${courseId}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as CourseStake;
    }
    return null;
  } catch (error) {
    console.error('Error getting course stake:', error);
    throw error;
  }
}

/**
 * Get all course stakes for a user
 */
export async function getUserCourseStakes(userId: string): Promise<CourseStake[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as CourseStake[];
  } catch (error) {
    console.error('Error getting user course stakes:', error);
    throw error;
  }
}

/**
 * Update completed modules count
 */
export async function updateCompletedModules(
  userId: string,
  courseId: string,
  completedModules: number
): Promise<void> {
  try {
    const docId = `${userId}_${courseId}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    
    await updateDoc(docRef, {
      completedModules,
    });
  } catch (error) {
    console.error('Error updating completed modules:', error);
    throw error;
  }
}

/**
 * Mark course as completed
 */
export async function markCourseCompleted(
  userId: string,
  courseId: string
): Promise<void> {
  try {
    const docId = `${userId}_${courseId}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    
    await updateDoc(docRef, {
      isCourseCompleted: true,
      completedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error marking course as completed:', error);
    throw error;
  }
}

/**
 * Delete a course stake (admin function or if user unstakes)
 */
export async function deleteCourseStake(
  userId: string,
  courseId: string
): Promise<void> {
  try {
    const docId = `${userId}_${courseId}`;
    const docRef = doc(db, COLLECTION_NAME, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting course stake:', error);
    throw error;
  }
}

/**
 * Check if user has staked for a course
 */
export async function hasUserStakedCourse(
  userId: string,
  courseId: string
): Promise<boolean> {
  try {
    const stake = await getCourseStake(userId, courseId);
    return stake !== null;
  } catch (error) {
    console.error('Error checking if user has staked:', error);
    return false;
  }
}

/**
 * Get course progress percentage
 */
export async function getCourseProgress(
  userId: string,
  courseId: string
): Promise<number> {
  try {
    const stake = await getCourseStake(userId, courseId);
    if (!stake || stake.totalModules === 0) return 0;
    
    return (stake.completedModules / stake.totalModules) * 100;
  } catch (error) {
    console.error('Error getting course progress:', error);
    return 0;
  }
}
