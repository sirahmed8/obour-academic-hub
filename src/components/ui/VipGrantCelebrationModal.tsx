"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, Zap, BrainCircuit, Mic, X, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth, useLanguage } from "@/contexts";
import Link from "next/link";

export function VipGrantCelebrationModal() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user || !user.uid) return;

    const isVipUser = !!(user.isVip || user.role === "owner" || user.role === "admin");
    if (!isVipUser) return;

    const storageKey = `vip-celebration-seen-${user.uid}`;
    const alreadySeen = localStorage.getItem(storageKey) === "true";

    if (!alreadySeen) {
      setIsOpen(true);
      // Trigger golden confetti explosion
      import("canvas-confetti")
        .then((m) => {
          const confetti = m.default;
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#f59e0b", "#d97706", "#b45309", "#fef08a", "#6366f1"],
          });
        })
        .catch(() => {});
    }
  }, [user]);

  const handleDismiss = () => {
    if (user?.uid) {
      localStorage.setItem(`vip-celebration-seen-${user.uid}`, "true");
    }
    setIsOpen(false);
  };

  if (!isOpen || !user) return null;

  const isAr = language === "ar";
  const grantedByText = user.vipGrantedBy || (isAr ? "إدارة المنصة" : "Platform Administration");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-3xl sm:rounded-4xl bg-card border border-amber-500/40 p-5 sm:p-8 shadow-2xl shadow-amber-500/10 custom-scrollbar my-auto"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-5 right-5 p-2 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            {/* Animated Rotating Golden Crown */}
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 blur-xl opacity-50"
              />
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-2xl flex items-center justify-center">
                <div className="w-full h-full bg-background/90 rounded-[22px] flex items-center justify-center">
                  <Crown className="w-12 h-12 text-amber-500 animate-bounce" />
                </div>
              </div>
              <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-amber-500 text-black font-black text-[10px] shadow-lg">
                VIP PRO
              </span>
            </div>

            {/* Title & Badge */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black">
                <Sparkles size={14} />
                {isAr ? "تم إهداؤك اشتراك مميز!" : "Complimentary VIP Pass Activated!"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {isAr ? "🎉 أهلاً بك في النخبة الأكاديمية!" : "🎉 Welcome to the Academic Elite!"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                {isAr
                  ? `تهانينا! تم منحك اشتراك "العبور بلس 👑 VIP Pass" مجاناً بفضل (${grantedByText}). استمتع بكافة المميزات الاستثنائية فائقة السرعة!`
                  : `Congratulations! You were granted complimentary Obour VIP Pass 👑 access courtesy of (${grantedByText}). Enjoy all premium features!`}
              </p>
            </div>

            {/* Premium Perks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left rtl:text-right">
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                  <Zap size={18} />
                </span>
                <div>
                  <p className="font-bold text-xs text-foreground">
                    {isAr ? "مضاعفة النقاط (2x XP)" : "2x XP Multiplier"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isAr ? "+20 نقطة لكل مهمة تكتمل" : "+20 XP per finished task"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex items-center gap-3">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500 shrink-0">
                  <BrainCircuit size={18} />
                </span>
                <div>
                  <p className="font-bold text-xs text-foreground">
                    {isAr ? "ذكاء اصطناعي بلا حدود" : "Priority Gemini AI"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isAr ? "مولد اختبارات وخرائط ذهنية" : "Instant Quiz & Mindmaps"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center gap-3">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                  <Mic size={18} />
                </span>
                <div>
                  <p className="font-bold text-xs text-foreground">
                    {isAr ? "تفريغ صوتي للمحاضرات" : "Lecture Audio Transcriber"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isAr ? "تسجيل وتلخيص مجاناً" : "Record & summarize audio"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <p className="font-bold text-xs text-foreground">
                    {isAr ? "التاج الذهبي وشارة بلس" : "Golden Crown Badge"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isAr ? "شارة VIP تضيء ملفك الشخصي" : "Crown badge on your profile"}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
              <Link
                href="/plus"
                onClick={handleDismiss}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>{isAr ? "استكشف مميزات بلس 🚀" : "Explore VIP Features 🚀"}</span>
                <ArrowRight size={16} className="rtl:rotate-180" />
              </Link>
              <button
                onClick={handleDismiss}
                className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs transition-colors"
              >
                {isAr ? "شكراً لكم! ابدأ التعلم" : "Thank you! Start Learning"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
