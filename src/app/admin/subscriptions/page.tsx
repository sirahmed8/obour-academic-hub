"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts";
import { apiFetch } from "@/lib/api-client";
import { SubscriptionRequest } from "@/types";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Smartphone,
  UserCheck,
  Eye,
  X,
  AlertTriangle,
} from "lucide-react";
import { FadeIn, ScaleIn } from "@/components/ui/Animations";
import { cn } from "@/lib/utils";

interface SubscriptionStats {
  totalRequests: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalRevenueEGP: number;
  monthlyRevenueEGP: number;
}

export default function AdminSubscriptionsPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    totalRequests: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalRevenueEGP: 0,
    monthlyRevenueEGP: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">(
    "pending"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Action Modals State
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [receiptModalUrl, setReceiptModalUrl] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customDays, setCustomDays] = useState<number>(30);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    try {
      const data = await apiFetch<{
        requests: SubscriptionRequest[];
        stats: SubscriptionStats;
      }>("/api/admin/subscriptions");

      if (data) {
        setRequests(data.requests || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch {
      toast.error(isAr ? "تعذر تحميل طلبات الاشتراك" : "Failed to load subscription requests");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAr]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSubscriptions();
  };

  const handleOpenApprove = (req: SubscriptionRequest) => {
    setSelectedRequest(req);
    setCustomDays(
      req.durationDays || (req.plan === "annual" ? 365 : req.plan === "semester" ? 120 : 30)
    );
    setShowApproveModal(true);
  };

  const handleOpenReject = (req: SubscriptionRequest) => {
    setSelectedRequest(req);
    setRejectionReason(
      isAr
        ? "تعذر التحقق من بيانات التحويل أو رقم العملية. يرجى مراجعة إيصال الدفع وإعادة المحاولة."
        : "Transfer details could not be verified. Please check your payment receipt."
    );
    setShowRejectModal(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await apiFetch(`/api/admin/subscriptions/${selectedRequest.id}`, {
        method: "PATCH",
        body: {
          action: "approve",
          customDurationDays: Number(customDays),
        },
      });

      toast.success(
        isAr ? "تم تفعيل اشتراك الطالب بنجاح!" : "VIP Pass activated successfully for student!"
      );
      setShowApproveModal(false);
      setSelectedRequest(null);
      fetchSubscriptions();
    } catch {
      toast.error(isAr ? "حدث خطأ أثناء تفعيل الاشتراك" : "Failed to activate subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await apiFetch(`/api/admin/subscriptions/${selectedRequest.id}`, {
        method: "PATCH",
        body: {
          action: "reject",
          rejectionReason,
        },
      });

      toast.success(isAr ? "تم رفض الطلب وإشعار الطالب" : "Request rejected and student notified");
      setShowRejectModal(false);
      setSelectedRequest(null);
      fetchSubscriptions();
    } catch {
      toast.error(isAr ? "حدث خطأ أثناء معالجة الرفض" : "Failed to reject subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Tab filter
      if (activeTab !== "all" && req.status !== activeTab) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = req.userName?.toLowerCase().includes(query);
        const matchesEmail = req.userEmail?.toLowerCase().includes(query);
        const matchesCode = req.studentCode?.toLowerCase().includes(query);
        const matchesSender = req.senderPhoneOrAccount?.toLowerCase().includes(query);
        const matchesRef = req.transactionReference?.toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesCode || matchesSender || matchesRef;
      }
      return true;
    });
  }, [requests, activeTab, searchQuery]);

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-7xl mx-auto"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border/80 p-6 sm:p-8 rounded-3xl shadow-sm">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-500 font-extrabold text-xs">
              <Crown size={14} className="text-amber-500" />
              <span>{isAr ? "لوحة الإدارة المالية" : "Monetization & VIP Operations"}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-foreground font-harman">
              {isAr ? "طلبات اشتراك العبور بلس" : "VIP Subscription Requests"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {isAr
                ? "مراجعة تحويلات إنستا باي وفودافون كاش، وتفعيل باقات الطلاب بضغطة زر واحدة."
                : "Review InstaPay & Vodafone Cash transfers and activate VIP passes with 1-click."}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-muted/60 hover:bg-muted border border-border text-xs font-bold text-foreground transition-all duration-200"
            >
              <RefreshCw size={14} className={cn(refreshing && "animate-spin text-primary")} />
              <span>{isAr ? "تحديث البيانات" : "Refresh"}</span>
            </button>
          </div>
        </div>
      </FadeIn>

      {/* ── Statistics Summary Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <ScaleIn delay={0.05}>
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-amber-500">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isAr ? "إجمالي الإيرادات" : "Total Revenue"}
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-harman">
              {stats.totalRevenueEGP.toLocaleString()}{" "}
              <span className="text-xs font-bold text-amber-500">EGP</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              {isAr
                ? `منها ${stats.monthlyRevenueEGP.toLocaleString()} ج.م آخر 30 يوماً`
                : `${stats.monthlyRevenueEGP.toLocaleString()} EGP in last 30d`}
            </p>
          </div>
        </ScaleIn>

        {/* Pending Requests */}
        <ScaleIn delay={0.1}>
          <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-yellow-500">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isAr ? "قيد المراجعة" : "Pending Review"}
              </span>
              <div className="w-8 h-8 rounded-xl bg-yellow-500/15 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-harman flex items-center gap-2">
              <span>{stats.pendingCount}</span>
              {stats.pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-[10px] font-black animate-pulse">
                  {isAr ? "يتطلب إجراء" : "Action Required"}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              {isAr ? "تحويلات بانتظار التحقق والموافقة" : "Transfers awaiting verification"}
            </p>
          </div>
        </ScaleIn>

        {/* Approved Subscribers */}
        <ScaleIn delay={0.15}>
          <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-emerald-500">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isAr ? "الاشتراكات المفعلة" : "Approved VIPs"}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <UserCheck size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-harman">
              {stats.approvedCount}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              {isAr ? "طلاب نشطين على العبور بلس" : "Active paid VIP scholars"}
            </p>
          </div>
        </ScaleIn>

        {/* Total Requests */}
        <ScaleIn delay={0.2}>
          <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-primary">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isAr ? "إجمالي الطلبات" : "Total Orders"}
              </span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-foreground font-harman">
              {stats.totalRequests}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              {isAr
                ? `${stats.rejectedCount} طلبات مرفوضة أو غير مكتملة`
                : `${stats.rejectedCount} rejected / unverified`}
            </p>
          </div>
        </ScaleIn>
      </div>

      {/* ── Controls: Search & Tabs ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Tabs */}
        <div className="p-1 bg-card border border-border rounded-2xl inline-flex items-center gap-1 shadow-sm overflow-x-auto">
          {[
            {
              id: "pending",
              labelAr: `قيد المراجعة (${stats.pendingCount})`,
              labelEn: `Pending (${stats.pendingCount})`,
            },
            {
              id: "approved",
              labelAr: `مقبولة (${stats.approvedCount})`,
              labelEn: `Approved (${stats.approvedCount})`,
            },
            {
              id: "rejected",
              labelAr: `مرفوضة (${stats.rejectedCount})`,
              labelEn: `Rejected (${stats.rejectedCount})`,
            },
            {
              id: "all",
              labelAr: `الكل (${stats.totalRequests})`,
              labelEn: `All (${stats.totalRequests})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "all" | "pending" | "approved" | "rejected")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search
            size={16}
            className="absolute top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none start-3"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isAr
                ? "بحث بالاسم، الكود، الهاتف، رقم العملية..."
                : "Search by student, code, phone, ref..."
            }
            className="w-full ps-9 pe-4 py-2.5 rounded-2xl bg-card border border-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* ── Requests List / Table ─────────────────────────────────────── */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center rounded-3xl bg-card border border-border/80 space-y-3">
            <RefreshCw size={28} className="animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground font-semibold">
              {isAr ? "جارٍ تحميل طلبات الاشتراك..." : "Loading subscription requests..."}
            </p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border/80 space-y-3">
            <Crown size={32} className="text-muted-foreground/40 mx-auto" />
            <h3 className="text-base font-extrabold text-foreground">
              {isAr ? "لا توجد طلبات اشتراك مطابقة" : "No matching subscription requests"}
            </h3>
            <p className="text-xs text-muted-foreground font-medium max-w-sm mx-auto">
              {activeTab === "pending"
                ? isAr
                  ? "رائع! لا توجد طلبات تحويل معلقة بانتظار المراجعة حالياً."
                  : "All caught up! No pending requests awaiting review."
                : isAr
                  ? "جرّب تغيير فلاتر البحث أو التبويب لعرض الطلبات الأخرى."
                  : "Try adjusting your search query or switching tabs."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRequests.map((req) => {
              const isPending = req.status === "pending";
              const isApproved = req.status === "approved";
              const isRejected = req.status === "rejected";

              const createdDate = req.createdAt
                ? new Date(
                    typeof req.createdAt === "string"
                      ? req.createdAt
                      : typeof req.createdAt === "object" && "seconds" in req.createdAt
                        ? req.createdAt.seconds * 1000
                        : Date.now()
                  ).toLocaleString(isAr ? "ar-EG" : "en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "—";

              return (
                <div
                  key={req.id}
                  className={cn(
                    "p-5 sm:p-6 rounded-3xl bg-card border transition-all duration-200 flex flex-col md:flex-row justify-between gap-5 shadow-sm",
                    isPending
                      ? "border-amber-500/50 bg-amber-500/[0.02]"
                      : isApproved
                        ? "border-emerald-500/30"
                        : "border-border/60 opacity-80"
                  )}
                >
                  {/* Left: Student & Plan Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-lg bg-muted text-muted-foreground font-bold">
                        #{req.id.slice(-6)}
                      </span>

                      {/* Status Badge */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 text-xs font-black">
                          <Clock size={12} />
                          <span>{isAr ? "قيد المراجعة" : "Pending Review"}</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                          <CheckCircle2 size={12} />
                          <span>{isAr ? "تم التفعيل" : "Approved & Active"}</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 text-xs font-black">
                          <XCircle size={12} />
                          <span>{isAr ? "مرفوض" : "Rejected"}</span>
                        </span>
                      )}

                      <span className="text-[11px] text-muted-foreground font-medium">
                        {createdDate}
                      </span>
                    </div>

                    {/* Student Name & Code */}
                    <div className="space-y-0.5">
                      <h3 className="text-base sm:text-lg font-black text-foreground">
                        {req.userName || "طالب بدون اسم"}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium flex flex-wrap gap-2 items-center">
                        <span>{req.userEmail}</span>
                        {req.studentCode && (
                          <>
                            <span>•</span>
                            <span className="font-mono font-bold text-foreground">
                              {req.studentCode}
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Plan & Payment Details Strip */}
                    <div className="flex flex-wrap gap-3 pt-1 text-xs">
                      <div className="px-3 py-1.5 rounded-xl bg-muted/60 border border-border/80 flex items-center gap-1.5 font-bold">
                        <Crown size={14} className="text-amber-500" />
                        <span>{isAr ? req.planNameAr : req.planNameEn || req.plan}</span>
                        <span className="text-amber-500 font-black">({req.amount} EGP)</span>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-muted/60 border border-border/80 flex items-center gap-1.5 font-semibold">
                        <Smartphone size={14} className="text-primary" />
                        <span className="text-muted-foreground">
                          {isAr ? "طريقة الدفع:" : "Method:"}
                        </span>
                        <span className="font-bold text-foreground capitalize">
                          {req.paymentMethod === "instapay"
                            ? "InstaPay"
                            : req.paymentMethod === "vodafone_cash"
                              ? "Vodafone Cash"
                              : req.paymentMethod}
                        </span>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-muted/60 border border-border/80 flex items-center gap-1.5 font-semibold">
                        <span className="text-muted-foreground">
                          {isAr ? "المحول منه:" : "Sender:"}
                        </span>
                        <span className="font-mono font-bold text-foreground select-all">
                          {req.senderPhoneOrAccount}
                        </span>
                      </div>

                      {req.transactionReference && (
                        <div className="px-3 py-1.5 rounded-xl bg-muted/60 border border-border/80 flex items-center gap-1.5 font-semibold">
                          <span className="text-muted-foreground">
                            {isAr ? "رقم المرجع:" : "Ref:"}
                          </span>
                          <span className="font-mono font-bold text-foreground select-all">
                            {req.transactionReference}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Student Notes or Rejection Reason */}
                    {req.notes && (
                      <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl border border-border/50">
                        <span className="font-bold text-foreground">
                          {isAr ? "ملاحظة الطالب: " : "Student Note: "}
                        </span>
                        {req.notes}
                      </p>
                    )}

                    {isRejected && req.rejectionReason && (
                      <p className="text-xs text-red-500 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                        <span className="font-bold">{isAr ? "سبب الرفض: " : "Reason: "}</span>
                        {req.rejectionReason}
                      </p>
                    )}
                  </div>

                  {/* Right: Receipt Preview & Action Buttons */}
                  <div className="flex md:flex-col justify-between md:justify-center items-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 md:border-s md:ps-6 border-border/60">
                    {/* Receipt Screenshot Button */}
                    {req.receiptUrl ? (
                      <button
                        onClick={() => setReceiptModalUrl(req.receiptUrl || null)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all border border-primary/20"
                      >
                        <Eye size={14} />
                        <span>{isAr ? "معاينة الإيصال" : "View Receipt"}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/60 italic">
                        {isAr ? "بدون صورة إيصال" : "No receipt attached"}
                      </span>
                    )}

                    {/* Action Buttons for Pending */}
                    {isPending && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenApprove(req)}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black text-xs font-black shadow-md transition-all active:scale-95"
                        >
                          <CheckCircle2 size={14} />
                          <span>{isAr ? "قبول وتفعيل VIP" : "Approve VIP"}</span>
                        </button>

                        <button
                          onClick={() => handleOpenReject(req)}
                          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-bold transition-all active:scale-95"
                        >
                          <XCircle size={14} />
                          <span>{isAr ? "رفض" : "Reject"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Receipt Lightbox Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {receiptModalUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200">
            <div className="relative max-w-2xl w-full bg-card rounded-3xl overflow-hidden border border-border shadow-2xl p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="font-extrabold text-sm text-foreground">
                  {isAr ? "إيصال التحويل البنكي / المحفظة" : "Payment Transfer Receipt"}
                </h3>
                <button
                  onClick={() => setReceiptModalUrl(null)}
                  className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative w-full h-[60vh] max-h-[500px] rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center">
                <Image
                  src={receiptModalUrl}
                  alt="Transfer Receipt"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <a
                  href={receiptModalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <span>{isAr ? "فتح الصورة بحجم كامل" : "Open full size"}</span>
                  <ExternalLink size={12} />
                </a>
                <button
                  onClick={() => setReceiptModalUrl(null)}
                  className="px-4 py-2 rounded-xl bg-muted text-xs font-bold hover:bg-muted/80"
                >
                  {isAr ? "إغلاق" : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Approve Confirmation Modal ────────────────────────────────── */}
      <AnimatePresence>
        {showApproveModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-0 duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl text-foreground"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Crown size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black font-harman">
                    {isAr ? "تأكيد تفعيل باقة العبور بلس" : "Confirm VIP Activation"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {isAr
                      ? `للطالب: ${selectedRequest.userName} (${selectedRequest.userEmail})`
                      : `For student: ${selectedRequest.userName}`}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isAr ? "الباقة المطلوبة:" : "Plan:"}
                  </span>
                  <span className="font-extrabold text-foreground">
                    {isAr ? selectedRequest.planNameAr : selectedRequest.planNameEn}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isAr ? "المبلغ المدفوع:" : "Amount:"}
                  </span>
                  <span className="font-extrabold text-amber-500">
                    {selectedRequest.amount} EGP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isAr ? "طريقة التحويل:" : "Method:"}
                  </span>
                  <span className="font-bold text-foreground uppercase">
                    {selectedRequest.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isAr ? "رقم الهاتف / الحساب:" : "Sender:"}
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedRequest.senderPhoneOrAccount}
                  </span>
                </div>
              </div>

              {/* Duration Days Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">
                  {isAr ? "مدة صلاحية الاشتراك (بالأيام)" : "Subscription Validity (Days)"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={customDays}
                    onChange={(e) => setCustomDays(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <span className="text-xs text-muted-foreground font-bold shrink-0">
                    {isAr ? "يوماً" : "days"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isAr
                    ? "إذا كان لدى الطالب اشتراك نشط بالفعل، سيتم تمديد الصلاحية بشكل تراكمي."
                    : "If the student already has active VIP, the validity will extend cumulatively."}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setShowApproveModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-muted text-xs font-bold hover:bg-muted/80"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleApprove}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs font-black shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  <span>
                    {actionLoading
                      ? isAr
                        ? "جارٍ التفعيل..."
                        : "Activating..."
                      : isAr
                        ? "تأكيد وتفعيل VIP"
                        : "Confirm & Activate VIP"}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Reject Modal ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showRejectModal && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-0 duration-200">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl text-foreground"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black font-harman text-foreground">
                    {isAr ? "رفض طلب الاشتراك" : "Reject Subscription Request"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {isAr
                      ? `للطالب: ${selectedRequest.userName} (${selectedRequest.userEmail})`
                      : `For student: ${selectedRequest.userName}`}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">
                  {isAr ? "سبب الرفض (سيتم إرساله للطالب في الإشعارات)" : "Reason for rejection"}
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={
                    isAr
                      ? "مثال: لم نتمكن من العثور على العملية في الحساب، أو المبلغ المحول غير مطابق للباقة."
                      : "Reason for rejection..."
                  }
                  className="w-full p-3.5 rounded-xl bg-background border border-border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-muted text-xs font-bold hover:bg-muted/80"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  disabled={actionLoading || !rejectionReason.trim()}
                  onClick={handleReject}
                  className="px-6 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-lg hover:shadow-red-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <XCircle size={16} />
                  <span>
                    {actionLoading
                      ? isAr
                        ? "جارٍ الرفض..."
                        : "Rejecting..."
                      : isAr
                        ? "تأكيد الرفض وإشعار الطالب"
                        : "Confirm Rejection"}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
