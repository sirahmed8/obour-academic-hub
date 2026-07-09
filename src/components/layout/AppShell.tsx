"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useAuth, useLanguage, useSolidMode } from "@/contexts";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { SkipLink } from "@/components/ui/SkipLink";
import { usePageTracking } from "@/hooks/usePageTracking";
import { cn } from "@/lib/utils";

// Lazy load AIChatbot for better initial bundle size
const AIChatbot = dynamic(
  () => import("@/components/features/AIChatbot").then((mod) => mod.AIChatbot),
  {
    ssr: false,
    loading: () => null, // Explicitly return null during load to avoid hydration mismatches
  }
);

const StudentProfileSetup = dynamic(
  () => import("@/components/features/StudentProfileSetup").then((mod) => mod.StudentProfileSetup),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    ),
  }
);

import { LiveBanner } from "@/components/features/LiveBanner";
import { AdminApprovalModal } from "@/components/admin/AdminApprovalModal";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { Loader2, ExternalLink } from "lucide-react";
import { useGlobalKeyboard } from "@/hooks/useGlobalKeyboard";
import { usePerformance } from "@/hooks/usePerformance";
import { PageTransition } from "@/components/ui/Animations";
import { LanguageTransition } from "@/components/ui/LanguageTransition";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Use localStorage to persist dismissal permanently
  const [profileSetupDismissed, setProfileSetupDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("profileSetupDismissed") === "true";
      setProfileSetupDismissed(dismissed);
    }
  }, []);
  const { user, loading } = useAuth();
  const { language } = useLanguage();

  const handleMenuClick = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const handleSidebarClose = useCallback(() => setSidebarOpen(false), []);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isRightSwipe) {
      if (language === "ar") {
        setSidebarOpen(false);
      } else {
        if (touchStart < 50) setSidebarOpen(true);
      }
    }
    if (isLeftSwipe) {
      if (language === "ar") {
        if (touchStart > window.innerWidth - 50) setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    }
  };

  // Enable global keyboard shortcuts
  useGlobalKeyboard();

  // Log Page View using centralized hook
  usePageTracking();

  // Check if profile is incomplete using useMemo (no effect)
  const showProfileSetup = useMemo(() => {
    if (profileSetupDismissed) return false;
    // HARD FIX: Explicitly check owner/admin email to bypass modal
    if (user?.email === process.env.NEXT_PUBLIC_OWNER_EMAIL) return false;
    if (user?.role === "owner" || user?.role === "admin") return false;
    return user && (!user.studentCode || user.studentCode.length !== 6);
  }, [user, profileSetupDismissed]);

  // The AppShell is now only rendered when we want a protected, sidebar-enabled view.
  // Auth logic is handled by the lack of AppShell in AuthenticatedLayout for public/unauth states.

  // Solid Mode Hint
  const { isSolid, toggleSolidMode } = useSolidMode();
  // 1. Monitor Performance (now includes low-end device detection)
  const { isLagging, isLowEndDevice } = usePerformance();

  useEffect(() => {
    // Only proceed if:
    // 1. User is logged in
    // 2. Not already in solid mode
    // 3. Hasn't seen hint in this session
    if (!user || isSolid || sessionStorage.getItem("solidModeHintShown")) return;

    const showHint = () => {
      toast("Feels like slow performance?", {
        description: "Try Solid site! Removes blur for better speed.",
        action: {
          label: "Activate Solid Mode",
          onClick: () => {
            toggleSolidMode();
            toast.success("Solid Mode Activated 🚀");
          },
        },
        duration: 8000,
      });
      sessionStorage.setItem("solidModeHintShown", "true");
    };

    // A. Time-based trigger: Show after 2 minutes (120000ms) of usage
    const timeTimer = setTimeout(() => {
      showHint();
    }, 120000);

    // B. Performance-based trigger: Show immediately if consistent lag OR low-end device
    if (isLagging || isLowEndDevice) {
      // Small debounce to avoid instant popup on single frame drop
      const lagTimer = setTimeout(() => {
        showHint();
      }, 2000); // If lagging persists for 2 seconds
      return () => {
        clearTimeout(timeTimer);
        clearTimeout(lagTimer);
      };
    }

    return () => clearTimeout(timeTimer);
  }, [user, isSolid, toggleSolidMode, isLagging, isLowEndDevice]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // Allow rendering even without user (for 404s or public views within the shell)
  // Access control is managed at the page level or in AuthenticatedLayout.

  return (
    <div
      className="flex h-screen bg-background overflow-hidden relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEndHandler}
    >
      <SkipLink />
      {/* Top Navigation Bar (Full Width) */}
      <Navbar onMenuClick={handleMenuClick} />
      {/* Main Layout Area */}
      <LanguageTransition>
        <div className="flex w-full h-full">
          {/* Sidebar handles its own top padding on desktop */}
          <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />
          <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
            <LiveBanner />
            <main
              id="main-content"
              className="flex-1 w-full h-full overflow-y-auto pb-24 lg:pb-10 pt-16 scrollbar-offset-navbar"
              style={{ scrollbarGutter: "stable" }}
            >
              <div
                className={cn(
                  "min-h-screen flex flex-col w-full", // Force scroll for footer
                  language === "ar" ? "lg:pr-72" : "lg:pl-72" // Push content for Fixed Sidebar
                )}
              >
                <div className="relative w-full h-full">
                  <PageTransition>{children}</PageTransition>
                </div>
              </div>

              <footer
                className={cn(
                  "py-8 mt-auto text-center space-y-4",
                  language === "ar" ? "lg:pr-72" : "lg:pl-72"
                )}
              >
                <a
                  href="https://linktr.ee/sir.ahmed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all shadow-lg"
                >
                  <ExternalLink className="w-4 h-4" />
                  {language === "ar" ? "تواصل مع المطور" : "Connect with Developer"}
                </a>
                <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground/60">
                  <Link href="/legal/privacy" className="hover:text-primary transition-colors">
                    {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
                  </Link>
                  <span>•</span>
                  <Link href="/legal/terms" className="hover:text-primary transition-colors">
                    {language === "ar" ? "شروط الاستخدام" : "Terms of Service"}
                  </Link>
                  <span>•</span>
                  <Link href="/legal/cookies" className="hover:text-primary transition-colors">
                    {language === "ar" ? "ملفات الارتباط" : "Cookie Policy"}
                  </Link>
                </div>

                <p className="text-[10px] text-muted-foreground/40">
                  &copy; 2026 Obour Academic Hub. All rights reserved.
                </p>
              </footer>
            </main>
          </div>
        </div>
      </LanguageTransition>
      {/* Close Main Layout Area */}
      {/* Chatbot - Visible for Students and Owner only */}
      {(!user?.role || user.role === "student" || user.role === "owner") && <AIChatbot />}
      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <StudentProfileSetup
          onComplete={() => {
            setProfileSetupDismissed(true);
            if (typeof window !== "undefined") {
              localStorage.setItem("profileSetupDismissed", "true");
            }
          }}
        />
      )}
      {/* Admin Live Approval Modal */}
      <AdminApprovalModal />
      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
