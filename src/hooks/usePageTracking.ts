"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts";
import { analyticsService } from "@/services/analytics.service";

/**
 * Hook to track page views and log them to analytics.
 * Uses a debounce timer to avoid logging rapid redirects or mid-navigation states.
 */
export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    // 1. Basic validation: need a path and a user
    if (!pathname || !user) return;

    const logPageView = async () => {
      try {
        const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

        // Log to our unified analytics service
        // This handles batching and summary-at-write optimizations
        await analyticsService.logPageView(user.uid, fullPath);
      } catch (error) {
        // We don't want analytics failures to ever crash the UI
        console.warn("[Analytics] Silent failure logging page view:", error);
      }
    };

    // 2. Timeout to ensure we don't log rapid redirects (1.5s is safer than 1s)
    const timer = setTimeout(logPageView, 1500);

    return () => clearTimeout(timer);
  }, [pathname, searchParams, user]);
}
