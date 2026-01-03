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

  // 2. Listen for User Document Changes (Live Updates)
  useEffect(() => {
    if (!firebaseUser) return;

    const userDocRef = doc(db, "users", firebaseUser.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData) {
            setUser({
              uid: docSnap.id,
              ...userData,
              permissions: (userData.permissions || []) as UserPermission[],
            } as User);
          }
          if (
            firebaseUser.email === process.env.NEXT_PUBLIC_OWNER_EMAIL ||
            firebaseUser.email === "a7medorabe7@gmail.com"
          ) {
            if (userData?.role !== "owner") {
              await updateDoc(userDocRef, { role: "owner" }); // Will trigger snapshot again
              return;
            }
          }
          // Removed redundant setUser here
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
          // Snapshot will fire again with the new user
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error in user snapshot:", error);
        setLoading(false);
      }
    );

    // Update lastLogin on initial load (optional, to avoid loop, we do it separately or just let it be)
    // To be safe and avoid infinite loops with snapshot, we can update lastLogin ONLY if it's old?
    // For now, let's skip automatic lastLogin update on EVERY session to avoid write-loop if we included it in snapshot trigger?
    // Actually, updating lastLogin causes a write -> snapshot -> update -> write loop if we are not careful.
    // The previous code verified existence then updated.
    // We can interact with DB once here.
    updateDoc(userDocRef, {
      lastLogin: new Date().toISOString(),
    }).catch(() => {}); // catch error if doc doesn't exist yet (handled in create)

    return () => unsubscribe();
  }, [firebaseUser]);

  const login = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      console.error("Login failed:", error);
      const err = error as { code?: string };
      if (err?.code === "auth/unauthorized-domain") {
        toast.error(
          language === "ar"
            ? "نطاق غير مصرح به. يرجى إضافته في Firebase."
            : "Unauthorized Domain. Please add to Firebase Console."
        );
      } else if (err?.code === "auth/popup-closed-by-user") {
        toast.warning(language === "ar" ? "تم إغلاق النافذة" : "Login popup closed");
      } else {
        toast.error(language === "ar" ? "فشل تسجيل الدخول" : "Login failed. Check console.");
      }
      throw error;
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
