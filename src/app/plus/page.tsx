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
  CreditCard,
  Smartphone,
  QrCode,
  Flame,
  Mic,
  BarChart2,
  Check,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Payment Gateways ────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: "vodafone",
    nameAr: "فودافون كاش (Vodafone Cash)",
    nameEn: "Vodafone Cash",
    icon: Smartphone,
    color: "from-red-600 to-rose-600",
    number: "01099887766",
    instructionsAr:
      "قم بتحويل المبلغ إلى رقم فودافون كاش ثم أدخل رقم المحفظة المحول منها لخصم الاشتراك.",
    instructionsEn:
      "Transfer amount to our Vodafone Cash number and enter your sender wallet number.",
  },
  {
    id: "instapay",
    nameAr: "إنستا باي (InstaPay)",
    nameEn: "InstaPay",
    icon: QrCode,
    color: "from-purple-600 to-indigo-600",
    number: "obourhub@instapay",
    instructionsAr:
      "حوّل مباشرة من أي حساب بنكي عبر عنوان الدفع IPA ثم أدخل الملاحظات لتأكيد السداد.",
    instructionsEn:
      "Transfer via InstaPay IPA address and enter transaction reference for verification.",
  },
  {
    id: "fawry",
    nameAr: "فوري (Fawry)",
    nameEn: "Fawry Pay",
    icon: CreditCard,
    color: "from-amber-500 to-yellow-600",
    number: "Code: 98842",
    instructionsAr: "ادفع في أي منفذ فوري أدخل الكود الخاص بالعملية لتأكيد التفعيل.",
    instructionsEn: "Pay at any Fawry outlet and input receipt reference number.",
  },
  {
    id: "card",
    nameAr: "بطاقة بنكية (Visa / Mastercard)",
    nameEn: "Credit / Debit Card",
    icon: CreditCard,
    color: "from-blue-600 to-cyan-600",
    number: "Visa / Mastercard",
    instructionsAr: "الدفع الآمن المباشر عبر الفيزا أو الماستركارد.",
    instructionsEn: "Direct secure card checkout.",
  },
];

export default function ObourPlusSubscriptionPage() {
  const { user, updateProfile } = useAuth();
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [billingCycle, setBillingCycle] = useState<"monthly" | "semester">("semester");
  const [selectedMethod, setSelectedMethod] = useState<string>("vodafone");
  const [senderPhone, setSenderPhone] = useState<string>("");
  const [transferNotes, setTransferNotes] = useState<string>("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isOwnerOrAdmin =
    user?.role === "owner" ||
    user?.role === "admin" ||
    user?.email === process.env.NEXT_PUBLIC_OWNER_EMAIL;
  const isVip = user?.isVip || isOwnerOrAdmin;

  const handleSubmitSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(isAr ? "يرجى تسجيل الدخول أولاً" : "Please log in first");
      return;
    }

    if (isOwnerOrAdmin) {
      // Owner/Admin auto activation
      setLoading(true);
      try {
        await updateProfile({
          isVip: true,
          subscriptionTier: "vip",
        });
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        toast.success(
          isAr
            ? "👑 بصفتك صاحب المنصة / أدمن، تفعّلت جميع مميزات بلس تلقائياً وحصرياً بحسابك!"
            : "👑 As Owner/Admin, VIP status is permanently active on your account!",
          { duration: 5000 }
        );
        setShowCheckoutModal(false);
      } catch {
        toast.error(isAr ? "حدث خطأ أثناء التحديث" : "Failed to update profile");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!senderPhone.trim()) {
      toast.error(
        isAr
          ? "يرجى إدخال رقم المحفظة / مرجع التحويل"
          : "Please enter sender phone / transaction reference"
      );
      return;
    }

    setLoading(true);
    try {
      if (db) {
        await addDoc(collection(db, "subscription_requests"), {
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || user.email,
          method: selectedMethod,
          senderPhone: senderPhone.trim(),
          transferNotes: transferNotes.trim(),
          billingCycle,
          amount: billingCycle === "semester" ? "199 EGP" : "49 EGP",
          status: "pending",
          createdAt: serverTimestamp(),
        });
      }

      setSubmitted(true);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      toast.success(
        isAr
          ? "🚀 تم إرسال طلب الاشتراك بنجاح! سيتم مراجعة التحويل وتفعيل العبور بلس خلال دقائق."
          : "🚀 Subscription request submitted! Your VIP Pass will be verified and activated shortly.",
        { duration: 6000 }
      );
      setShowCheckoutModal(false);
    } catch (err) {
      console.error("[Subscription Submit Error]:", err);
      toast.error(
        isAr ? "حدث خطأ أثناء إرسال الطلب، حاول مرة أخرى" : "Failed to submit subscription request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-10 max-w-7xl mx-auto min-h-screen page-transition">
      {/* ── Hero Banner ────────────────────────────────────────────────── */}
      <FadeIn>
        <div className="relative rounded-3xl sm:rounded-4xl overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#090d16] border border-amber-500/40 p-8 sm:p-12 shadow-2xl text-center space-y-5 text-white relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase tracking-widest border border-amber-500/40 backdrop-blur-md">
            <Crown size={16} className="text-amber-400 animate-pulse" />
            <span>{isAr ? "باقة النخبة الأكاديمية" : "Obour Hub VIP Pass"}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-harman leading-tight">
            {isAr ? "👑 العبور بلس | Obour Hub VIP" : "👑 Obour Hub VIP Pass"}
          </h1>

          <p className="text-white/70 text-sm sm:text-base max-w-3xl mx-auto font-medium leading-relaxed">
            {isAr
              ? "استثمر في تفوقك الأكاديمي واستمتع بالذكاء الاصطناعي غير المحدود لتحويل المحاضرات، واختبارات المراجعة الذكية، وضاعف نقاط الخبرة XP للوصول إلى قمة لوحة الصدارة."
              : "Upgrade your academic journey with unlimited AI lecture transcriptions, smart practice exams, 2x XP multipliers, and exclusive VIP perks."}
          </p>

          {/* Active VIP Status Indicator */}
          {isVip && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black text-sm shadow-xl"
            >
              <Sparkles size={18} />
              <span>
                {isOwnerOrAdmin
                  ? isAr
                    ? "أنت صاحب المنصة / أدمن - جميع مميزات بلس مفعلة بحسابك تلقائياً 👑"
                    : "You are Owner/Admin - All VIP perks permanently active 👑"
                  : isAr
                    ? "أنت الآن مشترك في العبور بلس 👑"
                    : "You have an active Obour VIP Pass 👑"}
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
                  <span>{isAr ? "معدل XP عالي 1x" : "1x Standard XP rate"}</span>
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

            <button
              disabled
              className="w-full py-4 rounded-2xl bg-muted text-muted-foreground font-extrabold text-sm text-center cursor-default"
            >
              {isAr ? "باقتك الحالية" : "Current Plan"}
            </button>
          </div>
        </ScaleIn>

        {/* VIP Pass Plan */}
        <ScaleIn>
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#0f172a] border-2 border-amber-500/60 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden h-full text-white">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-400 text-black font-black text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-lg">
              {isAr ? "الأعلى طلباً ⚡" : "Most Popular ⚡"}
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
                      ? "أولولوية في حجز مجموعات المذاكرة والـ Buddies ⚔️"
                      : "Priority Study Buddies Matching ⚔️"}
                  </span>
                </li>
              </ul>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCheckoutModal(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-black font-black text-base shadow-xl hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Crown size={20} />
              <span>
                {isOwnerOrAdmin
                  ? isAr
                    ? "الاشتراك مفعل تلقائياً بحسابك 👑"
                    : "Permanently Active on Account 👑"
                  : isVip
                    ? isAr
                      ? "اشتراكك مفعل بالفعل 👑"
                      : "VIP Pass Active 👑"
                    : isAr
                      ? "اشترك الآن وانضم للنخبة 🚀"
                      : "Upgrade to VIP Pass Now 🚀"}
              </span>
            </motion.button>
          </div>
        </ScaleIn>
      </StaggerChildren>

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

      {/* ── Interactive Checkout Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-100 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-4xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"
              >
                <XCircle size={24} />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30 text-amber-500">
                  <Crown size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-foreground">
                    {isAr ? "إتمام الاشتراك - العبور بلس 👑" : "Checkout - Obour VIP Pass 👑"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {billingCycle === "semester"
                      ? isAr
                        ? "الباقة الفصلية: 199 EGP / ترم كامل"
                        : "Semester Pass: 199 EGP / full term"
                      : isAr
                        ? "الباقة الشهري: 49 EGP / شهر"
                        : "Monthly Pass: 49 EGP / month"}
                  </p>
                </div>
              </div>

              {isOwnerOrAdmin ? (
                <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-center space-y-3">
                  <Crown className="mx-auto text-amber-400 w-12 h-12 animate-bounce" />
                  <h4 className="font-black text-lg text-foreground">
                    {isAr
                      ? "حسابك يمتلك صلاحيات مالك المنصة / الأدمن 👑"
                      : "You are Owner/Admin 👑"}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {isAr
                      ? "جميع مميزات العبور بلس (Obour VIP Pass) مفعلة بحسابك تلقائياً وبشكل دائم بدون حاجة إلى سداد رسوم."
                      : "All Obour VIP Pass features are permanently active on your account."}
                  </p>
                  <button
                    onClick={handleSubmitSubscription}
                    className="w-full py-3.5 rounded-2xl bg-amber-500 text-black font-extrabold text-sm shadow-lg hover:bg-amber-400 transition"
                  >
                    {isAr ? "تأكيد التفعيل بحسابك 👑" : "Confirm Owner Active Status 👑"}
                  </button>
                </div>
              ) : submitted ? (
                <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                  <CheckCircle2 className="mx-auto text-emerald-500 w-12 h-12" />
                  <h4 className="font-black text-lg text-foreground">
                    {isAr ? "تم إرسال طلبك بنجاح! 🚀" : "Request Submitted! 🚀"}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {isAr
                      ? "سيتم مراجعة إيصال التحويل بواسطة إدارة المنصة وتفعيل العبور بلس بحسابك خلال دقائق."
                      : "Our admin team will verify your transfer and activate your VIP Pass shortly."}
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setShowCheckoutModal(false);
                    }}
                    className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm shadow-lg"
                  >
                    {isAr ? "إغلاق النافذة" : "Close"}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitSubscription} className="space-y-4">
                  {/* Payment Methods Tabs */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {isAr ? "اختر طريقة الدفع المناسبة:" : "Select Payment Method:"}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map((method) => {
                        const Icon = method.icon;
                        const isSelected = selectedMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setSelectedMethod(method.id)}
                            className={cn(
                              "p-3 rounded-2xl border transition-all text-left flex items-center gap-2",
                              isSelected
                                ? "border-primary bg-primary/10 ring-1 ring-primary"
                                : "border-border/60 hover:bg-muted/50"
                            )}
                          >
                            <div
                              className={cn(
                                "p-2 rounded-xl text-white bg-linear-to-br",
                                method.color
                              )}
                            >
                              <Icon size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-extrabold text-foreground truncate">
                                {isAr ? method.nameAr.split("(")[0] : method.nameEn}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Instructions Box */}
                  {(() => {
                    const current = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
                    if (!current) return null;
                    return (
                      <div className="p-4 rounded-2xl bg-muted/50 border border-border space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-foreground">
                          <span>{isAr ? "بيانات التحويل:" : "Payment Target:"}</span>
                          <span className="font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-xl border border-primary/20">
                            {current.number}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                          {isAr ? current.instructionsAr : current.instructionsEn}
                        </p>
                      </div>
                    );
                  })()}

                  {/* User Phone / Reference Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground">
                      {isAr
                        ? "رقم المحفظة أو مرجع التحويل *"
                        : "Sender Phone or Reference Number *"}
                    </label>
                    <input
                      type="text"
                      required
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder={
                        isAr ? "مثال: 01012345678 أو كود العملية" : "e.g. 01012345678 or Txn Ref"
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Notes Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground">
                      {isAr ? "ملاحظات إضافية (اختياري)" : "Additional Notes (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={transferNotes}
                      onChange={(e) => setTransferNotes(e.target.value)}
                      placeholder={isAr ? "أية ملاحظات خاصة بالعملية" : "Optional notes"}
                      className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCheckoutModal(false)}
                      className="px-5 py-3.5 rounded-2xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80 transition"
                    >
                      {isAr ? "إلغاء" : "Cancel"}
                    </button>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-black font-extrabold text-sm shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Send size={18} />
                      <span>
                        {loading
                          ? isAr
                            ? "جارٍ إرسال الطلب..."
                            : "Submitting..."
                          : isAr
                            ? "تأكيد وإرسال إثبات الدفع 🚀"
                            : "Submit Payment Verification 🚀"}
                      </span>
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
