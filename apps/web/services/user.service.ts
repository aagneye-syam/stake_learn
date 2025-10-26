import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserData {
  walletAddress: string;
  name: string;
  email: string;
  createdAt: Timestamp;
  lastLogin?: Timestamp;
}

/**
 * Create a new user document in Firestore with wallet address as primary key
 */
export async function createWalletUser(
  walletAddress: string, 
  name: string, 
  email: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', walletAddress.toLowerCase());
    
    const userData: UserData = {
      walletAddress: walletAddress.toLowerCase(),
      name,
      email,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
    };
    
    await setDoc(userRef, userData);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create user document');
  }
}

/**
 * Get user document by wallet address
 */
export async function getUserByWallet(walletAddress: string): Promise<UserData | null> {
  try {
    const userRef = doc(db, 'users', walletAddress.toLowerCase());
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    }
    
    return null;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get user document');
  }
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(walletAddress: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', walletAddress.toLowerCase());
    await setDoc(userRef, { lastLogin: Timestamp.now() }, { merge: true });
  } catch (error: any) {
    console.error('Failed to update last login:', error);
  }
}

// Legacy functions kept for backward compatibility
export interface LegacyUserData {
  uid: string;
  email: string;
  createdAt: Timestamp;
}

export async function createUserDocument(uid: string, email: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    
    const userData: LegacyUserData = {
      uid,
      email,
      createdAt: Timestamp.now(),
    };
    
    await setDoc(userRef, userData);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create user document');
  }
}

export async function getUserDocument(uid: string): Promise<LegacyUserData | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as LegacyUserData;
    }
    
    return null;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get user document');
  }
}

