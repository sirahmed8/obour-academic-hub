"use client";

import { useAuth, useLanguage } from "@/contexts";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ScaleIn, FadeIn } from "@/components/ui/Animations";

export function LoginScreen() {
  const { login, loading } = useAuth();
  const { language } = useLanguage();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background p-4 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[128px] pointer-events-none" />

      <ScaleIn className="w-full max-w-md relative z-10">
        <div className="glass-card p-8 md:p-10 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10">
          <div className="flex flex-col items-center justify-center gap-6 mb-8">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <Image
                src="/obour-logo.png"
                alt="Obour Logo"
                width={80}
                height={80}
                className="relative rounded-2xl shadow-lg"
                priority
              />
            </motion.div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black tracking-tight text-foreground">
                {language === "ar" ? "معاهد العبور" : "Obour Academic Hub"}
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                {language === "ar"
                  ? "بوابتك للتعلم الذكي والمستقبل المشرق"
                  : "Your gateway to smart learning and a bright future"}
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-6"
          >
            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span className="relative z-10">
                {language === "ar" ? "تسجيل الدخول بـ Google" : "Continue with Google"}
              </span>
            </motion.button>

            <div className="text-center space-y-4 pt-2">
              <FadeIn delay={0.4}>
                <p className="text-xs text-muted-foreground/60">
                  © 2026 Obour Academic Hub. <br />
                  <span className="text-muted-foreground/40">
                    Secure & Private Learning Environment
                  </span>
                </p>
                <div className="mt-2">
                  <a
                    href="https://linktr.ee/sir.ahmed"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary/60 hover:text-primary hover:underline text-[10px] transition-colors"
                  >
                    Designed by Sir Ahmed
                  </a>
                </div>
              </FadeIn>
            </div>
          </motion.div>
        </div>
      </ScaleIn>
    </div>
  );
}
