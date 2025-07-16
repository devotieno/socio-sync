import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Check if we're in a real Firebase environment
const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                             process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && 
                             process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo-api-key";

// Initialize Firebase services with error handling
let auth: any;
let db: any;
let storage: any;
let functions: any;

try {
  if (isFirebaseConfigured) {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);
  } else {
    console.warn('⚠️  Firebase not configured - using demo mode. Please set up your Firebase environment variables in .env.local');
    // Create minimal mock objects for development
    auth = {
      currentUser: null,
      onAuthStateChanged: () => () => {},
      signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
      createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
      signOut: () => Promise.resolve(),
    };
    db = {
      collection: () => ({
        doc: () => ({
          set: () => Promise.resolve(),
          get: () => Promise.resolve({ exists: false, data: () => null }),
        }),
        add: () => Promise.resolve({ id: 'demo-id' }),
        where: () => ({
          get: () => Promise.resolve({ docs: [] }),
        }),
      }),
    };
    storage = {
      ref: () => ({
        put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('demo-url') } }),
      }),
    };
    functions = {
      httpsCallable: () => () => Promise.resolve({ data: {} }),
    };
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { auth, db, storage, functions };

export default app;
