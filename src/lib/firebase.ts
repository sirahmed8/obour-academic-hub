import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
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

// Singleton initialization - always initialize when API key is available
let app: FirebaseApp | null;
if (getApps().length > 0) {
  app = getApp();
} else if (firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig);
} else {
  // This should only happen during static build, not at runtime
  console.warn("Firebase API key missing - Firebase services will not be available");
  app = null;
}

// Export Firebase services - these will throw clear errors if app is null
export const auth = app ? getAuth(app) : (null as unknown as ReturnType<typeof getAuth>);
export const googleProvider = new GoogleAuthProvider();
export const db = app ? getFirestore(app) : (null as unknown as ReturnType<typeof getFirestore>);
export const rtdb = app ? getDatabase(app) : (null as unknown as ReturnType<typeof getDatabase>);
export const storage = app ? getStorage(app) : (null as unknown as ReturnType<typeof getStorage>);

// Client-side only services
export let analytics: ReturnType<typeof getAnalytics> | null = null;
export let perf: ReturnType<typeof getPerformance> | null = null;

if (typeof window !== "undefined" && app) {
  isSupported().then((supported) => {
    if (supported && app) {
      analytics = getAnalytics(app);
      perf = getPerformance(app);
    }
  });
}

export default app;
