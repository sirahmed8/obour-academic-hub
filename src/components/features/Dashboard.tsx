"use client";

import { useState, useEffect } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { Sparkles } from "lucide-react";
import { FadeIn } from "@/components/ui/Animations";
import { StudentStats } from "@/components/features/StudentStats";
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
    // Show onboarding only for first-time users
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

      <div className="p-6 lg:p-10 space-y-10 w-full page-transition min-h-screen">
        {/* Feature Tips */}
        <FadeIn delay={0.3}>
          <FeatureTips />
        </FadeIn>

        {/* Greeting Banner - Premium Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-4xl overflow-hidden bg-primary/10 dark:bg-primary/5 border border-primary/20 dark:border-primary/10 backdrop-blur-xl group"
        >
          <div className="relative z-10 p-8 lg:p-14 flex flex-col justify-center min-h-[320px]">
            <div className="flex items-center gap-2 mb-6 bg-white/40 dark:bg-white/10 w-fit px-4 py-1.5 rounded-full border border-white/40 dark:border-white/10 backdrop-blur-md shadow-sm">
              <Sparkles size={16} className="text-primary animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-primary/80 dark:text-primary/90">
                {t("dashboard.bannerTitle")}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-6 max-w-3xl">
                <h1 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.85] text-foreground">
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
                      className="block"
                    >
                      {language === "ar"
                        ? greeting.split(" ").map((word, i, arr) => (
                            <motion.span
                              key={i}
                              variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                              }}
                              className="inline-block"
                            >
                              {word}
                              {i < arr.length - 1 ? "\u00A0" : ""}
                            </motion.span>
                          ))
                        : greeting.split("").map((char, i) => (
                            <motion.span
                              key={i}
                              variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 },
                              }}
                              className="inline-block"
                            >
                              {char === " " ? "\u00A0" : char}
                            </motion.span>
                          ))}
                      {language === "ar" ? "،" : ","}{" "}
                      <span className="whitespace-nowrap">
                        <span className="text-gradient-primary inline-block hover:scale-105 transition-transform duration-300 cursor-default align-baseline">
                          {user?.displayName?.split(" ")[0]}
                        </span>
                        <motion.span
                          animate={{ rotate: [0, 20, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="inline-block origin-[70%_70%] text-[0.7em] relative -top-2 md:-top-3 ms-2 md:ms-3"
                        >
                          👋
                        </motion.span>
                      </span>
                    </motion.span>
                  )}
                </h1>
                <div className="space-y-3">
                  <p className="text-2xl lg:text-4xl font-bold text-foreground/90 tracking-tight">
                    {language === "ar" ? "أهلاً بك في منصة العبور" : "Welcome to Obour Hub"}
                  </p>
                  <p className="text-lg lg:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                    {t("dashboard.bannerSubtitle")}
                  </p>
                </div>
              </div>

              {isAdmin && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="shrink-0 flex items-center gap-3 px-6 py-3 bg-foreground text-background dark:bg-white dark:text-black rounded-2xl text-sm font-black shadow-2xl border border-white/10 cursor-default"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                    </span>
                    <span className="uppercase tracking-widest">{t("dashboard.adminMode")}</span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        <StudentStats />
      </div>
    </>
  );
}
