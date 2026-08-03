"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { User, UserRole, UserPermission } from "@/types";
import { auth, googleProvider, rtdb } from "@/lib/firebase";
import { ref, set, onDisconnect } from "firebase/database";
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { authService } from "@/services/auth.service";
import { getApiBaseUrl } from "@/lib/config";
import { usePathname } from "next/navigation";
import { normalizeDate } from "@/lib/utils";

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

// Helper for emergency owner access
const getEmergencyOwnerUser = (firebaseUser: FirebaseUser, existingData?: Partial<User>): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email || "",
  displayName: existingData?.displayName || firebaseUser.displayName || "Owner",
  studentCode: existingData?.studentCode || "",
  role: "owner",
  permissions: [
    "manage_subjects",
    "manage_resources",
    "send_notifications",
    "delete_chats",
    "manage_users",
    "access_inbox",
    "manage_announcements",
    "view_analytics",
    "view_audit_logs",
  ],
  photoURL: existingData?.photoURL || firebaseUser.photoURL || undefined,
  isVip: true,
  subscriptionTier: "vip",
  createdAt: normalizeDate(existingData?.createdAt || "2026"),
  lastLogin: new Date().toISOString(),
  notificationSettings: existingData?.notificationSettings || { push: false, email: false },
});

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const abortControllerRef = useRef<AbortController | null>(null);
  const pathname = usePathname();

  const isOwner = useMemo(() => {
    if (!user || !user.email) return false;
    const ownerEmail = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "a7medorabe7@gmail.com")
      .trim()
      .toLowerCase();
    const primaryDev = "a7medorabe7@gmail.com";

    // Only the exact owner email or primary developer can be considered an owner
    return user.email.toLowerCase() === ownerEmail || user.email.toLowerCase() === primaryDev;
  }, [user]);

  const isAdmin = useMemo(() => {
    if (!user) return false;
    return user.role === "admin" || user.role === "owner" || isOwner || false;
  }, [user, isOwner]);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    // Safety fallback: ensure loading state never hangs or lags for more than 2.5 seconds
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 2500);

    if (!auth) {
      console.error("[AuthContext] Firebase Auth is not initialized.");
      setLoading(false);
      clearTimeout(safetyTimeout);
      return;
    }

    // 1. Handle Redirect Result (Removed as we only use signInWithPopup)

    // 2. Main Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(safetyTimeout);
      // Abort previous requests
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
        // Logout from server session
        const apiBaseUrl = getApiBaseUrl();
        fetch(`${apiBaseUrl}/api/auth/session`, { method: "DELETE" }).catch(() => {});
        return;
      }

      setLoading(true);

      // --- 2a. Start Real-time Snapshot Listener (Always) ---
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeSnapshot = authService.subscribeToUserProfile(
        firebaseUser.uid,
        (snapshot) => {
          const profileData = snapshot.data();
          if (profileData) {
            const isOwnerOrAdmin =
              profileData.role === "owner" ||
              profileData.role === "admin" ||
              firebaseUser.email ===
                (process.env.NEXT_PUBLIC_OWNER_EMAIL || "a7medorabe7@gmail.com");

            const profile = {
              uid: snapshot.id,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              photoURL: firebaseUser.photoURL || undefined,
              ...profileData,
              isVip: isOwnerOrAdmin ? true : !!profileData.isVip,
              subscriptionTier: isOwnerOrAdmin ? "vip" : profileData.subscriptionTier || "free",
              // Force Date Normalization to string
              createdAt: normalizeDate(profileData.createdAt),
              lastLogin: normalizeDate(profileData.lastLogin),
            } as User;
            setUser((prev) => {
              if (!prev) return profile;
              return { ...prev, ...profile };
            });

            // Sync photoURL if changed in Google
            if (firebaseUser.photoURL && profile.photoURL !== firebaseUser.photoURL) {
              authService
                .updateUserProfile(firebaseUser.uid, { photoURL: firebaseUser.photoURL })
                .catch(() => {});
            }
          }
          setLoading(false);
        },
        (error) => {
          console.error("[AuthContext] Snapshot error:", error);
          setLoading(false);
        }
      );

      // --- 2b. Start Bootstrap Process (Token & API) ---
      try {
        const idToken = await firebaseUser.getIdToken(true);
        const apiBaseUrl = getApiBaseUrl();

        // Background: Sync Session Cookie
        fetch(`${apiBaseUrl}/api/auth/session`, {
          method: "POST",
          headers: { Authorization: `Bearer ${idToken}` },
          signal: abortControllerRef.current.signal,
        }).catch(() => {});

        // Foreground: Bootstrap Profile
        const response = await fetch(`${apiBaseUrl}/api/auth/bootstrap`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          signal: abortControllerRef.current.signal,
        });

        if (response.ok) {
          const { profile: bootstrapUserData } = await response.json();
          // bootstrapUserData should be already normalized by the API, but defensively handle it
          const normalized = {
            ...bootstrapUserData,
            createdAt: normalizeDate(bootstrapUserData.createdAt),
            lastLogin: normalizeDate(bootstrapUserData.lastLogin),
          };

          setUser((prev) => {
            const base = prev || ({} as User);
            return { ...base, ...normalized } as User;
          });
        } else {
          console.warn(
            `[AuthContext] Bootstrap API returned status ${response.status}. Using fallback user profile.`
          );
          const existingProfile = await authService
            .getUserProfile(firebaseUser.uid)
            .catch(() => null);
          if (existingProfile) {
            setUser((prev) => ({ ...prev, ...existingProfile }) as User);
          } else {
            setUser((prev) => {
              if (prev && prev.role) return prev;
              return {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "User",
                role: "student" as UserRole,
                permissions: [],
                photoURL: firebaseUser.photoURL || undefined,
                createdAt: normalizeDate(new Date().toISOString()),
              } as User;
            });
          }
        }
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === "AbortError") return;
        console.error("[AuthContext] Bootstrap failed:", error);

        // Emergency Recovery for Owner
        const ownerEmail = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "a7medorabe7@gmail.com")
          .trim()
          .toLowerCase();
        if (firebaseUser.email && firebaseUser.email.toLowerCase() === ownerEmail) {
          console.warn("[AuthContext] Emergency recovery for Owner");
          const existingProfile = await authService
            .getUserProfile(firebaseUser.uid)
            .catch(() => null);
          setUser(getEmergencyOwnerUser(firebaseUser, existingProfile || undefined));
        } else {
          // Fallback to basic student data
          setUser((prev) => {
            if (prev && prev.role) return prev;
            return {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "User",
              role: "student" as UserRole,
              permissions: [],
              photoURL: firebaseUser.photoURL || undefined,
              createdAt: "1970-01-01T00:00:00.000Z",
            } as User;
          });
        }
      } finally {
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [language]);

  // Presence Tracking
  useEffect(() => {
    if (!user || !rtdb) return;
    try {
      const presenceRef = ref(rtdb, `presence/${user.uid}`);
      set(presenceRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastActive: Date.now(),
        status: "online",
        currentPath: pathname,
      });
      onDisconnect(presenceRef).update({
        status: "offline",
        lastActive: Date.now(),
      });
      return () => {
        set(presenceRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastActive: Date.now(),
          status: "offline",
          currentPath: pathname,
        }).catch(() => {});
      };
    } catch (err) {
      console.warn("[AuthContext] Presence tracking failed:", err);
    }
  }, [user, pathname]);

  const isLoggingInRef = useRef(false);

  const login = useCallback(async () => {
    if (!auth) {
      console.error(
        "[AuthContext] Firebase Auth is not initialized. Check your environment variables."
      );
      toast.error(
        language === "ar"
          ? "نظام تسجيل الدخول غير متاح حالياً. يرجى مراجعة متغيرات البيئة."
          : "Authentication system is currently unavailable. Please check environment variables."
      );
      return;
    }

    if (isLoggingInRef.current) {
      console.log("[AuthContext] Login popup request already in progress.");
      return;
    }

    isLoggingInRef.current = true;

    try {
      console.log("[AuthContext] login clicked - Initiating popup...");
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error("[AuthContext] Login error details:", error);
      if (error.code === "auth/popup-blocked") {
        toast.error(
          language === "ar"
            ? "تم حظر النافذة المنبثقة! يرجى السماح بالنوافذ المنبثقة لهذا الموقع لتسجيل الدخول بـ Google."
            : "Popup blocked! Please allow popups for this site to sign in with Google.",
          { duration: 6000 }
        );
      } else if (error.code === "auth/unauthorized-domain") {
        toast.error(
          language === "ar"
            ? "هذا النطاق (Domain) غير مصرح به لتسجيل الدخول في لوحة تحكم Firebase."
            : "This domain is not authorized for Google Sign-In in the Firebase console. Please add it to Authorized Domains.",
          { duration: 6000 }
        );
      } else if (
        error.code !== "auth/popup-closed-by-user" &&
        error.code !== "auth/cancelled-popup-request"
      ) {
        toast.error(
          (language === "ar" ? "فشل تسجيل الدخول: " : "Login failed: ") +
            (error.message || error.code)
        );
      }
    } finally {
      isLoggingInRef.current = false;
    }
  }, [language]);

  const logout = useCallback(async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      await fetch(`${apiBaseUrl}/api/auth/session`, { method: "DELETE" }).catch(() => {});
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!auth?.currentUser) return;
    const uid = auth.currentUser.uid;
    setUser((prev) => (prev ? { ...prev, ...data } : null));
    try {
      await authService.updateUserProfile(uid, data);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update profile");
    }
  }, []);

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
