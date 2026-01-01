import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getPerformance } from "firebase/performance";

const firebaseConfig = {
  apiKey: "AIzaSyDSJeoNeXeGF8OegC5xp2AHQ2qmUWjq_OE",
  authDomain: "obour-institutes-a607d.firebaseapp.com",
  databaseURL: "https://obour-institutes-a607d-default-rtdb.firebaseio.com",
  projectId: "obour-institutes-a607d",
  storageBucket: "obour-institutes-a607d.firebasestorage.app",
  messagingSenderId: "761134603194",
  appId: "1:761134603194:web:a434d916518caa86935b83",
  measurementId: "G-6KWJB42P4N",
};

// Singleton initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); // Required by AuthContext
export const db = getFirestore(app);
export const rtdb = getDatabase(app); // For Presence/Online status
export const storage = getStorage(app);

// Client-side only services
export let analytics: ReturnType<typeof getAnalytics> | null = null;
export let perf: ReturnType<typeof getPerformance> | null = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      perf = getPerformance(app);
    }
  });
}

export default app;
