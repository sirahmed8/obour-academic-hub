"use client";

import { useState } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import {
  Crown,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Flame,
  Mic,
  BarChart2,
  Check,
  Lock,
  Clock,
  Bell,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ObourPlusSubscriptionPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [billingCycle, setBillingCycle] = useState<"monthly" | "semester">("semester");
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  const isOwnerOrAdmin =
    user?.role === "owner" ||
    user?.role === "admin" ||
    user?.email === process.env.NEXT_PUBLIC_OWNER_EMAIL;
  const isVip = user?.isVip || isOwnerOrAdmin;

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail.trim()) return;
    // Store locally — will be wired to real notification list when gateway is ready
    setNotifySubmitted(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-10 max-w-7xl mx-auto min-h-screen page-transition">
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <FadeIn>
        <div className="relative rounded-3xl sm:rounded-4xl overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#090d16] border border-amber-500/40 p-8 sm:p-12 shadow-2xl text-center space-y-5 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase tracking-widest border border-amber-500/40 backdrop-blur-md">
            <Crown size={16} className="text-amber-400 animate-pulse" />
            <span>{isAr ? "باقة النخبة الأكاديمية" : "Obour Hub VIP Pass"}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-harman leading-tight">
            {isAr ? "العبور بلس | Obour Hub VIP" : "Obour Hub VIP Pass"}
          </h1>

          <p className="text-white/70 text-sm sm:text-base max-w-3xl mx-auto font-medium leading-relaxed">
            {isAr
              ? "استثمر في تفوقك الأكاديمي واستمتع بالذكاء الاصطناعي غير المحدود لتحويل المحاضرات، واختبارات المراجعة الذكية، وضاعف نقاط الخبرة XP للوصول إلى قمة لوحة الصدارة."
              : "Upgrade your academic journey with unlimited AI lecture transcriptions, smart practice exams, 2x XP multipliers, and exclusive VIP perks."}
          </p>

          {/* Owner / Admin Active Status */}
          {isOwnerOrAdmin && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm shadow-xl"
            >
              <Sparkles size={18} />
              <span>
                {isAr
                  ? "أنت صاحب المنصة / أدمن - جميع مميزات بلس مفعلة بحسابك تلقائياً 👑"
                  : "You are Owner/Admin - All VIP perks permanently active 👑"}
              </span>
            </motion.div>
          )}

          {/* Regular VIP badge */}
          {isVip && !isOwnerOrAdmin && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm shadow-xl"
            >
              <Sparkles size={18} />
              <span>
                {isAr ? "أنت الآن مشترك في العبور بلس 👑" : "You have an active Obour VIP Pass 👑"}
              </span>
            </motion.div>
          )}
        </div>
      </FadeIn>

      {/* ── Billing Cycle Selector ─────────────────────────────────────── */}
      <FadeIn delay={0.05}>
        <div className="flex justify-center">
          <div className="p-1.5 bg-card border border-border rounded-2xl inline-flex items-center gap-2 shadow-md">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all",
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isAr ? "اشتراك شهري (Monthly)" : "Monthly Billing"}
            </button>
            <button
              onClick={() => setBillingCycle("semester")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all relative flex items-center gap-2",
                billingCycle === "semester"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{isAr ? "باقة الفصل الدراسي (Semester Pass)" : "Semester Pass"}</span>
              <span className="px-2 py-0.5 rounded-full bg-black/20 text-[10px] font-black uppercase">
                {isAr ? "وفر 35%" : "Save 35%"}
              </span>
            </button>
          </div>
        </div>
      </FadeIn>

      {/* ── Pricing Matrix Cards ───────────────────────────────────────── */}
      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Free Plan */}
        <ScaleIn>
          <div className="p-8 rounded-3xl bg-card border border-border shadow-md flex flex-col justify-between space-y-6 relative overflow-hidden h-full">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-bold">
                <span>{isAr ? "الباقة العادية" : "Free Scholar"}</span>
              </div>
              <h3 className="text-2xl font-black text-foreground">
                {isAr ? "مجاناً للأبد" : "Free Forever"}
              </h3>
              <p className="text-3xl font-black text-foreground">
                0 EGP{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  / {isAr ? "دائم" : "forever"}
                </span>
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {isAr
                  ? "المميزات الأساسية لتصفح المواد والمستلزمات وحل التأسيس."
                  : "Basic features for browsing subjects, marketplace, and foundation tasks."}
              </p>

              <hr className="border-border/60" />

              <ul className="space-y-3 text-xs sm:text-sm font-medium text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>
                    {isAr ? "تصفح كافة مواد الكلية والمحاضرات" : "Access all subject resources"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>
                    {isAr ? "3 جلسات تفريغ صوتي شهرياً" : "3 audio transcription sessions / mo"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>
                    {isAr
                      ? "اختبارات مراجعة بسيطة (5 أسئلة)"
                      : "Basic practice quizzes (5 questions)"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>{isAr ? "معدل XP عادي 1x" : "1x Standard XP rate"}</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/40">
                  <XCircle size={16} className="shrink-0" />
                  <span>{isAr ? "تصدير ملخصات PDF الذكية" : "PDF summary exports"}</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/40">
                  <XCircle size={16} className="shrink-0" />
                  <span>{isAr ? "وسام النخبة الذهبي 👑" : "Golden VIP badge 👑"}</span>
                </li>
              </ul>
            </div>

            <div className="w-full py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm text-center">
              {isAr ? "✅ باقتك الحالية - نشطة" : "✅ Your Current Plan - Active"}
            </div>
          </div>
        </ScaleIn>

        {/* VIP Pass Plan */}
        <ScaleIn>
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#0f172a] border-2 border-amber-500/60 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden h-full text-white">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-400 text-black font-black text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-lg">
              {isAr ? "قريباً ⚡" : "Coming Soon ⚡"}
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <Crown size={14} className="text-amber-400" />
                <span>{isAr ? "العبور بلس PRO" : "VIP Pass PRO"}</span>
              </div>
              <h3 className="text-3xl font-black text-white font-harman">
                {isAr ? "باقة النخبة 👑" : "VIP Elite Pass 👑"}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-amber-400 font-harman">
                  {billingCycle === "monthly" ? "49 EGP" : "199 EGP"}
                </span>
                <span className="text-xs text-white/60 font-medium">
                  /{" "}
                  {billingCycle === "monthly"
                    ? isAr
                      ? "شهرياً"
                      : "per month"
                    : isAr
                      ? "ترم كامل"
                      : "full semester"}
                </span>
              </div>
              <p className="text-xs text-amber-300/80 font-medium">
                {billingCycle === "semester"
                  ? isAr
                    ? "ادفع مرة واحدة واستمتع بالفصل الدراسي كاملاً مع خصم 35%!"
                    : "Pay once for the entire semester & save 35%!"
                  : isAr
                    ? "إمكانية الإلغاء أو الترقية في أي وقت."
                    : "Cancel or adjust anytime."}
              </p>

              <hr className="border-white/10" />

              <ul className="space-y-3 text-xs sm:text-sm font-medium text-white/90">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-amber-400 shrink-0 font-bold" />
                  <span className="font-extrabold text-amber-300">
                    {isAr
                      ? "تفريغ المحاضرات بالذكاء الاصطناعي غير محدود 🎙️"
                      : "Unlimited AI Lecture Transcriptions 🎙️"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-amber-400 shrink-0 font-bold" />
                  <span className="font-extrabold text-amber-300">
                    {isAr
                      ? "تولد اختبارات المراجعة 20 سؤالاً مع الإجابات ⚡"
                      : "Unlimited 20-Question AI Exams ⚡"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-amber-400 shrink-0 font-bold" />
                  <span>
                    {isAr
                      ? "مضاعفة نقاط XP مرتين (2x Multiplier) 🚀"
                      : "2x XP Points Multiplier 🚀"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-amber-400 shrink-0 font-bold" />
                  <span>
                    {isAr
                      ? "وسام النخبة الذهبي 👑 على البروفايل ولوحة الصدارة"
                      : "Golden VIP Crown Badge 👑"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-amber-400 shrink-0 font-bold" />
                  <span>
                    {isAr
                      ? "تصدير الملخصات والخطط بصيغة PDF معتمدة 📄"
                      : "PDF Summary & Report Exports 📄"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-amber-400 shrink-0 font-bold" />
                  <span>
                    {isAr
                      ? "أولوية في حجز مجموعات المذاكرة والـ Buddies ⚔️"
                      : "Priority Study Buddies Matching ⚔️"}
                  </span>
                </li>
              </ul>
            </div>

            {/* Coming Soon CTA — locked state */}
            <div className="w-full py-4 rounded-2xl bg-white/10 border border-white/20 text-white/70 font-extrabold text-sm text-center flex items-center justify-center gap-2 cursor-default">
              <Lock size={16} />
              <span>
                {isOwnerOrAdmin
                  ? isAr
                    ? "الاشتراك مفعل تلقائياً بحسابك 👑"
                    : "Permanently Active on Your Account 👑"
                  : isVip
                    ? isAr
                      ? "اشتراكك مفعل بالفعل 👑"
                      : "VIP Pass Active 👑"
                    : isAr
                      ? "بوابة الدفع قريباً 🔜"
                      : "Payment Gateway Coming Soon 🔜"}
              </span>
            </div>
          </div>
        </ScaleIn>
      </StaggerChildren>

      {/* ── Payment Gateway Coming Soon Banner ─────────────────────────── */}
      {!isOwnerOrAdmin && (
        <FadeIn delay={0.08}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border-2 border-dashed border-amber-500/50 bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-amber-500/5 p-8 sm:p-12 text-center space-y-6 max-w-3xl mx-auto"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />

            <div className="relative space-y-4">
              {/* Icon */}
              <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <Clock size={36} className="text-amber-500 animate-pulse" />
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                {isAr
                  ? "🔜 بوابة الدفع الآمنة قريباً جداً!"
                  : "🔜 Secure Payment Gateway — Coming Soon!"}
              </h2>

              <p className="text-sm text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
                {isAr
                  ? "نحن نعمل على دمج بوابة دفع آمنة ومتكاملة لتتمكن من الاشتراك في العبور بلس بكل سهولة ويُسر. حتى ذلك الحين، جميع الطلاب على الباقة المجانية."
                  : "We're integrating a secure, seamless payment gateway so you can subscribe to Obour VIP Pass with ease. Until then, all students remain on the free plan."}
              </p>

              {/* What's coming */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left mt-4">
                {[
                  {
                    icon: "💳",
                    titleAr: "فيزا / ماستركارد",
                    titleEn: "Visa / Mastercard",
                    descAr: "دفع آمن مباشر",
                    descEn: "Direct secure checkout",
                  },
                  {
                    icon: "📱",
                    titleAr: "فودافون كاش & إنستا باي",
                    titleEn: "Vodafone Cash & InstaPay",
                    descAr: "دفع محلي سريع",
                    descEn: "Local fast payment",
                  },
                  {
                    icon: "🔒",
                    titleAr: "حماية كاملة للبيانات",
                    titleEn: "Full Data Security",
                    descAr: "تشفير بنكي معتمد",
                    descEn: "Bank-grade encryption",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-card border border-border space-y-1.5 text-center"
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <p className="font-extrabold text-xs text-foreground">
                      {isAr ? item.titleAr : item.titleEn}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {isAr ? item.descAr : item.descEn}
                    </p>
                  </div>
                ))}
              </div>

              {/* Notify Me form */}
              <div className="pt-2">
                {notifySubmitted ? (
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-500 font-bold text-sm">
                    <CheckCircle2 size={18} />
                    <span>
                      {isAr
                        ? "تم! سنُخبرك فور إطلاق الاشتراكات 🎉"
                        : "Done! We'll notify you when subscriptions launch 🎉"}
                    </span>
                  </div>
                ) : (
                  <form
                    onSubmit={handleNotify}
                    className="flex flex-col sm:flex-row items-center gap-3 justify-center max-w-md mx-auto"
                  >
                    <input
                      type="email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder={
                        isAr
                          ? "أدخل بريدك الإلكتروني للتنبيه عند الإطلاق"
                          : "Enter your email to be notified at launch"
                      }
                      className="flex-1 w-full px-4 py-3 rounded-2xl bg-background border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-muted-foreground/60"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-sm shadow-lg hover:shadow-amber-500/25 transition-all whitespace-nowrap"
                    >
                      <Bell size={16} />
                      {isAr ? "نبّهني عند الإطلاق" : "Notify Me at Launch"}
                    </motion.button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </FadeIn>
      )}

      {/* ── Deep Dive Feature Highlights ───────────────────────────────── */}
      <FadeIn delay={0.1}>
        <div className="space-y-6 pt-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground font-harman">
              {isAr ? "ماذا يمنحك اشتراك العبور بلس؟" : "Why Upgrade to Obour VIP Pass?"}
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              {isAr
                ? "أدوات حصرية مصممة خصيصاً لمساعدتك في الحصول على أعلى تقدير أكاديمي."
                : "Exclusive tools designed to help you achieve top grades with minimum friction."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Mic,
                titleAr: "تفريغ المحاضرات الصوتية",
                titleEn: "AI Audio Transcriber",
                descAr: "ارفع التسجيل الصوتي للمحاضرة واحصل على ملخص شامل وعناوين رئيسية فوراً.",
                descEn: "Upload lecture audio and get instant AI notes and summaries.",
                color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
              },
              {
                icon: Zap,
                titleAr: "منشئ الامتحانات الذكي",
                titleEn: "AI Practice Exam Gen",
                descAr: "أنشئ امتحانات متكاملة بـ 20 سؤالاً مع توضيح خطوات الحل بالتفصيل.",
                descEn: "Generate 20-question practice exams with full solution steps.",
                color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
              },
              {
                icon: Flame,
                titleAr: "مضاعف نقاط الخبرة 2x",
                titleEn: "2x XP Points Boost",
                descAr: "ضاعف XP الذي تحصل عليه عند إنجاز المهام واصعد قمة لوحة الصدارة.",
                descEn: "Earn double XP on all completed tasks and climb leaderboard ranks.",
                color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
              },
              {
                icon: BarChart2,
                titleAr: "مخطط التقدير التراكمي",
                titleEn: "Pro GPA Target Planner",
                descAr: "محاكاة سيناريوهات المعدل التراكمي لعدة فصول دراسية وتصدير التقرير.",
                descEn: "Simulate multi-semester GPA targets and export progress reports.",
                color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border",
                    feature.color
                  )}
                >
                  <feature.icon size={24} />
                </div>
                <h3 className="font-extrabold text-base text-foreground">
                  {isAr ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {isAr ? feature.descAr : feature.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ── Bottom CTA note ────────────────────────────────────────────── */}
      <FadeIn delay={0.12}>
        <div className="text-center py-6 space-y-2">
          <p className="text-xs text-muted-foreground font-medium">
            {isAr
              ? "جميع الطلاب على الباقة المجانية حتى إطلاق بوابة الدفع الرسمية. ترقبوا الإعلان قريباً! 🚀"
              : "All students are on the Free Plan until the official payment gateway launches. Stay tuned! 🚀"}
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
