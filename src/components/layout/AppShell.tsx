"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useLanguage } from "@/contexts";
import { Sidebar, Navbar } from "@/components/layout";
import dynamic from "next/dynamic";
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

  // Enable global keyboard shortcuts
  useGlobalKeyboard();

  // Enable Real Page Tracking (Analytics) - TEMPORARILY DISABLED FOR DEBUGGING
  // usePageTracking();

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
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Stronger Purple Blob behind Sidebar (Top Left) to match Navbar's look */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 dark:bg-primary/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-100" />

        {/* Right side blob */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-50" />
      </div>
      <SkipLink />
      {/* Top Navigation Bar (Full Width) */}
      <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
      {/* Main Layout Area */}
      <div className="flex w-full h-full pt-16">
        {" "}
        {/* Add padding top for fixed Navbar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div
          className={cn(
            "flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300",
            language === "ar" ? "lg:pr-72" : "lg:pl-72" // Push content for Fixed Sidebar
          )}
        >
          <LiveBanner />
          <main
            id="main-content"
            className="flex-1 w-full h-full overflow-y-auto pb-24 lg:pb-10"
            style={{ scrollbarGutter: "stable" }}
          >
            {/* Page content with smooth transition */}
            <motion.div className="min-h-full flex flex-col w-full">
              <PageTransition>{children}</PageTransition>
            </motion.div>

            <footer className="py-8 mt-auto text-center space-y-4">
              <a
                href="https://linktr.ee/sir.ahmed"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-primary-foreground rounded-full font-medium hover:opacity-90 transition-all shadow-lg"
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
          <AIChatbot />
        </div>
      </div>{" "}
      {/* Close Main Layout Area */}
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
