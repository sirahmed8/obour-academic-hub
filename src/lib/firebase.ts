import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getDatabase, Database } from "firebase/database";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getPerformance, FirebasePerformance } from "firebase/performance";

// 🛡️ Sentinel: Removed hardcoded secrets. Use environment variables.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App
function initFirebaseApp(): FirebaseApp | null {
  // Skip during SSR/build if config is missing
  if (!firebaseConfig.apiKey) {
    // Log which values are missing for debugging
    if (typeof window !== "undefined") {
      console.error("Firebase config missing. Check environment variables:", {
        apiKey: !!firebaseConfig.apiKey,
        authDomain: !!firebaseConfig.authDomain,
        projectId: !!firebaseConfig.projectId,
        appId: !!firebaseConfig.appId,
      });
    }
    return null;
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      return getApp();
    }
    console.log("Initializing Firebase with project:", firebaseConfig.projectId);
    return initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    return null;
  }
}

const app = initFirebaseApp();

// Create service getters that handle null app gracefully
function createAuth(): Auth | null {
  if (!app) return null;
  try {
    return getAuth(app);
  } catch {
    return null;
  }
}

function createFirestore(): Firestore | null {
  if (!app) return null;
  try {
    return getFirestore(app);
  } catch {
    return null;
  }
}

function createDatabase(): Database | null {
  if (!app) return null;
  try {
    return getDatabase(app);
  } catch {
    return null;
  }
}

function createStorage(): FirebaseStorage | null {
  if (!app) return null;
  try {
    return getStorage(app);
  } catch {
    return null;
  }
}

// Export initialized services
export const auth = createAuth() as Auth;
export const db = createFirestore() as Firestore;
export const rtdb = createDatabase() as Database;
export const storage = createStorage() as FirebaseStorage;
export const googleProvider = new GoogleAuthProvider();

// Client-side only analytics
export let analytics: Analytics | null = null;
export let perf: FirebasePerformance | null = null;

if (typeof window !== "undefined" && app) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      perf = getPerformance(app);
    }
  });
}

export default app;
