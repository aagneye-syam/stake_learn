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

/**
 * Get user details from users collection
 */
async function getUserDetails(userId: string): Promise<{ email?: string; name?: string }> {
  try {
    if (!db) return {};
    
    const userRef = doc(db, 'users', userId.toLowerCase());
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return {
        email: userData.email,
        name: userData.name
      };
    }
    
    return {};
  } catch (error) {
    console.error('Error fetching user details:', error);
    return {};
  }
}

/**
 * Create a new staking transaction record
 * This is called after successful blockchain transaction
 */
export async function createStakingTransaction(
  transactionHash: string,
  userId: string,
  courseId: number,
  stakeAmount: string,
  stakeAmountWei: string,
  network: string,
  chainId: number
): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    // Get course data
    const courseData = getCourseData(courseId);
    if (!courseData) {
      throw new Error(`Course ${courseId} not found in courses data`);
    }

    // Get user details
    const userDetails = await getUserDetails(userId);

    // Create transaction document
    const transactionId = getStakingTransactionId(transactionHash);
    const transactionRef = doc(db, 'stakingTransactions', transactionId);

    // Check if transaction already exists
    const existingTransaction = await getDoc(transactionRef);
    if (existingTransaction.exists()) {
      console.log('Transaction already exists:', transactionId);
      return; // Don't create duplicate
    }

    const transactionData: StakingTransaction = {
      // Transaction Details
      transactionHash: transactionHash.toLowerCase(),
      
      // User Details
      userId: userId.toLowerCase(),
      userEmail: userDetails.email,
      userName: userDetails.name,
      
      // Course Details
      courseId,
      courseName: courseData.title,
      totalModules: courseData.modules,
      
      // Staking Details
      stakeAmount,
      stakeAmountWei,
      network,
      chainId,
      
      // Progress Tracking
      completedModules: 0,
      isCompleted: false,
      
      // Timestamps
      stakedAt: Timestamp.now(),
      lastActivityAt: Timestamp.now(),
      
      // Status
      status: 'active'
    };

    await setDoc(transactionRef, transactionData);
    console.log('Staking transaction created:', transactionId);
  } catch (error: any) {
    console.error('Error creating staking transaction:', error);
    throw new Error(error.message || 'Failed to create staking transaction');
  }
}

/**
 * Get staking transaction by transaction hash
 */
export async function getStakingTransactionByHash(
  transactionHash: string
): Promise<StakingTransaction | null> {
  try {
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    const transactionId = getStakingTransactionId(transactionHash);
    const transactionRef = doc(db, 'stakingTransactions', transactionId);
    const transactionSnap = await getDoc(transactionRef);

    if (transactionSnap.exists()) {
      return transactionSnap.data() as StakingTransaction;
    }

    return null;
  } catch (error: any) {
    console.error('Error getting staking transaction:', error);
    throw new Error(error.message || 'Failed to get staking transaction');
  }
}

/**
 * Get all staking transactions for a user
 */
export async function getUserStakingTransactions(
  userId: string
): Promise<StakingTransaction[]> {
  try {
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    const transactionsRef = collection(db, 'stakingTransactions');
    const q = query(
      transactionsRef, 
      where('userId', '==', userId.toLowerCase()),
      orderBy('stakedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const transactions: StakingTransaction[] = [];
    querySnapshot.forEach((doc) => {
      transactions.push(doc.data() as StakingTransaction);
    });

    return transactions;
  } catch (error: any) {
    console.error('Error getting user staking transactions:', error);
    throw new Error(error.message || 'Failed to get user staking transactions');
  }
}

/**
 * Get staking transaction for a specific user and course
 */
export async function getUserCourseTransaction(
  userId: string,
  courseId: number
): Promise<StakingTransaction | null> {
  try {
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    const transactionsRef = collection(db, 'stakingTransactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId.toLowerCase()),
      where('courseId', '==', courseId),
      orderBy('stakedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Return the most recent transaction for this user/course combo
      return querySnapshot.docs[0].data() as StakingTransaction;
    }

    return null;
  } catch (error: any) {
    console.error('Error getting user course transaction:', error);
    throw new Error(error.message || 'Failed to get user course transaction');
  }
}

/**
 * Update module completion progress for a transaction
 */
export async function updateTransactionModuleProgress(
  transactionHash: string,
  completedModules: number
): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    const transactionId = getStakingTransactionId(transactionHash);
    const transactionRef = doc(db, 'stakingTransactions', transactionId);

    const transactionSnap = await getDoc(transactionRef);
    if (!transactionSnap.exists()) {
      throw new Error('Transaction not found');
    }

    const updateData: any = {
      completedModules,
      lastActivityAt: Timestamp.now()
    };

    await setDoc(transactionRef, updateData, { merge: true });
    console.log('Transaction module progress updated:', transactionId, completedModules);
  } catch (error: any) {
    console.error('Error updating transaction module progress:', error);
    throw new Error(error.message || 'Failed to update transaction module progress');
  }
}

/**
 * Mark transaction as completed
 */
export async function markTransactionCompleted(
  transactionHash: string
): Promise<void> {
  try {
    if (!db) {
      throw new Error('Firebase is not initialized');
    }

    const transactionId = getStakingTransactionId(transactionHash);
    const transactionRef = doc(db, 'stakingTransactions', transactionId);

    const transactionSnap = await getDoc(transactionRef);
    if (!transactionSnap.exists()) {
      throw new Error('Transaction not found');
    }

    const transaction = transactionSnap.data() as StakingTransaction;

    // Validate all modules are completed
    if (transaction.completedModules !== transaction.totalModules) {
      throw new Error('Cannot mark as completed - not all modules finished');
    }

    const updateData: any = {
      isCompleted: true,
      status: 'completed',
      completedAt: Timestamp.now(),
      lastActivityAt: Timestamp.now()
    };

    await setDoc(transactionRef, updateData, { merge: true });
    console.log('Transaction marked as completed:', transactionId);
  } catch (error: any) {
    console.error('Error marking transaction completed:', error);
    throw new Error(error.message || 'Failed to mark transaction completed');
  }
}

/**
 * Check if user has staked a specific course
 * Returns true if active or completed stake exists
 */
export async function hasUserStakedCourse(
  userId: string,
  courseId: number
): Promise<boolean> {
  try {
    const transaction = await getUserCourseTransaction(userId, courseId);
    return transaction !== null && (transaction.status === 'active' || transaction.status === 'completed');
  } catch (error: any) {
    console.error('Error checking if user staked course:', error);
    return false;
  }
}
