import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase is already initialized
let app;
let db;
let auth;

try {
  // Only initialize if not already initialized and config is valid
  if (getApps().length === 0 && firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } else if (getApps().length > 0) {
    // Use existing app
    app = getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
  } else {
    // Create mock objects for build time
    console.warn('Firebase configuration incomplete, using mock objects');
    db = null;
    auth = null;
    app = null;
  }
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  // Create mock objects for build time
  db = null;
  auth = null;
  app = null;
}

export { db, auth };
export default app;
