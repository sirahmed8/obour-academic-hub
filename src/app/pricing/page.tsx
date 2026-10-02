"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage, useAuth } from "@/contexts";
import { formatEGP, isVip, isOwner } from "@/lib/permissions";
import {
  Check,
  X,
  Crown,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  CreditCard,
  Send,
} from "lucide-react";
import { FadeIn, ScaleIn } from "@/components/ui/Animations";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";

type BillingCycle = "monthly" | "semester" | "annual";

interface FeatureRow {
  nameAr: string;
  nameEn: string;
  categoryAr: string;
  categoryEn: string;
  free: string | boolean;
  vip: string | boolean;
  opMode: string | boolean;
}

const COMPARISON_MATRIX: FeatureRow[] = [
  {
    nameAr: "تصفح وتحميل محاضرات وسلايدات المواد",
    nameEn: "Lecture notes and slide downloads",
    categoryAr: "المصادر الأكاديمية",
    categoryEn: "Academic Resources",
    free: true,
    vip: true,
    opMode: true,
  },
  {
    nameAr: "بنك الامتحانات السابقة والمراجعات",
    nameEn: "Past exams and past papers",
    categoryAr: "المصادر الأكاديمية",
    categoryEn: "Academic Resources",
    free: true,
    vip: true,
    opMode: true,
  },
  {
    nameAr: "تفريغ المحاضرات الصوتية بالذكاء الاصطناعي",
    nameEn: "AI audio lecture transcription",
    categoryAr: "أدوات الذكاء الاصطناعي",
    categoryEn: "AI Tools",
    free: "3 جلسات / شهر",
    vip: "غير محدود ⚡",
    opMode: "غير محدود (OP)",
  },
  {
    nameAr: "مولد الاختبارات والمراجعات الذكية",
    nameEn: "AI interactive practice quizzes",
    categoryAr: "أدوات الذكاء الاصطناعي",
    categoryEn: "AI Tools",
    free: "5 أسئلة فقط",
    vip: "حتى 20 سؤالاً بالحلول",
    opMode: "غير محدود (OP)",
  },
  {
    nameAr: "توليد الخرائط الذهنية للمفاهيم",
    nameEn: "AI concept mind maps",
    categoryAr: "أدوات الذكاء الاصطناعي",
    categoryEn: "AI Tools",
    free: "خرائط أساسية",
    vip: "تصدير وتفرعات كاملة",
    opMode: "غير محدود (OP)",
  },
  {
    nameAr: "مضاعف نقاط الخبرة ومؤقت التركيز",
    nameEn: "XP booster & study streak reward",
    categoryAr: "التحفيز الأكاديمي",
    categoryEn: "Gamification",
    free: "1x قياسي",
    vip: "مضاعف 2x VIP 🔥",
    opMode: "مضاعف 2x VIP 🔥",
  },
  {
    nameAr: "المساعد الذكي للمواد والأسئلة الأكاديمية",
    nameEn: "Academic AI chatbot assistance",
    categoryAr: "المساعد الذكي",
    categoryEn: "AI Assistant",
    free: "10 رسائل / يوم",
    vip: "استفسارات غير محدودة",
    opMode: "غير محدود (OP Mode)",
  },
  {
    nameAr: "وسام VIP الذهبي الموثق في المجتمع",
    nameEn: "Verified Golden VIP Profile Badge",
    categoryAr: "الحساب والمجتمع",
    categoryEn: "Account & Community",
    free: false,
    vip: true,
    opMode: "👑 مالك / مشرف",
  },
  {
    nameAr: "سرعة مراجعة وتفعيل الحساب",
    nameEn: "Verification & activation SLA",
    categoryAr: "الدعم الفني",
    categoryEn: "Customer Care",
    free: "خدمة ذاتية",
    vip: "أقل من ساعتين ⚡",
    opMode: "فوري دائم",
  },
];

export default function PricingPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isAr = language === "ar";

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("semester");
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState(user?.email || "");
  const [waitlistName, setWaitlistName] = useState(user?.displayName || "");
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const hasVip = isVip(user);
  const hasOwner = isOwner(user);

  const prices = {
    monthly: 49,
    semester: 199,
    annual: 349,
  };

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail.trim()) {
      toast.error(isAr ? "يرجى إدخال البريد الإلكتروني" : "Please enter your email");
      return;
    }

    setWaitlistLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; message: string; messageEn: string }>(
        "/api/subscriptions/waitlist",
        {
          method: "POST",
          body: JSON.stringify({
            email: waitlistEmail.trim(),
            name: waitlistName.trim() || undefined,
            gateway: "card_online",
            plan: billingCycle,
            notes: "Direct online card checkout waitlist submission",
          }),
        }
      );

      toast.success(isAr ? res.message : res.messageEn);
      setShowWaitlistModal(false);
    } catch {
      toast.error(
        isAr ? "تعذر التسجيل حالياً، يرجى المحاولة لاحقاً" : "Failed to register for waitlist"
      );
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-12 w-full page-transition min-h-screen max-w-6xl mx-auto"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Hero Header */}
      <FadeIn>
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-black text-xs uppercase tracking-wider border border-primary/20">
            <Crown size={14} className="text-amber-500" />
            <span>
              {isAr ? "استثمار أكاديمي عادل وشفاف" : "Fair & Transparent Academic Pricing"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground font-harman tracking-tight">
            {isAr
              ? "ارتقِ بمستواك الدراسي مع باقات العبور بلس"
              : "Accelerate Your Degree With Obour Plus"}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-lg font-medium leading-relaxed">
            {isAr
              ? "استمتع بأدوات ذكاء اصطناعي غير محدودة، وتفريغ صوتي للمحاضرات، واختبارات تفاعلية، مع الاحتفاظ بجميع الخدمات الأساسية مجاناً للجميع."
              : "Unleash unmetered AI power, audio lecture transcriptions, and interactive practice exams, while foundational materials remain 100% free."}
          </p>

          {/* Billing Cycle Switcher */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-card border border-border shadow-md">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  billingCycle === "monthly"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isAr ? "شهري (49 ج.م)" : "Monthly (49 EGP)"}
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("semester")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black relative transition-all ${
                  billingCycle === "semester"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{isAr ? "فصل دراسي (199 ج.م)" : "Semester (199 EGP)"}</span>
                <span className="absolute -top-2.5 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-black text-white shadow-xs">
                  {isAr ? "الأكثر طلباً" : "Popular"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black relative transition-all ${
                  billingCycle === "annual"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{isAr ? "سنوي (349 ج.م)" : "Annual (349 EGP)"}</span>
                <span className="absolute -top-2.5 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[10px] font-black text-white shadow-xs">
                  {isAr ? "شهرين مجاناً" : "2 Mo Free"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {/* Card 1: Free Tier */}
        <ScaleIn>
          <div className="h-full rounded-3xl bg-card border border-border/80 p-6 sm:p-8 flex flex-col justify-between shadow-md hover:border-primary/40 transition-all">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                  {isAr ? "الأساسي" : "Foundational"}
                </span>
                <h3 className="text-2xl font-black text-foreground">
                  {isAr ? "طالب مجاني" : "Free Student"}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  {isAr
                    ? "كل ما تحتاجه للوصول للمحاضرات والامتحانات الأساسية دون أي رسوم."
                    : "Essential tools to access courses and baseline resources with zero cost."}
                </p>
              </div>

              <div className="py-2">
                <div className="text-4xl font-black text-foreground">
                  {formatEGP(0, isAr ? "ar" : "en")}
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {isAr ? "مجاناً دائماً" : "Free forever"}
                </span>
              </div>

              <div className="pt-4 border-t border-border/60 space-y-2.5">
                {[
                  isAr ? "تحميل جميع المحاضرات والمذكرات" : "Download all lecture slides & PDFs",
                  isAr ? "الوصول لبنك الامتحانات السابقة" : "Access all past term exams",
                  isAr ? "3 جلسات تفريغ صوتي شهرياً" : "3 audio transcriptions / month",
                  isAr ? "اختبارات ذكية (5 أسئلة)" : "AI quizzes (5 questions)",
                  isAr ? "10 استفسارات يومية مع المساعد الذكي" : "10 AI chatbot queries / day",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs font-bold text-foreground"
                  >
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/subject"
                className="w-full py-3 rounded-2xl bg-muted/70 hover:bg-muted text-foreground font-black text-xs flex items-center justify-center gap-2 transition"
              >
                <span>{isAr ? "ابدأ المذاكرة مجاناً" : "Start Studying Free"}</span>
                <ArrowRight size={14} className={isAr ? "rotate-180" : ""} />
              </Link>
            </div>
          </div>
        </ScaleIn>

        {/* Card 2: Obour Plus VIP (Hero Card) */}
        <ScaleIn>
          <div className="h-full rounded-3xl bg-card border-2 border-primary p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black px-4 py-1 rounded-bl-2xl uppercase tracking-wider">
              {isAr ? "القيمة المثالية 👑" : "Best Value 👑"}
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-black text-primary uppercase tracking-wider">
                  {isAr ? "الاحترافي" : "Elite Academic"}
                </span>
                <h3 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <span>{isAr ? "العبور بلس (VIP)" : "Obour Plus (VIP)"}</span>
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  {isAr
                    ? "وصول كامل وغير محدود لأدوات الذكاء الاصطناعي وبنوك الحلول طوال الترم."
                    : "Unmetered AI assistance, rich audio transcription, and double XP boost."}
                </p>
              </div>

              <div className="py-2">
                <div className="text-4xl font-black text-primary">
                  {formatEGP(prices[billingCycle], isAr ? "ar" : "en")}
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {billingCycle === "monthly"
                    ? isAr
                      ? "لكل شهر تقويمي"
                      : "per calendar month"
                    : billingCycle === "semester"
                      ? isAr
                        ? "لفصل دراسي كامل (4 أشهر)"
                        : "per full semester (4 months)"
                      : isAr
                        ? "لسنة أكاديمية كاملة (12 شهراً)"
                        : "per academic year (12 months)"}
                </span>
              </div>

              <div className="pt-4 border-t border-border/60 space-y-2.5">
                {[
                  isAr ? "تفريغ صوتي غير محدود للمحاضرات" : "Unlimited audio lecture transcription",
                  isAr
                    ? "اختبارات تفاعلية حتى 20 سؤالاً بالحل"
                    : "Interactive quizzes up to 20 questions",
                  isAr
                    ? "توليد وتصدير الخرائط الذهنية بالكامل"
                    : "Generate & export deep concept mindmaps",
                  isAr
                    ? "مضاعف 2x XP لمؤقت التركيز والمهام"
                    : "2x XP study multiplier for focus timer",
                  isAr ? "مساعد ذكي أكاديمي غير محدود" : "Unmetered 24/7 AI tutor assistance",
                  isAr ? "شارة VIP ذهبية موثقة لملفك الشخصي" : "Golden verified VIP profile badge",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs font-bold text-foreground"
                  >
                    <Sparkles size={14} className="text-amber-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 space-y-2.5">
              {hasOwner ? (
                <div className="w-full py-3 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-center font-black text-xs">
                  {isAr
                    ? "👑 أنت مالك المنصة - صلاحيات VIP نشطة دائماً"
                    : "👑 Owner Account - Lifetime VIP Active"}
                </div>
              ) : hasVip ? (
                <Link
                  href="/plus"
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition active:scale-98"
                >
                  <Crown size={14} />
                  <span>{isAr ? "عرض حالة اشتراكي الحالي" : "View My VIP Status"}</span>
                </Link>
              ) : (
                <Link
                  href="/plus"
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition active:scale-98"
                >
                  <Crown size={14} />
                  <span>
                    {isAr ? "اشترك فوراً عبر انستاباي / كاش" : "Subscribe via InstaPay / Wallets"}
                  </span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => setShowWaitlistModal(true)}
                className="w-full py-2.5 rounded-2xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
              >
                <CreditCard size={13} />
                <span>
                  {isAr
                    ? "الدفع المباشر بالفيزا / ماستركارد (قريباً)"
                    : "Direct Card Checkout (Priority Waitlist)"}
                </span>
              </button>
            </div>
          </div>
        </ScaleIn>

        {/* Card 3: Priority Access / Custom Enterprise */}
        <ScaleIn>
          <div className="h-full rounded-3xl bg-card border border-border/80 p-6 sm:p-8 flex flex-col justify-between shadow-md hover:border-primary/40 transition-all">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
                  {isAr ? "المؤسسي والدعم" : "Academic Partners"}
                </span>
                <h3 className="text-2xl font-black text-foreground">
                  {isAr ? "المجموعات والأكاديميين" : "Study Cohorts"}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  {isAr
                    ? "اشتراكات جماعية لدفعات كاملة ومجموعات دراسية مع لوحة متابعة خاصة."
                    : "Bulk study group subscriptions with group progress analytics and direct tutor contact."}
                </p>
              </div>

              <div className="py-2">
                <div className="text-3xl font-black text-foreground">
                  {isAr ? "خصم دفعات" : "Cohort Discount"}
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {isAr ? "خصم حتى 35% للمجموعات الدراسية" : "Up to 35% off for student teams"}
                </span>
              </div>

              <div className="pt-4 border-t border-border/60 space-y-2.5">
                {[
                  isAr
                    ? "تفعيل جماعي لجميع أعضاء المجموعة"
                    : "Simultaneous activation for all members",
                  isAr ? "جلسات حجز ومراجعة خاصة (Hagaz)" : "Dedicated private study slots (Hagaz)",
                  isAr ? "قناة دعم أكاديمي مخصصة" : "Direct priority academic support channel",
                  isAr ? "تصدير تقارير الإنجاز الدراسي" : "Export cohort GPA & streak reports",
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs font-bold text-foreground"
                  >
                    <Check size={14} className="text-primary shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <a
                href="mailto:support@oi.edu.eg?subject=Cohort%20VIP%20Subscription%20Inquiry"
                className="w-full py-3 rounded-2xl bg-muted/70 hover:bg-muted text-foreground font-black text-xs flex items-center justify-center gap-2 transition"
              >
                <span>{isAr ? "تواصل معنا للاشتراك الجماعي" : "Contact Academic Team"}</span>
                <Send size={13} />
              </a>
            </div>
          </div>
        </ScaleIn>
      </div>

      {/* Statutory Guarantee Banner */}
      <FadeIn>
        <div className="p-6 sm:p-8 rounded-3xl bg-muted/30 border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-black text-foreground">
                {isAr
                  ? "ضمان استرجاع الأموال بنسبة 100% لمدة 14 يوماً"
                  : "100% 14-Day Statutory Money-Back Guarantee"}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {isAr
                  ? "وفقاً للمادة 17 من قانون حماية المستهلك المصري رقم 181 لسنة 2018، يمكنك طلب استرداد المبلغ بالكامل خلال 14 يوماً بدون أي أسئلة."
                  : "Under Article 17 of Egyptian Consumer Protection Law No. 181/2018, enjoy full unconditional refund rights within 14 days."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/legal/refund"
              className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1"
            >
              <span>{isAr ? "سياسة الاسترجاع الرسمية" : "Official Refund Policy"}</span>
              <ArrowRight size={13} className={isAr ? "rotate-180" : ""} />
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* Full Feature Comparison Table */}
      <FadeIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-md space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              {isAr ? "مقارنة المزايا الكاملة بين الباقات" : "Granular Feature Matrix"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {isAr
                ? "جدول شفاف يوضح ما تحصل عليه في كل باقة بالتفصيل."
                : "Full transparency on feature limits and unlocks."}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b border-border/80 text-xs text-muted-foreground font-black">
                  <th className="py-3 px-4 text-start">
                    {isAr ? "الميزة الأكاديمية" : "Academic Feature"}
                  </th>
                  <th className="py-3 px-4 text-center">{isAr ? "المجاني" : "Free"}</th>
                  <th className="py-3 px-4 text-center text-primary">
                    {isAr ? "العبور بلس (VIP)" : "Obour Plus (VIP)"}
                  </th>
                  <th className="py-3 px-4 text-center">
                    {isAr ? "المشرف والأكاديمي" : "OP Mode"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs font-bold text-foreground">
                {COMPARISON_MATRIX.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold">{isAr ? row.nameAr : row.nameEn}</div>
                      <div className="text-[10px] text-muted-foreground font-medium">
                        {isAr ? row.categoryAr : row.categoryEn}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {typeof row.free === "boolean" ? (
                        row.free ? (
                          <Check size={16} className="text-emerald-500 mx-auto" />
                        ) : (
                          <X size={16} className="text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        <span className="text-muted-foreground">{row.free}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {typeof row.vip === "boolean" ? (
                        row.vip ? (
                          <Check size={16} className="text-primary font-black mx-auto" />
                        ) : (
                          <X size={16} className="text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        <span className="text-primary font-extrabold">{row.vip}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {typeof row.opMode === "boolean" ? (
                        row.opMode ? (
                          <Check size={16} className="text-amber-500 mx-auto" />
                        ) : (
                          <X size={16} className="text-muted-foreground/40 mx-auto" />
                        )
                      ) : (
                        <span className="text-muted-foreground">{row.opMode}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>

      {/* Frequently Asked Questions */}
      <FadeIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-md space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
              <HelpCircle className="text-primary" />
              <span>{isAr ? "الأسئلة الشائعة حول الاشتراكات" : "Frequently Asked Questions"}</span>
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {isAr
                ? "إجابات سريعة وواضحة على كل ما يهمك معرفته."
                : "Quick and clear answers to student questions."}
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                qAr: "كيف يتم الدفع وتفعيل باقة العبور بلس؟",
                qEn: "How do I pay and activate Obour Plus?",
                aAr: "يمكنك التحويل بسهولة عبر انستاباي (InstaPay) أو محافظ فودافون كاش / أورنج / اتصالات / وي كاش، ثم رفع لقطة شاشة لإيصال التحويل في صفحة الاشتراك. يقوم فريق الإدارة بمراجعة الإيصال وتفعيل باقتك فوراً في أقل من ساعتين.",
                aEn: "Transfer via InstaPay or Vodafone Cash / Egyptian mobile wallets, then upload the receipt screenshot. Our team verifies and activates your VIP account in under 2 hours.",
              },
              {
                qAr: "هل تبقى المحاضرات الأساسية وبنك الامتحانات مجانية؟",
                qEn: "Will lecture slides and past exams stay free?",
                aAr: "نعم، 100%! فلسفتنا تقوم على أن كل المواد الأساسية وسلايدات الأساتذة والامتحانات السابقة ستظل دائماً مجانية ومتاحة لجميع الطلاب دون أي رسوم.",
                aEn: "Yes, 100%! All course notes, slides, and historical exams will always remain freely accessible to every student.",
              },
              {
                qAr: "ماذا لو لم تعجبني الخدمة أو واجهت مشكلة؟",
                qEn: "What if I am unsatisfied with the service?",
                aAr: "نلتزم بضمان استرجاع الأموال بالكامل بنسبة 100% خلال 14 يوماً من تاريخ التفعيل وفقاً للقانون المصري، بدون أي تعقيد عبر مراسلتنا على support@oi.edu.eg.",
                aEn: "We offer a 100% 14-day money-back guarantee under Egyptian law. Simply email support@oi.edu.eg for an immediate resolution.",
              },
              {
                qAr: "متى ستتوفر بوابات الدفع المباشر بالبطاقات (Visa / Mastercard)؟",
                qEn: "When will direct Visa/Mastercard card payment launch?",
                aAr: "نحن في المراحل النهائية للربط الرسمي مع بوابات الدفع الإلكترونية المعتمدة في مصر. يمكنك تسجيل بريدك في قائمة أسبقية الوصول وسيتم إشعارك فور إطلاقها.",
                aEn: "We are currently completing payment gateway certification. Sign up for priority access to be notified the moment card checkout goes live.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-muted/30 border border-border/70 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-start font-black text-sm text-foreground hover:bg-muted/50 transition-colors"
                >
                  <span>{isAr ? faq.qAr : faq.qEn}</span>
                  <span className="text-primary font-bold text-lg">
                    {expandedFaq === idx ? "−" : "+"}
                  </span>
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed border-t border-border/40 pt-3">
                    {isAr ? faq.aAr : faq.aEn}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Priority Access Waitlist Modal */}
      <AnimatePresence>
        {showWaitlistModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="text-primary" size={20} />
                  <h4 className="text-lg font-black text-foreground">
                    {isAr ? "قائمة أسبقية الدفع بالبطاقات" : "Direct Card Checkout Waitlist"}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWaitlistModal(false)}
                  className="p-1 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-muted-foreground font-medium">
                {isAr
                  ? "سجل بريدك الإلكتروني لتكون أول من يجرب الدفع الفوري عبر الفيزا والماستركارد مع خصم خاص للمشتركين الأوائل."
                  : "Enter your email to receive early access to direct Visa/Mastercard payments with exclusive founder discounts."}
              </p>

              <form onSubmit={handleWaitlistSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    {isAr ? "الاسم (اختياري)" : "Name (Optional)"}
                  </label>
                  <input
                    type="text"
                    value={waitlistName}
                    onChange={(e) => setWaitlistName(e.target.value)}
                    placeholder={isAr ? "أحمد محمد" : "Ahmed Mohamed"}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-xs font-bold outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    {isAr ? "البريد الإلكتروني *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="student@oi.edu.eg"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-muted/50 border border-border text-xs font-bold outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={waitlistLoading}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs hover:opacity-90 transition disabled:opacity-50"
                  >
                    {waitlistLoading
                      ? isAr
                        ? "جاري التسجيل..."
                        : "Registering..."
                      : isAr
                        ? "تسجيل أسبقية الوصول"
                        : "Join Priority Access"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWaitlistModal(false)}
                    className="px-4 py-3 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80 transition"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
