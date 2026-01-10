"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useLanguage, useSolidMode } from "@/contexts";
import { Sidebar, Navbar } from "@/components/layout";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { analyticsService } from "@/services/analytics.service";
import { SkipLink } from "@/components/ui/SkipLink";
import { cn } from "@/lib/utils";

// Lazy load AIChatbot for better initial bundle size
const AIChatbot = dynamic(
  () => import("@/components/features/AIChatbot").then((mod) => mod.AIChatbot),
  {
    ssr: false, // It's a client-side component anyway
  }
);

const StudentProfileSetup = dynamic(
  () => import("@/components/features/StudentProfileSetup").then((mod) => mod.StudentProfileSetup),
  {
    ssr: false,
  }
);

import { LiveBanner } from "@/components/features/LiveBanner";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { Loader2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useGlobalKeyboard } from "@/hooks/useGlobalKeyboard";
import { usePerformance } from "@/hooks/usePerformance";
import { PageTransition } from "@/components/ui/Animations";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Use localStorage to persist dismissal permanently
  const [profileSetupDismissed, setProfileSetupDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("profileSetupDismissed") === "true";
    }
    return false;
  });
  const { user, loading } = useAuth();
  const { dir, language } = useLanguage();

  const router = useRouter();
  const pathname = usePathname();

  // Enable global keyboard shortcuts
  useGlobalKeyboard();

  // Log Page View
  useEffect(() => {
    if (user && pathname) {
      analyticsService.logPageView(user.uid, pathname);
    }
  }, [user, pathname]);

  // Check if profile is incomplete using useMemo (no effect)
  const showProfileSetup = useMemo(() => {
    if (profileSetupDismissed) return false;
    // HARD FIX: Explicitly check owner/admin email to bypass modal
    if (user?.email === process.env.NEXT_PUBLIC_OWNER_EMAIL) return false;
    if (user?.role === "owner" || user?.role === "admin") return false;
    return user && (!user.studentCode || user.studentCode.length !== 6);
  }, [user, profileSetupDismissed]);

  // Protect route with useEffect to avoid render-loop
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

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

  if (!user) {
    // Show spinner while redirecting to avoid white flash
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative" dir={dir}>
      {/* Global Ambient Background for Seamless Blur */}
      {/* Global Ambient Background for Seamless Blur */}
      {/* Global Ambient Background Removed for Solid Look */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-background" />
      <SkipLink />
      {/* Top Navigation Bar (Full Width) */}
      <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
      {/* Main Layout Area */}
      <div className="flex w-full h-full">
        {/* Sidebar handles its own top padding on desktop */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300">
          <LiveBanner />
          <main
            id="main-content"
            className="flex-1 w-full h-full overflow-y-auto pb-24 lg:pb-10 pt-16 scrollbar-offset-navbar"
            style={{ scrollbarGutter: "stable" }}
          >
            {/* Page content with smooth transition */}
            <motion.div
              className={cn(
                "min-h-full flex flex-col w-full",
                language === "ar" ? "lg:pr-72" : "lg:pl-72" // Push content for Fixed Sidebar
              )}
            >
              <PageTransition>{children}</PageTransition>
            </motion.div>

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
                className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-primary to-purple-600 text-primary-foreground rounded-full font-medium hover:opacity-90 transition-all shadow-lg"
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
      </div>{" "}
      {/* Close Main Layout Area */}
      <AIChatbot />
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
      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
