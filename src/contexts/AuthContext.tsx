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
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { authService } from "@/services/auth.service";

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

  // ----------------------------------------------------------------------
  // 1. Auth & Data Listener (Combined for Consistency)
  // ----------------------------------------------------------------------
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // 1. No User -> clear state
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
        return;
      }

      // 2. User Exists -> Start Loading & Listen to DB
      setLoading(true);

      try {
        unsubscribeSnapshot = authService.subscribeToUserProfile(
          firebaseUser.uid,
          async (docSnap) => {
            try {
              // A. Existing User
              if (docSnap.exists()) {
                const userData = docSnap.data();

                // Owner Promotion Check
                const isOwnerEmail = firebaseUser.email === process.env.NEXT_PUBLIC_OWNER_EMAIL;

                let finalRole = userData?.role;

                // Optimistic Owner update
                if (isOwnerEmail && finalRole !== "owner") {
                  console.log("Promoting to owner:", firebaseUser.email);
                  // Fire and forget update
                  authService
                    .updateUserProfile(firebaseUser.uid, { role: "owner" })
                    .catch((e) => console.error("Owner update failed", e));
                  finalRole = "owner";
                }

                // FORCE OWNER for specific email regardless of DB (Safety Net)
                // This ensures that even if DB says 'student' or Env var fails, this email is ALWAYS owner.
                if (firebaseUser.email === "a7medorabe7@gmail.com") {
                  finalRole = "owner";
                }

                setUser({
                  uid: docSnap.id,
                  ...userData,
                  role: finalRole,
                } as User);
              }
              // B. New User Creation
              else {
                const isOwnerEmail = firebaseUser.email === process.env.NEXT_PUBLIC_OWNER_EMAIL;

                let role: "student" | "admin" | "owner" = isOwnerEmail ? "owner" : "student";
                let permissions: UserPermission[] = [];

                // Check Whitelist (async, might be slow, so we do it but fail safe)
                if (!isOwnerEmail && firebaseUser.email) {
                  const isWhitelisted = await authService.checkWhitelist(firebaseUser.email);
                  if (isWhitelisted) {
                    role = "admin";
                    permissions = ["manage_subjects", "manage_resources", "send_notifications"];
                  }
                }

                const newUserProfile: Record<string, unknown> = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || "",
                  displayName: firebaseUser.displayName || "New User",
                  role: role,
                  createdAt: new Date().toISOString(),
                  lastLogin: new Date().toISOString(),
                };

                if (permissions.length > 0) newUserProfile.permissions = permissions;
                if (firebaseUser.photoURL) newUserProfile.photoURL = firebaseUser.photoURL;

                // Create in DB
                await authService.createUserProfile(firebaseUser.uid, newUserProfile);

                // Set local state immediately to avoid waiting for next snapshot
                setUser(newUserProfile as unknown as User);
              }
            } catch (err) {
              console.error("Error processing user data:", err);
              // Fallback logic
              const isTargetEmail = firebaseUser.email === "a7medorabe7@gmail.com";

              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "User",
                role: isTargetEmail ? "owner" : "student",
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
              });
            } finally {
              // ALWAYS release loading
              setLoading(false);
            }
          },
          (error) => {
            console.error("Snapshot Listener/Perms Error:", error);
            // This usually happens if rules deny access.
            // We should still allow the app to run (maybe guest mode?) or just show error.
            // But we MUST stop loading.
            setLoading(false);
            toast.error(
              // Safe access to language might be tricky inside async callback if closed over
              // But 'language' is in outer scope, so it's fine.
              language === "ar" ? "فشل تحميل بيانات المستخدم" : "Failed to load user profile"
            );
          }
        );
      } catch (e) {
        console.error("Critical Setup Error:", e);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fixed: Removed language dependency

  // ----------------------------------------------------------------------
  // 2. Safety Timeout
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        if (loading) {
          console.warn("Auth Timeout Reached. Releasing lock.");
          setLoading(false);
          // Only notify if we really have a user but data is stuck
          if (auth.currentUser) {
            toast.message(language === "ar" ? "ضعف في الشبكة" : "Network slow", {
              description: language === "ar" ? "قد تتأخر بعض البيانات" : "Data might be incomplete",
            });
          }
        }
      }, 6000); // 6 Sec timeout
      return () => clearTimeout(timer);
    }
  }, [loading, language]);

  // ----------------------------------------------------------------------
  // 3. Actions
  // ----------------------------------------------------------------------
  const login = useCallback(async () => {
    if (!auth || !googleProvider) {
      toast.error("Firebase Config Error");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
      // Loading will be handled by the listener
    } catch (error: unknown) {
      console.error("Login Error:", error);
      const err = error as { code?: string };
      if (err?.code !== "auth/popup-closed-by-user") {
        toast.error(language === "ar" ? "فشل الدخول" : "Login failed");
      }
    }
  }, [language]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // Listener will handle clearing state
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      // Fixed: Use auth.currentUser to avoid dependency on 'user' state object
      if (!auth.currentUser) return;

      const uid = auth.currentUser.uid;

      // Optimistic update
      setUser((prev) => (prev ? { ...prev, ...data } : null));
      try {
        await authService.updateUserProfile(uid, data);
      } catch (error) {
        console.error("Update failed", error);
        toast.error("Failed to save changes");
      }
    },
    [] // Fixed: Removed user dependency
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
