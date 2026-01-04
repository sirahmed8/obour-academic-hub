import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getPerformance } from "firebase/performance";

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

// Singleton initialization
const app =
  getApps().length > 0
    ? getApp()
    : firebaseConfig.apiKey
      ? initializeApp(firebaseConfig)
      : undefined;

// Basic fail-safe to prevent crash during build if API key is missing
const isInitialized = !!app;

export const auth = isInitialized ? getAuth(app!) : ({} as ReturnType<typeof getAuth>);
export const googleProvider = new GoogleAuthProvider(); // Required by AuthContext
export const db = isInitialized ? getFirestore(app!) : ({} as ReturnType<typeof getFirestore>);
export const rtdb = isInitialized ? getDatabase(app!) : ({} as ReturnType<typeof getDatabase>);
export const storage = isInitialized ? getStorage(app!) : ({} as ReturnType<typeof getStorage>);

// Client-side only services
export let analytics: ReturnType<typeof getAnalytics> | null = null;
export let perf: ReturnType<typeof getPerformance> | null = null;

if (typeof window !== "undefined" && isInitialized) {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app!);
      perf = getPerformance(app!);
    }
  });
}

// Ensure we don't return undefined as default export if possible, or handle it
export default app;
