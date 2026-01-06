"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useLanguage } from "@/contexts";
import { Sidebar, Navbar } from "@/components/layout";
import dynamic from "next/dynamic";
import { SkipLink } from "@/components/ui/SkipLink";
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
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "@/lib/motion";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileSetupDismissed, setProfileSetupDismissed] = useState(false);
  const { user, loading } = useAuth();
  const { dir, language } = useLanguage();

  const router = useRouter();
  const pathname = usePathname();

  // Check if profile is incomplete using useMemo (no effect)
  const showProfileSetup = useMemo(() => {
    if (profileSetupDismissed) return false;
    // Don't show for owner or admin
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
    <div className="flex h-screen bg-background overflow-hidden" dir={dir}>
      <SkipLink />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <LiveBanner />
        <main id="main-content" className="flex-1 overflow-y-auto pb-24 lg:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={fadeIn}
              className="min-h-full flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>

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
            <p className="text-xs text-muted-foreground/60">
              &copy; 2026 Obour Academic Hub. All rights reserved.
            </p>
          </footer>
        </main>
        <AIChatbot />
      </div>

      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <StudentProfileSetup onComplete={() => setProfileSetupDismissed(true)} />
      )}

      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  );
}
