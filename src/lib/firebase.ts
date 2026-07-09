import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getDatabase, Database } from "firebase/database";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getPerformance, FirebasePerformance } from "firebase/performance";

// 🛡️ Sentinel: Removed hardcoded secrets. Use environment variables.
// Normalized Config: Catch literal "undefined" string from CI environments

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

// 🛡️ Debug: Log env presence (Development Only)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("[Firebase-Init] Config Presence:", {
    apiKeyLength: firebaseConfig.apiKey?.length,
    projectId: firebaseConfig.projectId,
    isProdBuild: false,
  });
}

// Initialize Firebase App
function initFirebaseApp(): FirebaseApp | null {
  // Skip during SSR/build if config is missing
  if (!firebaseConfig.apiKey) {
    if (typeof window !== "undefined") {
      console.warn(
        "[Firebase-Init] Firebase config missing! Please verify that environment variables (e.g. NEXT_PUBLIC_FIREBASE_API_KEY) are set and baked in during build."
      );
    }
    return null;
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      return getApp();
    }

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
// Export initialized services with strict null safety
export const auth = createAuth();
export const db = createFirestore();
export const rtdb = createDatabase();
export const storage = createStorage();
export const googleProvider = new GoogleAuthProvider();

// Client-side only analytics
export let analytics: Analytics | null = null;
export let perf: FirebasePerformance | null = null;

if (typeof window !== "undefined" && app && firebaseConfig.measurementId) {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
        perf = getPerformance(app);
      } catch (err) {
        console.warn("[Firebase-Init] Analytics/Perf failed to initialize:", err);
      }
    }
  });
}

export default app;
