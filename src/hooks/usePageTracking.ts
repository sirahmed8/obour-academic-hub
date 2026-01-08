"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    // Debounce or just log?
    // Log distinct page views.
    if (!pathname) return;
    // CRITICAL: Skip logging if user auth is not ready - prevents permission errors
    if (!user) return;

    const logPageView = async () => {
      try {
        const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

        // Don't log admin pages to avoid clutter? Or log everything?
        // User said "Usage Data... pages you visit". Logging everything is safer for "security".

        await addDoc(collection(db, "analytics_logs"), {
          userId: user?.uid || "guest",
          path: fullPath,
          timestamp: serverTimestamp(),
          userAgent: window.navigator.userAgent,
          // Add basic metadata
          screen: `${window.screen.width}x${window.screen.height}`,
          language: window.navigator.language,
        });

        // Also log to Firebase Analytics if available (standard event)
        // import { analytics } from "@/lib/firebase";
        // import { logEvent } from "firebase/analytics";
        // if (analytics) logEvent(analytics, 'page_view', { page_path: fullPath });
      } catch (error) {
        console.error("Failed to log page view:", error);
      }
    };

    // Timeout to ensure we don't log rapid redirects?
    const timer = setTimeout(logPageView, 1000);

    return () => clearTimeout(timer);
  }, [pathname, searchParams, user]);
}
