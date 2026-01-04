import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getDatabase, Database } from "firebase/database";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getPerformance, FirebasePerformance } from "firebase/performance";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDSJeoNeXeGF8OegC5xp2AHQ2qmUWjq_OE",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "obour-institutes-a607d.firebaseapp.com",
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    "https://obour-institutes-a607d-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "obour-institutes-a607d",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "obour-institutes-a607d.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "761134603194",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:761134603194:web:a434d916518caa86935b83",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-6KWJB42P4N",
};

// Initialize Firebase App
function initFirebaseApp(): FirebaseApp | null {
  // Skip during SSR/build if config is missing
  if (!firebaseConfig.apiKey) {
    return null;
  }

  try {
    return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
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
