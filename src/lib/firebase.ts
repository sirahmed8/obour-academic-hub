import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getDatabase, Database } from "firebase/database";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getPerformance, FirebasePerformance } from "firebase/performance";

// Fallback config for Vercel / deployment environments if env vars are missing or stale
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDtRfBzbvqDaM8pmVX1xNCXm08gR0BXeIU",
  authDomain: "obourinstitutes1.firebaseapp.com",
  databaseURL: "https://obourinstitutes1-default-rtdb.firebaseio.com",
  projectId: "obourinstitutes1",
  storageBucket: "obourinstitutes1.firebasestorage.app",
  messagingSenderId: "944853182691",
  appId: "1:944853182691:web:4d566fc0f38642945f7dd6",
  measurementId: "G-6C02NNNYHE",
};

const isTest = process.env.NODE_ENV === "test";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    (isTest ? undefined : DEFAULT_FIREBASE_CONFIG.apiKey),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || DEFAULT_FIREBASE_CONFIG.databaseURL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
};

// Debug: Log env presence (Development Only)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("[Firebase-Init] Config Presence:", {
    apiKeyLength: firebaseConfig.apiKey?.length,
    projectId: firebaseConfig.projectId,
    isProdBuild: false,
  });
}

// Initialize Firebase App
function initFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey) {
    if (typeof window !== "undefined") {
      console.warn("[Firebase-Init] Firebase config missing! Please verify environment variables.");
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

export const auth = createAuth();
export const db = createFirestore();
export const rtdb = createDatabase();
export const storage = createStorage();
export const googleProvider = new GoogleAuthProvider();

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
