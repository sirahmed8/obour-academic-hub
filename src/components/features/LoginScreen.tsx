"use client";

import { useAuth, useLanguage } from "@/contexts";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ScaleIn, FadeIn } from "@/components/ui/Animations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

export function LoginScreen() {
  const { login, loading } = useAuth();
  const { language, t } = useLanguage();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* Dynamic Aurora Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 45, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -45, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen"
        />
        <motion.div
          animate={{
            x: ["-20%", "20%", "-20%"],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen"
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none mask-fade-out"
        style={{ maskImage: "radial-gradient(ellipse at center, black, transparent 80%)" }}
      />

      <ScaleIn className="w-full max-w-md relative z-10 p-6">
        <div className="relative group">
          {/* Glow Effect behind card */}
          <div className="absolute -inset-1 bg-linear-to-r from-primary/30 to-purple-600/30 rounded-4xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

          <div className="relative bg-black/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 rounded-[1.75rem] p-8 md:p-12 shadow-2xl ring-1 ring-white/5">
            <div className="flex flex-col items-center justify-center gap-8 mb-10">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full" />
                <Image
                  src="/obour-logo.png"
                  alt="Obour Logo"
                  width={90}
                  height={90}
                  className="relative rounded-2xl shadow-2xl shadow-primary/20"
                  priority
                />
              </motion.div>

              <div className="text-center space-y-3">
                <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white via-white/90 to-white/60 drop-shadow-sm font-harman">
                  {language === "ar" ? t("login.title") : "Obour Hub"}
                </h1>
                <p className="text-muted-foreground text-sm font-medium tracking-wide">
                  {t("login.subtitle")}
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                disabled={loading}
                className="relative w-full py-4 bg-white text-black font-bold text-base rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:shadow-white/10 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group/btn"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full hover:duration-1000 duration-1500 bg-linear-to-r from-transparent via-black/5 to-transparent z-10 transition-transform ease-in-out" />

                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span>{t("login.continueGoogle")}</span>
              </motion.button>

              <div className="flex items-center gap-4 text-[10px] text-muted-foreground/40 justify-center font-mono uppercase tracking-widest">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help hover:text-primary transition-colors">
                      {t("login.secure")}
                    </TooltipTrigger>
                    <TooltipContent className="bg-background/80 backdrop-blur-md border border-white/10 text-xs">
                      <p>Built with industry-standard security practices.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <span className="w-1 h-1 rounded-full bg-primary/40" />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help hover:text-primary transition-colors">
                      {t("login.private")}
                    </TooltipTrigger>
                    <TooltipContent className="bg-background/80 backdrop-blur-md border border-white/10 text-xs">
                      <p>Your data is yours. We respect your privacy.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <span className="w-1 h-1 rounded-full bg-primary/40" />

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help hover:text-primary transition-colors">
                      {t("login.encrypted")}
                    </TooltipTrigger>
                    <TooltipContent className="bg-background/80 backdrop-blur-md border border-white/10 text-xs">
                      <p>End-to-end encryption for all sensitive data.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="text-center mt-8">
          <FadeIn delay={0.4}>
            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/30 font-medium">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="hover:text-primary transition-colors cursor-help">
                    {t("login.privacy")}
                  </TooltipTrigger>
                  <TooltipContent className="bg-background/80 backdrop-blur-md border border-white/10 text-xs">
                    <p>Read about how we handle your data.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <span>•</span>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="hover:text-primary transition-colors cursor-help">
                    {t("login.terms")}
                  </TooltipTrigger>
                  <TooltipContent className="bg-background/80 backdrop-blur-md border border-white/10 text-xs">
                    <p>Understand the rules for using our platform.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <span>•</span>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="hover:text-primary transition-colors cursor-help">
                    {t("login.cookies")}
                  </TooltipTrigger>
                  <TooltipContent className="bg-background/80 backdrop-blur-md border border-white/10 text-xs">
                    <p>Learn how we use cookies to improve experience.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-[10px] text-muted-foreground/20 font-medium mt-2">
              {t("login.footer")}
            </p>
          </FadeIn>
        </div>
      </ScaleIn>
    </div>
  );
}
