"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Clock,
  Smartphone,
  Copy,
  Upload,
  X,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  Send,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { uploadFileToFirebase } from "@/lib/storage";
import { SubscriptionPlanId, SubscriptionRequest, SubscriptionPaymentMethod } from "@/types";

interface MySubStatus {
  isVip: boolean;
  subscriptionTier: string;
  vipExpiresAt: string | null;
  daysRemaining: number | null;
  vipGrantedBy?: string | null;
  vipGrantedAt?: string | null;
  vipType?: "paid" | "gifted";
  latestRequest: SubscriptionRequest | null;
  requests: SubscriptionRequest[];
}

export default function ObourPlusSubscriptionPage() {
  const { user, updateProfile } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const isAr = language === "ar";

  const [billingCycle, setBillingCycle] = useState<SubscriptionPlanId>("semester");
  const [subStatus, setSubStatus] = useState<MySubStatus | null>(null);

  // Checkout Modal State
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlanId>("semester");
  const [paymentMethod, setPaymentMethod] = useState<SubscriptionPaymentMethod>("instapay");
  const [senderPhoneOrAccount, setSenderPhoneOrAccount] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [studentNotes, setStudentNotes] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Promo Code State
  const [promoCode, setPromoCode] = useState("");
  const [redeemingPromo, setRedeemingPromo] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwnerOrAdmin =
    user?.role === "owner" ||
    user?.role === "admin" ||
    user?.email === process.env.NEXT_PUBLIC_OWNER_EMAIL;

  const instapayAccount = process.env.NEXT_PUBLIC_INSTAPAY_ID || "obourhub@instapay";
  const vodafoneCashNumber = process.env.NEXT_PUBLIC_VODAFONE_CASH_NUMBER || "01023456789";

  const fetchMyStatus = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      const data = await apiFetch<MySubStatus>("/api/subscriptions/my-status");
      if (data) {
        setSubStatus(data);
      }
    } catch {
      // Fallback to local auth context
    }
  }, [user]);

  useEffect(() => {
    fetchMyStatus();
  }, [fetchMyStatus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCheckoutOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(isAr ? "تم النسخ إلى الحافظة بنجاح!" : "Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleOpenCheckout = (planId: SubscriptionPlanId) => {
    if (!user) {
      toast.error(isAr ? "يرجى تسجيل الدخول أولاً للمتابعة" : "Please log in to continue");
      return;
    }
    setCheckoutPlan(planId);
    setCheckoutStep(1);
    setCheckoutOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error(
        isAr ? "حجم الصورة يتجاوز الحد الأقصى (8 ميجابايت)" : "File size exceeds 8MB limit"
      );
      return;
    }

    setReceiptUploading(true);
    try {
      const res = await uploadFileToFirebase(file);
      if (res?.url) {
        setReceiptUrl(res.url);
        toast.success(isAr ? "تم رفع إيصال التحويل بنجاح" : "Receipt uploaded successfully");
      }
    } catch {
      toast.error(isAr ? "تعذر رفع صورة الإيصال" : "Failed to upload receipt");
    } finally {
      setReceiptUploading(false);
    }
  };

  const handleSubmitSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderPhoneOrAccount.trim()) {
      toast.error(
        isAr
          ? "يرجى إدخال رقم الهاتف أو الحساب المحول منه"
          : "Please enter the sender phone or account"
      );
      return;
    }

    setSubmittingOrder(true);
    try {
      const idempotencyKey = `sub_${user?.uid || "anon"}_${checkoutPlan}_${Date.now()}`;
      const res = await apiFetch<{
        success: boolean;
        requestId: string;
        message: string;
      }>("/api/subscriptions/request", {
        method: "POST",
        headers: {
          "x-idempotency-key": idempotencyKey,
        },
        body: {
          plan: checkoutPlan,
          paymentMethod,
          senderPhoneOrAccount: senderPhoneOrAccount.trim(),
          transactionReference: transactionReference.trim() || undefined,
          receiptUrl: receiptUrl || undefined,
          notes: studentNotes.trim() || undefined,
        },
      });

      if (res?.success) {
        toast.success(
          isAr
            ? "تم إرسال طلب الاشتراك بنجاح! سيتم مراجعته وتفعيل باقتك فوراً."
            : "Subscription request submitted! Will be reviewed and activated shortly."
        );
        setCheckoutOpen(false);
        const orderRef = transactionReference.trim() || `OBR-${Date.now().toString().slice(-6)}`;
        // Reset form
        setSenderPhoneOrAccount("");
        setTransactionReference("");
        setReceiptUrl("");
        setStudentNotes("");
        fetchMyStatus();
        const planPrices: Record<string, number> = {
          monthly: 49,
          semester: 199,
          annual: 349,
        };
        const paidAmount = planPrices[checkoutPlan] || 199;
        router.push(`/thank-you?plan=${checkoutPlan}&ref=${orderRef}&amount=${paidAmount}`);
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : isAr
            ? "حدث خطأ أثناء إرسال طلب الاشتراك"
            : "Failed to submit subscription request";
      toast.error(errorMsg);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleRedeemPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (!user) {
      toast.error(isAr ? "يرجى تسجيل الدخول أولاً" : "Please log in first");
      return;
    }

    setRedeemingPromo(true);
    try {
      const res = await apiFetch<{
        success: boolean;
        message: string;
        durationDays: number;
        expiresAt: string;
      }>("/api/subscriptions/redeem", {
        method: "POST",
        body: { code },
      });

      if (res?.success) {
        toast.success(
          isAr
            ? `🎉 تم تفعيل كود الخصم بنجاح لمدة ${res.durationDays} يوماً!`
            : `🎉 VIP activated for ${res.durationDays} days!`
        );
        setPromoCode("");
        // Optimistically update context profile
        if (updateProfile) {
          await updateProfile({
            isVip: true,
            subscriptionTier: "vip",
            vipGrantedBy: `Promo Code: ${code}`,
            vipExpiresAt: res.expiresAt,
          });
        }
        fetchMyStatus();
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : isAr
            ? "كود التفعيل غير صحيح أو منتهي الصلاحية"
            : "Invalid or expired promo code";
      toast.error(errorMsg);
    } finally {
      setRedeemingPromo(false);
    }
  };

  const isUserVip = Boolean(subStatus?.isVip || user?.isVip || isOwnerOrAdmin);
  const pendingRequest =
    subStatus?.latestRequest?.status === "pending" ? subStatus.latestRequest : null;
  const rejectedRequest =
    subStatus?.latestRequest?.status === "rejected" ? subStatus.latestRequest : null;

  return (
    <div className="p-4 sm:p-6 lg:p-10 pb-28 space-y-10 max-w-7xl mx-auto min-h-screen page-transition">
      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <FadeIn>
        <div className="relative rounded-3xl sm:rounded-4xl overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#111c33] to-[#090d16] border border-amber-500/40 p-8 sm:p-12 shadow-2xl text-center space-y-5 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs uppercase tracking-widest border border-amber-500/40 backdrop-blur-md">
            <Crown size={16} className="text-amber-400 animate-pulse" />
            <span>{isAr ? "اشتراك العبور بلس الأكاديمي" : "Obour Hub VIP Pass"}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-harman leading-tight">
            {isAr ? "العبور بلس | Obour Hub VIP" : "Obour Hub VIP Pass"}
          </h1>

          <p className="text-white/70 text-sm sm:text-base max-w-3xl mx-auto font-medium leading-relaxed">
            {isAr
              ? "استثمر في دراستك مع أدوات تفريغ المحاضرات الصوتية، وتوليد امتحانات المراجعة الشاملة بـ 20 سؤالاً مع الحلول، ومضاعف نقاط 2x XP على المهام اليومية."
              : "Upgrade your study workflow with audio lecture transcriptions, 20-question practice exams with step-by-step solutions, and a 2x XP task booster."}
          </p>

          {/* Active VIP Status Card */}
          {isUserVip && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/50 shadow-xl text-amber-300 font-bold text-sm"
            >
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-amber-400" />
                <span className="font-black">
                  {isAr
                    ? "اشتراك العبور بلس مفعل في حسابك!"
                    : "Obour VIP Pass is Active on Your Account!"}
                </span>
              </div>

              {!isOwnerOrAdmin && subStatus && subStatus.daysRemaining !== null && (
                <div className="flex items-center gap-2 text-xs bg-black/40 px-3 py-1 rounded-xl border border-amber-500/30 text-amber-200">
                  <Clock size={14} />
                  <span>
                    {isAr
                      ? `متبقي ${subStatus.daysRemaining} يوماً على التجديد`
                      : `${subStatus.daysRemaining} days remaining`}
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Pending Request Status Card */}
          {pendingRequest && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-6 max-w-xl mx-auto p-4 rounded-2xl bg-yellow-500/15 border border-yellow-500/40 text-yellow-300 text-xs sm:text-sm font-semibold space-y-2 text-start"
            >
              <div className="flex items-center gap-2 font-black text-yellow-400 text-sm">
                <Clock size={16} className="animate-spin" />
                <span>
                  {isAr
                    ? "طلب الاشتراك قيد المراجعة والتدقيق"
                    : "Subscription Request Under Review"}
                </span>
                <span className="ms-auto font-mono text-[10px] px-2 py-0.5 rounded bg-black/40">
                  #{pendingRequest.id.slice(-6)}
                </span>
              </div>
              <p className="text-white/80 text-xs leading-relaxed">
                {isAr
                  ? `تم استلام بيانات تحويل ${pendingRequest.amount} ج.م لباقة (${pendingRequest.planNameAr}). يقوم المشرف بمراجعة التحويل وتفعيل الحساب خلال 15 إلى 60 دقيقة.`
                  : `Transfer data for ${pendingRequest.amount} EGP (${pendingRequest.planNameEn}) received. Verification typically completes within 15-60 minutes.`}
              </p>
            </motion.div>
          )}

          {/* Rejected Request Notification */}
          {rejectedRequest && !pendingRequest && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-6 max-w-xl mx-auto p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs sm:text-sm font-semibold space-y-2 text-start"
            >
              <div className="flex items-center gap-2 font-black text-red-400 text-sm">
                <AlertCircle size={16} />
                <span>
                  {isAr ? "تعذر تفعيل الطلب السابق" : "Previous Request Could Not Be Verified"}
                </span>
              </div>
              <p className="text-white/80 text-xs">
                {rejectedRequest.rejectionReason ||
                  (isAr
                    ? "لم يتم العثور على رقم التحويل. يرجى التأكد من البيانات وإعادة الإرسال."
                    : "Transfer reference could not be verified. Please double-check and resubmit.")}
              </p>
              <button
                onClick={() => handleOpenCheckout(rejectedRequest.plan)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-all"
              >
                <span>
                  {isAr ? "إعادة إرسال بيانات التحويل الصحيحة" : "Resubmit Correct Details"}
                </span>
              </button>
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
              {isAr ? "اشتراك شهري (49 ج.م)" : "Monthly (49 EGP)"}
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
              <span>{isAr ? "باقة الفصل الدراسي (199 ج.م)" : "Semester Pass (199 EGP)"}</span>
              <span className="px-2 py-0.5 rounded-full bg-black/20 text-[10px] font-black uppercase">
                {isAr ? "وفر 35%" : "Save 35%"}
              </span>
            </button>

            <button
              onClick={() => setBillingCycle("annual")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all relative flex items-center gap-2",
                billingCycle === "annual"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{isAr ? "العام الأكاديمي (349 ج.م)" : "Academic Year (349 EGP)"}</span>
              <span className="px-2 py-0.5 rounded-full bg-black/20 text-[10px] font-black uppercase">
                {isAr ? "وفر 45%" : "Save 45%"}
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
                <span>{isAr ? "الباقة الأساسية للطلاب" : "Free Scholar"}</span>
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
                  ? "المميزات الأساسية للوصول لجميع المواد الدراسية وملفات المحاضرات."
                  : "Essential features for accessing subject lectures and materials."}
              </p>

              <hr className="border-border/60" />

              <ul className="space-y-3 text-xs sm:text-sm font-medium text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>
                    {isAr
                      ? "تصفح وتحميل كافة مواد الكلية ومحاضرات الـ PDF"
                      : "Full access to all subject PDF materials"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>
                    {isAr
                      ? "3 جلسات تفريغ صوتي للمحاضرات شهرياً"
                      : "3 AI lecture transcriptions / mo"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>
                    {isAr
                      ? "اختبارات مراجعة أساسية (5 أسئلة)"
                      : "Basic practice quizzes (5 questions)"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>
                    {isAr
                      ? "حجز مجموعات المذاكرة (Hagaz) وإدارة المهام"
                      : "Hagaz study booking & Todo manager"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  <span>{isAr ? "معدل XP قياسي 1x" : "1x Standard XP rate"}</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/40">
                  <XCircle size={16} className="shrink-0" />
                  <span>
                    {isAr ? "امتحانات ذكية كاملة بـ 20 سؤالاً" : "Full 20-Question AI Exams"}
                  </span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground/40">
                  <XCircle size={16} className="shrink-0" />
                  <span>
                    {isAr ? "وسام النخبة الذهبي ومضاعف XP" : "Golden VIP badge & 2x XP boost"}
                  </span>
                </li>
              </ul>
            </div>

            {!isUserVip ? (
              <div className="w-full py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm text-center flex items-center justify-center gap-2">
                <CheckCircle2 size={16} />
                <span>{isAr ? "باقتك الحالية - نشطة" : "Your Current Plan - Active"}</span>
              </div>
            ) : (
              <div className="w-full py-4 rounded-2xl bg-muted/40 border border-border text-muted-foreground font-bold text-sm text-center">
                {isAr ? "الباقة الأساسية المجانية" : "Basic Free Plan"}
              </div>
            )}
          </div>
        </ScaleIn>

        {/* VIP Pass Plan */}
        <ScaleIn>
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#0f172a] via-slate-900 to-[#0f172a] border-2 border-amber-500/60 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden h-full text-white">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-400 text-black font-black text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-bl-2xl shadow-lg">
              {billingCycle === "semester"
                ? isAr
                  ? "الأكثر طلباً وتوفيراً"
                  : "Most Popular"
                : billingCycle === "annual"
                  ? isAr
                    ? "أفضل قيمة سنوية"
                    : "Best Value"
                  : isAr
                    ? "مرونة شهرية"
                    : "Monthly Flexibility"}
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <Crown size={14} className="text-amber-400" />
                <span>{isAr ? "العبور بلس VIP PRO" : "VIP Pass PRO"}</span>
              </div>
              <h3 className="text-3xl font-black text-white font-harman">
                {isAr ? "باقة النخبة الأكاديمية" : "VIP Elite Pass"}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-amber-400 font-harman">
                  {billingCycle === "monthly"
                    ? "49 EGP"
                    : billingCycle === "semester"
                      ? "199 EGP"
                      : "349 EGP"}
                </span>
                <span className="text-xs text-white/60 font-medium">
                  /{" "}
                  {billingCycle === "monthly"
                    ? isAr
                      ? "شهرياً"
                      : "per month"
                    : billingCycle === "semester"
                      ? isAr
                        ? "ترم كامل (4 شهور)"
                        : "full semester"
                      : isAr
                        ? "سنة أكاديمية كاملة"
                        : "academic year"}
                </span>
              </div>
              <p className="text-xs text-amber-300/80 font-medium">
                {billingCycle === "semester"
                  ? isAr
                    ? "ادفع مرة واحدة واستمتع بالفصل الدراسي كاملاً مع خصم 35%!"
                    : "Pay once for the entire semester & save 35%!"
                  : billingCycle === "annual"
                    ? isAr
                      ? "تغطية كاملة لجميع الفصول الدراسية مع توفير 45%!"
                      : "Full coverage for both semesters with 45% savings!"
                    : isAr
                      ? "تجربة سهلة ومرنة، إمكانية الترقية للفصل الدراسي لاحقاً."
                      : "Flexible monthly access."}
              </p>

              <hr className="border-white/10" />

              <ul className="space-y-3 text-xs sm:text-sm font-medium text-white/90">
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-amber-400 shrink-0 font-bold" />
                  <span className="font-extrabold text-amber-300">
                    {isAr
                      ? "تفريغ صوتي غير محدود للمحاضرات بالذكاء الاصطناعي"
                      : "Unlimited AI Lecture Transcriptions"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-amber-400 shrink-0 font-bold" />
                  <span className="font-extrabold text-amber-300">
                    {isAr
                      ? "توليد امتحانات كاملة بـ 20 سؤالاً مع الشرح والحلول"
                      : "Unlimited 20-Question AI Exams with Explanations"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-amber-400 shrink-0 font-bold" />
                  <span>
                    {isAr ? "مضاعفة نقاط XP مرتين (2x Multiplier)" : "2x XP Points Multiplier"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-amber-400 shrink-0 font-bold" />
                  <span>
                    {isAr
                      ? "وسام النخبة الذهبي بجانب اسمك في البروفايل ولوحة الصدارة"
                      : "Golden VIP Crown Badge on Profile & Leaderboard"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-amber-400 shrink-0 font-bold" />
                  <span>
                    {isAr
                      ? "تصدير الملخصات والخطط بصيغة PDF معتمدة"
                      : "Certified PDF Summary & Exam Exports"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={16} className="text-amber-400 shrink-0 font-bold" />
                  <span>
                    {isAr
                      ? "توليد الخرائط الذهنية الذكية للمواد بدون حدود"
                      : "Unlimited AI Mind Maps"}
                  </span>
                </li>
              </ul>
            </div>

            {/* Subscribe / Extend CTA Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleOpenCheckout(billingCycle)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-black text-sm shadow-xl hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Crown size={18} />
              <span>
                {isUserVip
                  ? isAr
                    ? "تمديد اشتراك العبور بلس الآن"
                    : "Extend Obour VIP Pass Now"
                  : isAr
                    ? "اشترك الآن عبر فودافون كاش أو إنستا باي"
                    : "Subscribe via Vodafone Cash or InstaPay"}
              </span>
            </motion.button>
          </div>
        </ScaleIn>
      </StaggerChildren>

      {/* ── Promo Code Card ────────────────────────────────────────────── */}
      <FadeIn delay={0.08}>
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-card border border-amber-500/30 shadow-md space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 font-extrabold text-xs">
            <Sparkles size={14} />
            <span>{isAr ? "كود التفعيل والمنح" : "Promo & Access Code"}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-foreground font-harman">
            {isAr ? "لديك كود خصم أو اشتراك مجاني؟" : "Have a Promo or Scholarship Code?"}
          </h3>

          <p className="text-xs text-muted-foreground font-medium max-w-md mx-auto">
            {isAr
              ? "إذا حصلت على كود تفعيل من إدارة المعهد أو فعاليات الأنشطة الطلابية، أدخله هنا لتفعيل اشتراكك فوراً."
              : "Enter your official promotional or event code to instantly activate your VIP access."}
          </p>

          <form onSubmit={handleRedeemPromo} className="flex gap-2 max-w-md mx-auto pt-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder={isAr ? "أدخل الكود (مثل: OBOUR2026)" : "Enter code (e.g. OBOUR2026)"}
              className="flex-1 px-4 py-3 rounded-2xl bg-background border border-border text-xs sm:text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            <button
              type="submit"
              disabled={redeemingPromo || !promoCode.trim()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs sm:text-sm shadow-md hover:shadow-amber-500/25 transition-all disabled:opacity-50"
            >
              {redeemingPromo ? (
                <RefreshCw size={16} className="animate-spin mx-auto" />
              ) : isAr ? (
                "تفعيل"
              ) : (
                "Redeem"
              )}
            </button>
          </form>
        </div>
      </FadeIn>

      {/* ── Deep Dive Feature Highlights ───────────────────────────────── */}
      <FadeIn delay={0.1}>
        <div className="space-y-6 pt-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground font-harman">
              {isAr ? "لماذا يشترك طلاب معاهد العبور في VIP؟" : "Why Obour Students Choose VIP?"}
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              {isAr
                ? "أدوات حصرية لتسهيل المذاكرة وتحقيق تقديرات الامتياز مع توفير الوقت."
                : "Exclusive tools designed to maximize your GPA while saving study hours."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Mic,
                titleAr: "تفريغ المحاضرات الصوتية",
                titleEn: "AI Audio Transcriber",
                descAr:
                  "سجل المحاضرة واحصل فوراً على ملخص منظم ومصطلحات ونقاط رئيسية جاهزة للمذاكرة.",
                descEn: "Record lectures and get instant structured summaries and definitions.",
                color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
              },
              {
                icon: Zap,
                titleAr: "امتحانات تفاعلية 20 سؤالاً",
                titleEn: "20-Question AI Exams",
                descAr:
                  "تدرب على امتحانات واقعية شاملة للمنهج مع توضيح خطوات الحل الصحيح لكل سؤال.",
                descEn:
                  "Practice with realistic exams and detailed step-by-step solution breakdowns.",
                color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
              },
              {
                icon: Flame,
                titleAr: "مضاعف نقاط الخبرة 2x",
                titleEn: "2x XP Points Boost",
                descAr: "ضاعف XP الذي تحصده عند حل الأسئلة والمهام وتصدر لوحة الصدارة الأكاديمية.",
                descEn: "Earn double XP on all completed tasks and lead the student rankings.",
                color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
              },
              {
                icon: BarChart2,
                titleAr: "خرائط ذهنية وتصدير PDF",
                titleEn: "Mind Maps & PDF Exports",
                descAr:
                  "حوّل أي موضوع لخريطة ذهنية واضحة واحفظ الملخصات بصيغة PDF للطباعة السريعة.",
                descEn: "Generate visual concept maps and download print-ready revision PDFs.",
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

      {/* ── FAQ Section ────────────────────────────────────────────────── */}
      <FadeIn delay={0.12}>
        <div className="max-w-3xl mx-auto space-y-4 pt-6">
          <div className="text-center space-y-1 pb-2">
            <h3 className="text-xl sm:text-2xl font-black text-foreground font-harman">
              {isAr ? "الأسئلة الشائعة حول الاشتراك" : "Frequently Asked Questions"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isAr
                ? "كل ما تحتاج معرفته عن الدفع والتفعيل"
                : "Everything about payment & activation"}
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                qAr: "كم يستغرق تفعيل الاشتراك بعد التحويل؟",
                qEn: "How long does activation take after transfer?",
                aAr: "يتم التحقق من تحويلات إنستا باي وفودافون كاش وتفعيل باقة الطالب عادةً خلال 15 إلى 45 دقيقة من إرسال الطلب.",
                aEn: "InstaPay and Vodafone Cash transfers are verified within 15 to 45 minutes on average.",
              },
              {
                qAr: "هل يمكنني الدفع عبر أي محفظة إلكترونية أخرى؟",
                qEn: "Can I pay using other mobile wallets?",
                aAr: "نعم! رقم فودافون كاش يستقبل التحويلات من كافة المحافظ الإلكترونية في مصر (أورانج كاش، اتصالات كاش، وي باي، محافظ البنوك الذكية).",
                aEn: "Yes! The mobile wallet accepts transfers from all Egyptian wallets (Vodafone, Orange, Etisalat, WE, and Smart Bank Wallets).",
              },
              {
                qAr: "إذا كان لدي اشتراك نشط وقمت بالتجديد، هل يضيع ما تبقى؟",
                qEn: "If I renew while active, do I lose remaining days?",
                aAr: "أبداً! التجديد يعمل بشكل تراكمي وتُضاف الأيام الجديدة مباشرة إلى تاريخ انتهاء اشتراكك الحالي.",
                aEn: "Never! Renewals add days cumulatively to your current expiration date without losing any days.",
              },
              {
                qAr: "هل الاشتراك متوافق مع سياسة الاسترجاع؟",
                qEn: "What is your refund policy?",
                aAr: "نعم، تخضع كافة الاشتراكات لسياسة الاسترجاع المعتمدة الموضحة في الرابط بالأسفل، مع ضمان استرداد كامل في حال وجود أي مشكلة تقنية.",
                aEn: "Yes, all subscriptions adhere to our official refund policy with full assistance for technical concerns.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border/80 space-y-2 text-start"
              >
                <div className="flex items-center gap-2 font-black text-sm text-foreground">
                  <HelpCircle size={16} className="text-amber-500 shrink-0" />
                  <span>{isAr ? faq.qAr : faq.qEn}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed ps-6">
                  {isAr ? faq.aAr : faq.aEn}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 text-center text-xs text-muted-foreground">
            {isAr ? (
              <>
                تخضع كافة الاشتراكات لـ{" "}
                <Link href="/legal/terms" className="font-bold text-primary hover:underline">
                  شروط الاستخدام
                </Link>{" "}
                و{" "}
                <Link href="/legal/refund" className="font-bold text-primary hover:underline">
                  سياسة الاسترجاع
                </Link>{" "}
                و{" "}
                <Link href="/legal/privacy" className="font-bold text-primary hover:underline">
                  سياسة الخصوصية
                </Link>
                .
              </>
            ) : (
              <>
                All subscriptions are governed by our{" "}
                <Link href="/legal/terms" className="font-bold text-primary hover:underline">
                  Terms of Service
                </Link>
                ,{" "}
                <Link href="/legal/refund" className="font-bold text-primary hover:underline">
                  Refund Policy
                </Link>
                , and{" "}
                <Link href="/legal/privacy" className="font-bold text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </>
            )}
          </div>
        </div>
      </FadeIn>

      {/* ── Interactive Egyptian Checkout Modal ─────────────────────────── */}
      <AnimatePresence>
        {checkoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in-0 duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl text-foreground text-start"
              dir={isAr ? "rtl" : "ltr"}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <Crown size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black font-harman">
                      {isAr ? "إتمام اشتراك العبور بلس" : "Complete VIP Subscription"}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">
                      {checkoutPlan === "monthly"
                        ? isAr
                          ? "باقة الاشتراك الشهري (49 ج.م)"
                          : "Monthly Pass (49 EGP)"
                        : checkoutPlan === "semester"
                          ? isAr
                            ? "باقة الفصل الدراسي (199 ج.م)"
                            : "Semester Pass (199 EGP)"
                          : isAr
                            ? "باقة العام الأكاديمي (349 ج.م)"
                            : "Academic Year Pass (349 EGP)"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCheckoutOpen(false)}
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Interactive 3-Step Linear Stepper with Strict Causality */}
              <div className="grid grid-cols-3 gap-2 p-1.5 bg-muted/40 rounded-2xl border border-border/50 text-xs">
                {/* Step 1 Tab */}
                <button
                  type="button"
                  onClick={() => setCheckoutStep(1)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 p-2 rounded-xl transition-all",
                    checkoutStep === 1
                      ? "bg-background text-foreground font-black shadow-sm"
                      : "text-muted-foreground hover:text-foreground cursor-pointer font-bold"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                      checkoutStep === 1
                        ? "bg-amber-500 text-black shadow-sm"
                        : "bg-emerald-500/20 text-emerald-500"
                    )}
                  >
                    {checkoutStep > 1 ? <Check size={12} /> : "1"}
                  </div>
                  <span className="truncate">{isAr ? "طريقة الدفع" : "Method"}</span>
                </button>

                {/* Step 2 Tab (Locked if on Step 1) */}
                <button
                  type="button"
                  disabled={checkoutStep < 2}
                  onClick={() => {
                    if (checkoutStep > 2) setCheckoutStep(2);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1.5 p-2 rounded-xl transition-all",
                    checkoutStep === 2
                      ? "bg-background text-foreground font-black shadow-sm"
                      : checkoutStep > 2
                        ? "text-muted-foreground hover:text-foreground cursor-pointer font-bold"
                        : "opacity-50 cursor-not-allowed text-muted-foreground font-medium"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                      checkoutStep === 2
                        ? "bg-amber-500 text-black shadow-sm"
                        : checkoutStep > 2
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {checkoutStep > 2 ? (
                      <Check size={12} />
                    ) : checkoutStep < 2 ? (
                      <Lock size={10} />
                    ) : (
                      "2"
                    )}
                  </div>
                  <span className="truncate">{isAr ? "بيانات التحويل" : "Transfer"}</span>
                </button>

                {/* Step 3 Tab (Locked if on Step 1 or 2) */}
                <button
                  type="button"
                  disabled={checkoutStep < 3}
                  className={cn(
                    "flex items-center justify-center gap-1.5 p-2 rounded-xl transition-all",
                    checkoutStep === 3
                      ? "bg-background text-foreground font-black shadow-sm"
                      : "opacity-50 cursor-not-allowed text-muted-foreground font-medium"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                      checkoutStep === 3 ? "bg-amber-500 text-black shadow-sm" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {checkoutStep < 3 ? <Lock size={10} /> : "3"}
                  </div>
                  <span className="truncate">{isAr ? "تأكيد الإرسال" : "Verify"}</span>
                </button>
              </div>

              {/* Step 1: Payment Method Selection & Order Review */}
              {checkoutStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-4"
                >
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-foreground">
                      {isAr ? "اختر طريقة الدفع المناسبة:" : "Select Payment Gateway:"}
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("instapay")}
                        className={cn(
                          "p-3.5 rounded-2xl border text-start space-y-1 transition-all",
                          paymentMethod === "instapay"
                            ? "border-amber-500 bg-amber-500/10 shadow-sm"
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-foreground">
                            {isAr ? "إنستا باي (InstaPay)" : "InstaPay (IPN)"}
                          </span>
                          <Smartphone size={16} className="text-amber-500" />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {isAr ? "تحويل لحظي من أي بنك" : "Instant bank transfer"}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("vodafone_cash")}
                        className={cn(
                          "p-3.5 rounded-2xl border text-start space-y-1 transition-all",
                          paymentMethod === "vodafone_cash"
                            ? "border-amber-500 bg-amber-500/10 shadow-sm"
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-foreground">
                            {isAr ? "فودافون كاش والمحافظ" : "Vodafone Cash & Wallets"}
                          </span>
                          <Smartphone size={16} className="text-red-500" />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {isAr ? "محافظ المحمول في مصر" : "All mobile wallets"}
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Plan Review Summary Card */}
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {isAr ? "الباقة المختارة:" : "Selected Plan:"}
                      </span>
                      <span className="font-black text-foreground">
                        {checkoutPlan === "monthly"
                          ? isAr
                            ? "الاشتراك الشهري"
                            : "Monthly"
                          : checkoutPlan === "semester"
                            ? isAr
                              ? "الفصل الدراسي (الأكثر طلباً)"
                              : "Semester (Popular)"
                            : isAr
                              ? "العام الأكاديمي الكامل"
                              : "Full Academic Year"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                      <span className="text-muted-foreground">
                        {isAr ? "المبلغ الإجمالي المستحق:" : "Total Due:"}
                      </span>
                      <span className="font-black text-amber-500 text-sm">
                        {checkoutPlan === "monthly" ? 49 : checkoutPlan === "semester" ? 199 : 349} EGP
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCheckoutStep(2)}
                    className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs hover:bg-primary/90 transition shadow-lg flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>{isAr ? "متابعة لبيانات التحويل" : "Proceed to Transfer Details"}</span>
                    {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </motion.div>
              )}

              {/* Step 2: Transfer Details Strip */}
              {checkoutStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">
                        {paymentMethod === "instapay"
                          ? isAr
                            ? "عنوان إنستا باي (IPA):"
                            : "InstaPay Address:"
                          : isAr
                            ? "رقم محفظة فودافون كاش:"
                            : "Vodafone Cash Number:"}
                      </span>
                      <span className="font-mono font-black text-amber-500 select-all text-sm">
                        {paymentMethod === "instapay" ? instapayAccount : vodafoneCashNumber}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                      <span className="text-muted-foreground">
                        {isAr ? "المبلغ المطلوب تحويله:" : "Amount to transfer:"}
                      </span>
                      <span className="font-black text-foreground">
                        {checkoutPlan === "monthly" ? 49 : checkoutPlan === "semester" ? 199 : 349} EGP
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          paymentMethod === "instapay" ? instapayAccount : vodafoneCashNumber,
                          "account"
                        )
                      }
                      className="w-full py-2.5 rounded-xl bg-background hover:bg-card border border-border text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <Copy size={13} />
                      <span>
                        {copiedKey === "account"
                          ? isAr
                            ? "تم نسخ الرقم!"
                            : "Copied!"
                          : isAr
                            ? "نسخ رقم الحساب / المحفظة"
                            : "Copy Transfer Account Number"}
                      </span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-muted-foreground space-y-1">
                    <p className="font-bold text-foreground">
                      {isAr ? "تعليمات هامة لإتمام التحويل:" : "Important Transfer Guidelines:"}
                    </p>
                    <p>
                      {isAr
                        ? "1. افتح تطبيق البنك أو المحفظة وقم بتحويل المبلغ بدقة."
                        : "1. Open your banking or mobile wallet app and transfer the exact amount."}
                    </p>
                    <p>
                      {isAr
                        ? "2. التقط لقطة شاشة لإشعار نجاح العملية لتسريع التفعيل."
                        : "2. Take a screenshot of the confirmation screen to expedite activation."}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep(1)}
                      className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted font-bold text-xs transition"
                    >
                      {isAr ? "رجوع" : "Back"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setCheckoutStep(3)}
                      className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground font-black text-xs hover:bg-primary/90 transition shadow-lg flex items-center justify-center gap-2 active:scale-98"
                    >
                      <span>
                        {isAr
                          ? "أتممت التحويل، المتابعة لتأكيد الاشتراك"
                          : "I Have Transferred, Proceed"}
                      </span>
                      {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Verification Submission Form */}
              {checkoutStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                >
                  <form onSubmit={handleSubmitSubscription} className="space-y-4">
                    {/* Sender Phone/Account */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground">
                        {isAr ? "رقم هاتفك أو حسابك المحول منه *" : "Sender Phone Number or Account *"}
                      </label>
                      <input
                        type="text"
                        required
                        value={senderPhoneOrAccount}
                        onChange={(e) => setSenderPhoneOrAccount(e.target.value)}
                        placeholder={
                          paymentMethod === "instapay"
                            ? isAr
                              ? "مثال: yourname@instapay أو 01xxxxxxxxx"
                              : "e.g. yourname@instapay or 01xxxxxxxxx"
                            : isAr
                              ? "مثال: 01012345678"
                              : "e.g. 01012345678"
                        }
                        className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>

                    {/* Transaction Reference (Optional) */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground">
                        {isAr
                          ? "رقم العملية / المرجع (اختياري، يسرع التفعيل)"
                          : "Transaction Reference (Optional, speeds up activation)"}
                      </label>
                      <input
                        type="text"
                        value={transactionReference}
                        onChange={(e) => setTransactionReference(e.target.value)}
                        placeholder={isAr ? "رقم المرجع من رسالة التحويل" : "Reference from SMS or App"}
                        className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>

                    {/* Receipt Upload */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-foreground">
                        {isAr
                          ? "صورة إيصال التحويل (اختياري ومستحسن)"
                          : "Receipt Screenshot (Recommended)"}
                      </label>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />

                      {receiptUrl ? (
                        <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-emerald-500/50 bg-black/20 flex items-center justify-center">
                          <Image
                            src={receiptUrl}
                            alt="Uploaded Receipt"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                          <button
                            type="button"
                            onClick={() => setReceiptUrl("")}
                            className="absolute top-2 end-2 p-1 rounded-lg bg-black/70 text-white hover:bg-black transition-all"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={receiptUploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-border hover:border-amber-500/50 bg-muted/20 hover:bg-muted/40 text-xs font-bold text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2"
                        >
                          {receiptUploading ? (
                            <>
                              <RefreshCw size={16} className="animate-spin text-amber-500" />
                              <span>{isAr ? "جارٍ رفع صورة الإيصال..." : "Uploading receipt..."}</span>
                            </>
                          ) : (
                            <>
                              <Upload size={16} className="text-amber-500" />
                              <span>
                                {isAr
                                  ? "انقر لرفع لقطة شاشة للإيصال"
                                  : "Click to upload receipt screenshot"}
                              </span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-foreground">
                        {isAr ? "ملاحظات إضافية للمشرف (اختياري)" : "Additional Notes (Optional)"}
                      </label>
                      <input
                        type="text"
                        value={studentNotes}
                        onChange={(e) => setStudentNotes(e.target.value)}
                        placeholder={
                          isAr ? "أي تفاصيل تود توضيحها..." : "Any details you want to add..."
                        }
                        className="w-full px-4 py-2.5 rounded-2xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>

                    {/* Submit Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep(2)}
                        className="px-4 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted font-bold text-xs transition"
                      >
                        {isAr ? "رجوع" : "Back"}
                      </button>

                      <button
                        type="submit"
                        disabled={submittingOrder || !senderPhoneOrAccount.trim()}
                        className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-black text-sm shadow-xl hover:shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {submittingOrder ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            <span>{isAr ? "جارٍ إرسال الطلب..." : "Submitting order..."}</span>
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            <span>
                              {isAr ? "تأكيد وإرسال طلب الاشتراك" : "Confirm & Submit Request"}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
