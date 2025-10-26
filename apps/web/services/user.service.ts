import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserData {
  uid: string;
  email: string;
  createdAt: Timestamp;
}

/**
 * Create a new user document in Firestore
 */
export async function createUserDocument(uid: string, email: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    
    const userData: UserData = {
      uid,
      email,
      createdAt: Timestamp.now(),
    };
    
    await setDoc(userRef, userData);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create user document');
  }
}

/**
 * Get user document from Firestore
 */
export async function getUserDocument(uid: string): Promise<UserData | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    }
    
    return null;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get user document');
  }
}
