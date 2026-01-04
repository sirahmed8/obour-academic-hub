"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { User, UserPermission } from "@/types";
import { auth, googleProvider, db } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  const isAdmin = user?.role === "admin" || user?.role === "owner";
  const isOwner = user?.role === "owner";

  // 1. Listen for Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setFirebaseUser(authUser);
      if (authUser) {
        setLoading(true);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Safety Timeout for Loading State
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        if (loading) {
          console.error("Auth loading timed out");
          // Even if timeout happens, we stop loading so user can try again or see error
          setLoading(false);
        }
      }, 10000); // Reduced to 10 seconds
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // 2. Listen for User Document Changes (Live Updates)
  useEffect(() => {
    if (!firebaseUser) return;

    const userDocRef = doc(db, "users", firebaseUser.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();

          // Handle owner email self-promotion
          const isOwnerEmail =
            firebaseUser.email === process.env.NEXT_PUBLIC_OWNER_EMAIL ||
            firebaseUser.email === "a7medorabe7@gmail.com";

          let finalRole = userData?.role;

          // *** THE FIX IS HERE ***
          if (isOwnerEmail && userData?.role !== "owner") {
            console.log("Forcing Owner Role update...");
            // 1. Update DB in background (Fire and Forget - Don't Await Blocking)
            updateDoc(userDocRef, { role: "owner" }).catch((err) =>
              console.error("Error updating owner role:", err)
            );

            // 2. OPTIMISTIC UPDATE: Force local permission immediately so you get in NOW.
            finalRole = "owner";
          }

          // Set user data immediately without waiting for DB confirmation
          if (userData) {
            setUser({
              uid: docSnap.id,
              ...userData,
              role: finalRole, // Use the forced role if applicable
              permissions: (userData.permissions || []) as UserPermission[],
            } as User);
          }
        } else {
          // Create New User Logic
          const isOwnerEmail =
            firebaseUser.email === "a7medorabe7@gmail.com" ||
            firebaseUser.email === process.env.NEXT_PUBLIC_OWNER_EMAIL;

          let role: "student" | "admin" | "owner" = isOwnerEmail ? "owner" : "student";
          let permissions: UserPermission[] = [];

          // Whitelist Check
          if (!isOwnerEmail && firebaseUser.email) {
            try {
              const whitelistDoc = await getDoc(doc(db, "whitelisted_admins", firebaseUser.email));
              if (whitelistDoc.exists()) {
                role = "admin";
                permissions = ["manage_subjects", "manage_resources", "send_notifications"];
              }
            } catch (e) {
              console.error("Error checking whitelist", e);
            }
          }

          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            displayName: firebaseUser.displayName || "New Student",
            role: role,
            permissions: permissions.length > 0 ? permissions : undefined,
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };

          await setDoc(userDocRef, newUser);
          // Don't return here, let the snapshot fire again naturally
          return;
        }

        // Set loading to false purely after processing
        setLoading(false);
      },
      (error) => {
        console.error("Error in user snapshot:", error);
        setLoading(false);
        toast.error(language === "ar" ? "حدث خطأ في تحميل البيانات" : "Error loading user data");
      }
    );

    return () => unsubscribe();
  }, [firebaseUser, language]); // Added language to dependency

  const login = useCallback(async () => {
    if (!auth || !googleProvider) {
      toast.error("Firebase Configuration Error");
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      console.error("Login failed:", error);
      const err = error as { code?: string };
      if (err?.code !== "auth/popup-closed-by-user") {
        toast.error(language === "ar" ? "فشل تسجيل الدخول" : "Login failed");
      }
    }
  }, [language]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      if (!user) return;
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, data);
      setUser((prev) => (prev ? { ...prev, ...data } : null));
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      isOwner,
      login,
      logout,
      updateProfile,
    }),
    [user, loading, isAdmin, isOwner, login, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
