"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts";
import { CheckCircle2, Clock, Crown, ArrowRight, Mail, Phone } from "lucide-react";
import { ScaleIn } from "@/components/ui/Animations";
import { CopyButton } from "@/components/ui/CopyButton";

function ThankYouContent() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const isAr = language === "ar";

  const ref = searchParams.get("ref") || `OBR-${Math.floor(100000 + Math.random() * 900000)}`;
  const plan = searchParams.get("plan") || "semester";
  const amount =
    searchParams.get("amount") || (plan === "annual" ? "349" : plan === "monthly" ? "49" : "199");

  const planTitles: Record<string, { ar: string; en: string }> = {
    monthly: { ar: "باقة العبور بلس الشهرية", en: "Obour Plus Monthly Pass" },
    semester: { ar: "باقة الفصل الدراسي (ترم كامل)", en: "Obour Plus Semester Pass" },
    annual: { ar: "باقة السنة الأكاديمية الكاملة", en: "Obour Plus Annual Pass" },
  };

  const currentPlanTitle = planTitles[plan] || planTitles.semester;

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-3xl mx-auto flex flex-col justify-center"
      dir={isAr ? "rtl" : "ltr"}
    >
      <ScaleIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xl space-y-8 text-center">
          {/* Success Animated Badge */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 size={44} className="stroke-[2.5]" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-amber-500 text-white shadow-md">
                <Crown size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-black text-primary uppercase tracking-wider">
              {isAr ? "تم استلام طلب الاشتراك بنجاح" : "Subscription Request Received"}
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-foreground font-harman">
              {isAr ? "شكراً لانضمامك إلى العبور بلس!" : "Thank You For Choosing Obour Plus!"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-xl mx-auto">
              {isAr
                ? "تم تسجيل بيانات تحويلك بنجاح وجارٍ الآن مراجعة إيصال السداد من قبل فريق إدارة المنصة."
                : "Your transfer receipt has been safely received and is queued for verification by our administrative team."}
            </p>
          </div>

          {/* Reference & Order Summary Card */}
          <div className="p-4 sm:p-6 rounded-2xl bg-muted/40 border border-border/70 space-y-3 text-start">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
              <span className="text-xs text-muted-foreground font-bold">
                {isAr ? "رقم مرجع الطلب (Reference ID)" : "Request Reference"}
              </span>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                  {ref}
                </code>
                <CopyButton text={ref} variant="outline" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-muted-foreground font-bold block">
                  {isAr ? "الباقة المختارة:" : "Selected Plan:"}
                </span>
                <span className="font-black text-foreground">
                  {isAr ? currentPlanTitle.ar : currentPlanTitle.en}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground font-bold block">
                  {isAr ? "المبلغ المسدد:" : "Paid Amount:"}
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {amount} ج.م (EGP)
                </span>
              </div>
            </div>
          </div>

          {/* SLA Response-Time Commitment Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-4 text-start">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Clock size={24} />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-black text-foreground">
                {isAr
                  ? "التزام سرعة التفعيل: في أقل من ساعتين ⚡"
                  : "Activation Guarantee: Under 2 Hours ⚡"}
              </h4>
              <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">
                {isAr
                  ? "يقوم المشرفون بمطابقة بيانات التحويل وتفعيل حسابك خلال دقائق إلى ساعتين كحد أقصى على مدار اليوم."
                  : "Our team verifies manual InstaPay & wallet transfers, activating VIP status in under 2 hours."}
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-3 text-start">
            <h4 className="text-xs font-black uppercase text-muted-foreground tracking-wider">
              {isAr ? "الخطوات التالية لتفعيل حسابك" : "What Happens Next"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-1">
                <span className="text-[10px] font-black text-primary">01. مراجعة الإيصال</span>
                <p className="text-xs font-bold text-foreground">مطابقة الإيصال وحساب المحول</p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-1">
                <span className="text-[10px] font-black text-primary">02. تفعيل VIP</span>
                <p className="text-xs font-bold text-foreground">منح شارة VIP وفتح كامل الأدوات</p>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-1">
                <span className="text-[10px] font-black text-primary">03. إشعار فوري</span>
                <p className="text-xs font-bold text-foreground">وصول إشعار تأكيد التفعيل لحسابك</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-black text-xs flex items-center justify-center gap-2 hover:opacity-90 transition active:scale-98 shadow-md"
            >
              <span>{isAr ? "الذهاب للوحة التحكم" : "Go to Dashboard"}</span>
              <ArrowRight size={14} className={isAr ? "rotate-180" : ""} />
            </Link>

            <Link
              href="/plus"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-black text-xs flex items-center justify-center gap-2 transition"
            >
              <span>{isAr ? "متابعة حالة الاشتراك" : "Track My Status"}</span>
            </Link>
          </div>

          {/* Direct Support */}
          <div className="pt-4 border-t border-border/50 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground font-medium">
            <span>{isAr ? "هل لديك استفسار عاجل؟" : "Have an urgent question?"}</span>
            <a
              href="mailto:support@oi.edu.eg"
              className="inline-flex items-center gap-1 font-bold text-foreground hover:text-primary transition"
            >
              <Mail size={13} />
              <span>support@oi.edu.eg</span>
            </a>
            <a
              href="tel:+20244770000"
              className="inline-flex items-center gap-1 font-bold text-foreground hover:text-primary transition"
            >
              <Phone size={13} />
              <span dir="ltr">+20 2 44770000</span>
            </a>
          </div>
        </div>
      </ScaleIn>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center font-bold text-muted-foreground">
          Loading confirmation...
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
