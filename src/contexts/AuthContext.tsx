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
      console.log("Auth State Changed:", authUser?.email);
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
          console.error("Auth loading timed out - Forcing open");
          setLoading(false);
          toast.error("Connection timeout - Please refresh if data is missing");
        }
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // 2. Listen for User Document Changes (Live Updates)
  useEffect(() => {
    if (!firebaseUser) return;

    const userDocRef = doc(db, "users", firebaseUser.uid);

    console.log("Setting up snapshot listener for:", firebaseUser.uid);

    const unsubscribe = onSnapshot(
      userDocRef,
      async (docSnap) => {
        try {
          if (docSnap.exists()) {
            console.log("User document exists");
            const userData = docSnap.data();

            // Handle owner email self-promotion
            const isOwnerEmail =
              firebaseUser.email === process.env.NEXT_PUBLIC_OWNER_EMAIL ||
              firebaseUser.email === "a7medorabe7@gmail.com";

            let finalRole = userData?.role;

            // *** OPTIMISTIC OWNER FIX ***
            if (isOwnerEmail && userData?.role !== "owner") {
              console.log("Forcing Owner Role update (Optimistic)...");

              updateDoc(userDocRef, { role: "owner" }).catch((err) =>
                console.error("Error updating owner role in DB:", err)
              );

              finalRole = "owner";
            }

            // Set user data immediately
            if (userData) {
              setUser({
                uid: docSnap.id,
                ...userData,
                role: finalRole,
                permissions: (userData.permissions || []) as UserPermission[],
              } as User);
            }
          } else {
            console.log("User document does NOT exist - Creating new user...");

            // Create New User Logic
            const isOwnerEmail =
              firebaseUser.email === "a7medorabe7@gmail.com" ||
              firebaseUser.email === process.env.NEXT_PUBLIC_OWNER_EMAIL;

            let role: "student" | "admin" | "owner" = isOwnerEmail ? "owner" : "student";
            let permissions: UserPermission[] = [];

            // Whitelist Check
            if (!isOwnerEmail && firebaseUser.email) {
              try {
                const whitelistDoc = await getDoc(
                  doc(db, "whitelisted_admins", firebaseUser.email)
                );
                if (whitelistDoc.exists()) {
                  role = "admin";
                  permissions = ["manage_subjects", "manage_resources", "send_notifications"];
                }
              } catch (e) {
                console.error("Error checking whitelist", e);
              }
            }

            // *** FIX: Build user object WITHOUT undefined fields ***
            const newUserData: Record<string, unknown> = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "New Student",
              role: role,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            };

            // Only add permissions if not empty
            if (permissions.length > 0) {
              newUserData.permissions = permissions;
            }

            // Only add photoURL if it exists
            if (firebaseUser.photoURL) {
              newUserData.photoURL = firebaseUser.photoURL;
            }

            // Build local user object for immediate use
            const localUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "New Student",
              role: role,
              permissions: permissions.length > 0 ? permissions : undefined,
              photoURL: firebaseUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
            };

            try {
              await setDoc(userDocRef, newUserData);
              console.log("New user document created successfully");
            } catch (createError) {
              console.error("Error creating user document:", createError);
              // CRITICAL: Even if creation fails, set local user so we don't hang!
              setUser(localUser);
            }
          }
        } catch (err) {
          console.error("Unexpected error in snapshot handler:", err);
        } finally {
          console.log("Snapshot processed - Stopping loading");
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error in user snapshot listener:", error);
        setLoading(false);
        toast.error(language === "ar" ? "حدث خطأ في تحميل البيانات" : "Error loading user data");
      }
    );

    return () => unsubscribe();
  }, [firebaseUser, language]);

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
