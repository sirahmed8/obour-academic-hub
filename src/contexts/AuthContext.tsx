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
import { User } from "@/types";
import { auth, googleProvider, db } from "@/lib/firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

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
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  const isAdmin = user?.role === "admin" || user?.role === "owner";
  const isOwner = user?.role === "owner";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            // Check if user is owner
            if (
              firebaseUser.email === process.env.NEXT_PUBLIC_OWNER_EMAIL ||
              firebaseUser.email === "a7medorabe7@gmail.com"
            ) {
              userData.role = "owner";
              // Update last login and ensure role is synced to DB
              await updateDoc(userDocRef, {
                lastLogin: new Date().toISOString(),
                role: "owner",
              });
            } else {
              // Update last login only
              await updateDoc(userDocRef, {
                lastLogin: new Date().toISOString(),
              });
            }
            setUser(userData);
          } else {
            // Create new user
            const isOwnerEmail = firebaseUser.email === "a7medorabe7@gmail.com";
            let role: "student" | "admin" | "owner" = isOwnerEmail
              ? "owner"
              : "student";
            let permissions: string[] = [];

            // Check if whitelisted
            if (!isOwnerEmail && firebaseUser.email) {
              try {
                const whitelistDoc = await getDoc(
                  doc(db, "whitelisted_admins", firebaseUser.email)
                );
                if (whitelistDoc.exists()) {
                  role = "admin";
                  // Assign default permissions
                  permissions = [
                    "manage_subjects",
                    "manage_resources",
                    "send_notifications",
                  ];
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
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const login = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: unknown) {
      console.error("Login failed:", error);
      // Cast error to any safely to check code property since FirebaseError isn't easily imported as type here without more changes
      const err = error as { code?: string };
      if (err?.code === "auth/unauthorized-domain") {
        toast.error(
          language === "ar"
            ? "نطاق غير مصرح به. يرجى إضافته في Firebase."
            : "Unauthorized Domain. Please add to Firebase Console."
        );
      } else if (err?.code === "auth/popup-closed-by-user") {
        toast.warning(
          language === "ar" ? "تم إغلاق النافذة" : "Login popup closed"
        );
      } else {
        toast.error(
          language === "ar"
            ? "فشل تسجيل الدخول"
            : "Login failed. Check console."
        );
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
