"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, useLanguage } from "@/contexts";
import { Sparkles, Plus, BookOpen, MessageSquare } from "lucide-react";

import { FadeIn } from "@/components/ui/Animations";
import { TacticalAdviceCard } from "@/components/features/TacticalAdviceCard";
import { AcademicShortcutBar } from "@/components/features/AcademicShortcutBar";
import { AcademicStreakWidget } from "@/components/features/AcademicStreakWidget";
import { WhoIsOnline } from "@/components/features/WhoIsOnline";
import { OnboardingOverlay, shouldShowOnboarding } from "@/components/features/OnboardingOverlay";
import { FeatureTips } from "@/components/features/FeatureTips";
import { motion, AnimatePresence } from "framer-motion";

export function Dashboard() {
  const { user, isAdmin } = useAuth();
  const { language, t } = useLanguage();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const time = new Date().getHours();
    const timeGreeting =
      language === "ar"
        ? time < 12
          ? "صباح الخير"
          : "مساء الخير"
        : time < 12
          ? "Good Morning"
          : "Good Evening";
    setGreeting(timeGreeting);
  }, [language]);

  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (shouldShowOnboarding()) {
      setShowOnboarding(true);
    }
  }, []);

  return (
    <>
      {/* Onboarding overlay for first-time users */}
      <AnimatePresence>
        {showOnboarding && <OnboardingOverlay onDismiss={() => setShowOnboarding(false)} />}
      </AnimatePresence>

      <div className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-7xl mx-auto">
        {/* Feature Tips */}
        <FadeIn delay={0.1}>
          <FeatureTips />
        </FadeIn>

        {/* Hero Greeting Banner — Premium 1000x Glassmorphism & Animated Glows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-3xl sm:rounded-4xl overflow-hidden bg-[#0c1020] dark:bg-[#090c18] border border-white/10 shadow-2xl group"
        >
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between min-h-[300px]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-sm">
                  <Sparkles size={16} className="text-primary animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-primary">
                    {t("dashboard.bannerTitle")}
                  </span>
                </div>
                <WhoIsOnline />
              </div>

              {isAdmin && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-4 py-1.5 bg-foreground text-background dark:bg-white dark:text-black rounded-full text-xs font-black shadow-lg border border-white/10"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                  </span>
                  <span className="uppercase tracking-wider">{t("dashboard.adminMode")}</span>
                </motion.div>
              )}
            </div>

            <div className="space-y-4 max-w-4xl">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-tight text-white font-harman">
                {mounted && greeting && (
                  <motion.span
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 },
                      },
                    }}
                    className="inline-block flex-wrap"
                  >
                    {greeting.split(" ").map((word, i, arr) => (
                      <motion.span
                        key={i}
                        variants={{
                          hidden: { opacity: 0, y: 15 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        className="inline-block ms-1"
                      >
                        {word}
                        {i < arr.length - 1 ? "\u00A0" : ""}
                      </motion.span>
                    ))}
                    {language === "ar" ? "،" : ","}{" "}
                    <span className="inline-block whitespace-nowrap">
                      <span className="bg-gradient-to-r from-indigo-400 via-white to-purple-300 bg-clip-text text-transparent inline-block hover:scale-105 transition-transform duration-300 cursor-default font-extrabold">
                        {user?.displayName?.split(" ")[0]}
                      </span>
                      <motion.span
                        animate={{ rotate: [0, 20, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-block origin-[70%_70%] text-[0.75em] ms-2"
                      >
                        👋
                      </motion.span>
                    </span>
                  </motion.span>
                )}
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-white/70 font-medium leading-relaxed max-w-2xl">
                {t("dashboard.bannerSubtitle")}
              </p>
            </div>

            {/* Quick Action Launcher Pills */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
              <Link
                href="/todo"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-white text-xs sm:text-sm font-extrabold shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={16} />
                <span>{language === "ar" ? "إضافة مهمة دراسية" : "Add Homework Task"}</span>
              </Link>

              <Link
                href="/subject"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-extrabold border border-white/15 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              >
                <BookOpen size={16} className="text-blue-400" />
                <span>{language === "ar" ? "المواد الدراسية" : "Explore Subjects"}</span>
              </Link>

              <Link
                href="/community"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-extrabold border border-white/15 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              >
                <MessageSquare size={16} className="text-emerald-400" />
                <span>{language === "ar" ? "طرح سؤال مجتمعي" : "Ask Question"}</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Academic Shortcuts Navigation Bar */}
        <AcademicShortcutBar />

        {/* Gamified Study Streak & Progress Widget */}
        <AcademicStreakWidget />

        {/* AI Tactical Academic Advisor */}
        <TacticalAdviceCard />
      </div>
    </>
  );
}
