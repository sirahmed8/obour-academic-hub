"use client";

import { useAuth, useLanguage } from "@/contexts";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ScaleIn, FadeIn } from "@/components/ui/Animations";
import { toast } from "sonner";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LoginScreen({ embedded = false }: { embedded?: boolean }) {
  const { login, loading, user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/main");
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div
      className={`w-full flex flex-col items-center justify-center relative overflow-hidden ${embedded ? "py-2 md:py-4" : "min-h-screen bg-black"}`}
    >
      {/* Dynamic Background Removed for Cleaner UI */}
      {!embedded && <>{/* Grid Pattern Overlay Removed as per Aesthetic requirements */}</>}

      <ScaleIn className="w-full max-w-md relative z-10 p-6">
        <div className="relative group">
          {/* Glow Effect Removed */}

          <div className="relative bg-black/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/10 rounded-[2.25rem] p-6 md:p-10 shadow-2xl ring-1 ring-white/5">
            <div className="flex flex-col items-center justify-center gap-6 mb-8">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="relative"
              >
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
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-sm font-harman">
                  {t("login.title")}
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
              className="space-y-6"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                disabled={loading}
                className="relative w-full py-4 bg-white text-black font-bold text-base rounded-full hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:shadow-white/10 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group/btn"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full hover:duration-1000 duration-1500 bg-black/5 z-10 transition-transform ease-in-out" />

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
                {[
                  {
                    key: "login.secure",
                    tip: "Enterprise-grade security using Firebase Authentication and Secure Error Shield.",
                  },
                  {
                    key: "login.private",
                    tip: "Your personal data is never shared. We strictly adhere to student privacy standards.",
                  },
                  {
                    key: "login.encrypted",
                    tip: "All communication is protected with end-to-end SSL/TLS encryption.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        toast.success(t(item.key) + ": " + item.tip, {
                          icon: "🛡️",
                          duration: 4000,
                        })
                      }
                      className="cursor-pointer hover:text-primary transition-colors focus:outline-none"
                    >
                      {t(item.key)}
                    </button>
                    {i < 2 && <span className="w-1 h-1 rounded-full bg-primary/40" />}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="text-center mt-8">
          <FadeIn delay={0.4}>
            <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/40 font-medium">
              {[
                { key: "login.privacy", href: "/legal/privacy" },
                { key: "login.terms", href: "/legal/terms" },
                { key: "login.cookies", href: "/legal/cookies" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Link
                    href={item.href}
                    className="hover:text-primary transition-colors cursor-pointer focus:outline-none underline-offset-4 hover:underline"
                  >
                    {t(item.key)}
                  </Link>
                  {i < 2 && <span className="opacity-20">•</span>}
                </div>
              ))}
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
