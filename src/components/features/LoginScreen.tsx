"use client";

import { useAuth, useLanguage } from "@/contexts";
import Link from "next/link";
import Image from "next/image";
import { Loader2, ShieldCheck, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { ScaleIn, FadeIn } from "@/components/ui/Animations";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LoginScreen({ embedded = false }: { embedded?: boolean }) {
  const { login, loading, user } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/main");
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      console.error("Login failed:", error);
      toast.error(
        language === "ar"
          ? "فشل تسجيل الدخول. يرجى المحاولة مرة أخرى."
          : "Login failed. Please try again."
      );
    }
  };

  return (
    <div
      id="welcome-login"
      className={`w-full flex flex-col items-center justify-center relative overflow-hidden ${
        embedded ? "py-4 md:py-8" : "min-h-screen bg-black"
      }`}
    >
      {/* Background Ambient Aura */}
      {!embedded && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary/20 via-indigo-600/10 to-purple-600/20 rounded-full blur-[150px] -z-10" />
        </div>
      )}

      <ScaleIn className="w-full max-w-md relative z-10 p-4 sm:p-6">
        <div className="relative group">
          {/* Subtle Glow Ring */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-indigo-500/20 to-purple-500/30 rounded-[2.5rem] blur-xl opacity-75 group-hover:opacity-100 transition duration-500 pointer-events-none" />

          <div className="relative bg-black/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/15 rounded-[2.25rem] p-6 sm:p-10 shadow-2xl ring-1 ring-white/10">
            {/* Header / Brand */}
            <div className="flex flex-col items-center justify-center gap-5 mb-8">
              <motion.div
                whileHover={{ scale: 1.08, rotate: 4 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="relative cursor-pointer"
              >
                <div className="absolute -inset-2 bg-gradient-to-tr from-primary to-purple-600 rounded-2xl blur-md opacity-50" />
                <Image
                  src="/obour-logo.png"
                  alt="Obour Logo"
                  width={84}
                  height={84}
                  className="relative rounded-2xl shadow-2xl ring-2 ring-white/20 bg-black/40 p-1"
                  priority
                />
              </motion.div>

              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-primary tracking-wide">
                  <Sparkles size={12} />
                  <span>
                    {language === "ar" ? "بوابة الطلاب الرسمية" : "Official Student Portal"}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm font-harman">
                  {t("login.title")}
                </h1>
                <p className="text-white/60 text-xs sm:text-sm font-medium leading-relaxed max-w-xs mx-auto">
                  {t("login.subtitle")}
                </p>
              </div>
            </div>

            {/* Login Action */}
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
                className="relative w-full py-4 px-6 bg-gradient-to-r from-white via-slate-100 to-white text-black font-extrabold text-base rounded-2xl hover:bg-white transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group/btn"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 transition-transform ease-in-out pointer-events-none" />

                {loading ? (
                  <Loader2 className="animate-spin text-primary" size={20} />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                  </svg>
                )}
                <span>{t("login.continueGoogle")}</span>
              </motion.button>

              {/* Terms of Service & Privacy Policy agreement disclaimer */}
              <p className="text-[11px] text-white/50 text-center font-medium leading-relaxed px-2 mt-2">
                {language === "ar" ? (
                  <>
                    بالمتابعة، فإنك توافق على{" "}
                    <Link
                      href="/legal/terms"
                      className="text-white/80 hover:text-primary underline underline-offset-2 transition-colors font-semibold"
                    >
                      شروط خدمة منصة معاهد العبور
                    </Link>{" "}
                    و{" "}
                    <Link
                      href="/legal/privacy"
                      className="text-white/80 hover:text-primary underline underline-offset-2 transition-colors font-semibold"
                    >
                      سياسة الخصوصية
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    By continuing, you agree to Obour Institutes Platform{" "}
                    <Link
                      href="/legal/terms"
                      className="text-white/80 hover:text-primary underline underline-offset-2 transition-colors font-semibold"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/legal/privacy"
                      className="text-white/80 hover:text-primary underline underline-offset-2 transition-colors font-semibold"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </>
                )}
              </p>

              {/* Trust Badges */}
              <div className="flex items-center gap-3 text-[10px] text-white/50 justify-center font-semibold uppercase tracking-wider">
                {[
                  {
                    key: "login.secure",
                    label: language === "ar" ? "آمن 100%" : "100% Secure",
                    icon: ShieldCheck,
                    tip: "Firebase Popup Auth Protection",
                  },
                  {
                    key: "login.private",
                    label: language === "ar" ? "خصوصية تامة" : "Private",
                    icon: Lock,
                    tip: "Student data confidentiality guaranteed",
                  },
                  {
                    key: "login.encrypted",
                    label: language === "ar" ? "مشفّر" : "Encrypted",
                    icon: CheckCircle2,
                    tip: "End-to-End SSL Encryption",
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          toast.success(item.label + ": " + item.tip, {
                            icon: "🛡️",
                            duration: 3000,
                          })
                        }
                        className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors focus:outline-none"
                      >
                        <Icon size={12} className="text-primary" />
                        <span>{item.label}</span>
                      </button>
                      {i < 2 && <span className="w-1 h-1 rounded-full bg-white/20" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="text-center mt-6">
          <FadeIn delay={0.4}>
            <div className="flex items-center justify-center gap-3 text-[11px] text-white/40 font-medium">
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
            <p className="text-[10px] text-white/25 font-medium mt-2">{t("login.footer")}</p>
          </FadeIn>
        </div>
      </ScaleIn>
    </div>
  );
}
