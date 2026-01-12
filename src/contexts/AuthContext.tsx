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
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { authService } from "@/services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasPermission: (permission: UserPermission) => boolean;
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

                // Sync photoURL from Google if changed or missing
                if (firebaseUser.photoURL && userData?.photoURL !== firebaseUser.photoURL) {
                  authService
                    .updateUserProfile(firebaseUser.uid, {
                      photoURL: firebaseUser.photoURL,
                    })
                    .catch((e) => console.error("Failed to sync photoURL:", e));
                }

                // Sync photoURL to chats collection if exists
                if (firebaseUser.photoURL) {
                  const chatRef = doc(db, "chats", firebaseUser.uid);
                  getDoc(chatRef).then((chatSnap) => {
                    if (chatSnap.exists() && chatSnap.data().userImage !== firebaseUser.photoURL) {
                      updateDoc(chatRef, { userImage: firebaseUser.photoURL }).catch((e) =>
                        console.error("Failed to sync chat userImage:", e)
                      );
                    }
                  });
                }

                // Owner Promotion Check
                const isOwnerEmail = firebaseUser.email === process.env.NEXT_PUBLIC_OWNER_EMAIL;

                let finalRole: "student" | "admin" | "owner" = userData?.role || "student";

                // FORCE OWNER for env owner - highest priority
                if (isOwnerEmail) {
                  finalRole = "owner";
                  // Sync to DB if not already owner
                  if (userData?.role !== "owner") {
                    // Fire and retry on failure
                    const updateOwner = async (retryCount = 0) => {
                      try {
                        await authService.updateUserProfile(firebaseUser.uid, { role: "owner" });
                      } catch (e) {
                        console.error("Owner update attempt failed", e);
                        if (retryCount < 2) {
                          setTimeout(() => updateOwner(retryCount + 1), 2000);
                        }
                      }
                    };
                    updateOwner();
                  }
                }

                const newUser = {
                  uid: docSnap.id,
                  ...userData,
                  role: finalRole,
                } as User;

                // --- LIVE PERMISSION NOTIFICATION ---
                if (user && user.uid === newUser.uid) {
                  const oldPerms = user.permissions || [];
                  const newPerms = newUser.permissions || [];

                  // Find added permissions
                  const added = newPerms.filter((p) => !oldPerms.includes(p));
                  if (added.length > 0) {
                    toast.success(
                      language === "ar"
                        ? "تم منحك صلاحيات جديدة!"
                        : "You've been granted new permissions!",
                      {
                        description: added.join(", "),
                        icon: "🛡️",
                        duration: 5000,
                      }
                    );
                  }

                  // Find removed permissions
                  const removed = oldPerms.filter((p) => !newPerms.includes(p));
                  if (removed.length > 0) {
                    toast.info(
                      language === "ar" ? "تم تعديل صلاحياتك" : "Your permissions were updated",
                      {
                        description:
                          language === "ar"
                            ? "تم إزالة بعض الصلاحيات"
                            : "Some permissions were removed",
                        duration: 5000,
                      }
                    );
                  }
                }

                setUser(newUser);

                // Log login removed from here to prevent duplicate logs on reload
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
            } catch (err: unknown) {
              console.error("Error processing user data (Creation/Fetch):", err);
              // Do NOT set a fallback user if creation failed.
              // This hides the error and leaves the user in a broken state (logged in locally, but not in DB).
              setUser(null);

              const errorMessage = err instanceof Error ? err.message : "Unknown error";

              toast.error(
                language === "ar"
                  ? "فشل إنشاء الملف الشخصي: " + errorMessage
                  : "Profile Creation Failed: " + errorMessage
              );

              // Optionally sign them out so they can try again cleanly
              await signOut(auth);
            } finally {
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
      console.error("Firebase not initialized - auth:", !!auth, "provider:", !!googleProvider);
      toast.error(
        language === "ar"
          ? "خطأ في إعدادات Firebase - تحقق من متغيرات البيئة"
          : "Firebase Config Error - Check environment variables"
      );
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Log explicit login action
      if (result.user) {
        import("@/lib/activity-logger").then(({ logLogin }) => {
          logLogin(result.user.uid, result.user.email || "unknown");
        });
      }
      // Loading will be handled by the listener
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };

      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request"
      ) {
        console.warn("Login popup closed or cancelled:", err?.code);
        return;
      }

      console.error("Login Error:", error);
      if (err?.code === "auth/unauthorized-domain") {
        toast.error(
          language === "ar"
            ? "هذا الموقع غير مصرح به. أضف النطاق في Firebase Console."
            : "Domain not authorized. Add to Firebase Console > Auth > Settings."
        );
        return;
      }
      if (err?.code === "auth/network-request-failed") {
        toast.error(
          language === "ar"
            ? "فشل في الشبكة. تحقق من 'Authorized Domains' في Firebase أو قيود API Key."
            : "Network Error. Check 'Authorized Domains' in Firebase Console & API Key Referrer restrictions."
        );
        return;
      }
      toast.error(
        language === "ar"
          ? "فشل الدخول: " + (err?.code || "خطأ غير معروف")
          : "Login failed: " + (err?.code || "Unknown error")
      );
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

  const hasPermission = useCallback(
    (permission: UserPermission) => {
      if (isOwner) return true;
      return user?.permissions?.includes(permission) || false;
    },
    [user, isOwner]
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
      hasPermission,
    }),
    [user, loading, isAdmin, isOwner, login, logout, updateProfile, hasPermission]
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
