"use client";

import { useAuth, useLanguage } from "@/contexts";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  RotateCcw,
  Trophy,
  Crown,
  Sparkles,
  AtSign,
  Copy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { UsernameSetupModal } from "@/components/ui/UsernameSetupModal";
import { StudentProfileSetup } from "@/components/features/StudentProfileSetup";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { userService } from "@/services/user.service";
import { User as UserType } from "@/types";
import { GpaGoalPlannerWidget } from "@/components/features/GpaGoalPlannerWidget";

import { useState, useEffect } from "react";
import { cn, toDate } from "@/lib/utils";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// 🦴 Skeleton Component for cleaner loading
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-muted rounded-md", className)} />;
}

// 🛡️ SSR Safe Date Formatter: Prevents hydration mismatch
function FormattedDate({ date, type = "date" }: { date: unknown; type?: "date" | "time" }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !date) return <Skeleton className="h-4 w-20 inline-block" />;

  const dateObj = toDate(date as Parameters<typeof toDate>[0]);

  // Check for invalid date
  if (isNaN(dateObj.getTime())) return <span>-</span>;

  return <span>{type === "date" ? dateObj.toLocaleDateString() : dateObj.toLocaleString()}</span>;
}

export default function ProfilePage() {
  const { user, isAdmin, logout } = useAuth();
  const searchParams = useSearchParams();
  const targetUsername = searchParams.get("u") || searchParams.get("username");

  const { t, language } = useLanguage();
  const [isMounting, setIsMounting] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showResetStatsModal, setShowResetStatsModal] = useState(false);
  const [showResetAchievementsModal, setShowResetAchievementsModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showOnboardingSetup, setShowOnboardingSetup] = useState(false);

  const [searchedUser, setSearchedUser] = useState<UserType | null>(null);
  const [searchingUser, setSearchingUser] = useState(false);

  useEffect(() => {
    setIsMounting(false);
  }, []);

  useEffect(() => {
    if (targetUsername) {
      setSearchingUser(true);
      userService
        .getByUsername(targetUsername)
        .then((u) => {
          setSearchedUser(u);
          setSearchingUser(false);
        })
        .catch(() => setSearchingUser(false));
    } else {
      setSearchedUser(null);
    }
  }, [targetUsername]);

  const activeUser = searchedUser || user;
  const isSelf = !searchedUser || searchedUser.uid === user?.uid;

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await apiFetch("/api/user/delete", { method: "DELETE" });
      toast.success(language === "ar" ? "تم حذف الحساب بنجاح" : "Account deleted successfully");
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Deletion failed:", error);
      toast.error(language === "ar" ? "فشل حذف الحساب" : "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  if (searchingUser) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-48 w-full rounded-3xl" />
      </div>
    );
  }

  if (!activeUser) return null;

  if (isMounting) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex flex-col md:flex-row items-center gap-6 bg-card/50 backdrop-blur-xl p-8 rounded-4xl border border-border">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-4xl" />
          <Skeleton className="h-48 rounded-4xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header section */}
      <div className="relative overflow-hidden flex flex-col md:flex-row items-center gap-6 bg-card border border-border dark:bg-card backdrop-blur-xl p-8 rounded-3xl shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-primary/30 shadow-2xl bg-muted transition-transform hover:scale-105">
            {activeUser.photoURL ? (
              <Image
                src={activeUser.photoURL}
                alt={activeUser.displayName || "User"}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : (
              <User className="w-16 h-16 text-muted-foreground m-8" />
            )}
          </div>
          {(activeUser.role === "owner" || activeUser.role === "admin") && (
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground px-3.5 py-1 rounded-full text-xs font-black shadow-lg uppercase tracking-wider border border-white/20">
              {activeUser.role === "owner" ? "Owner 👑" : "Admin 🛡️"}
            </div>
          )}
        </div>

        <div className="text-center md:text-left space-y-3 flex-1">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span>{activeUser.displayName}</span>
              {activeUser.isVip || activeUser.role === "owner" ? (
                <Link
                  href="/plus"
                  className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold shadow-md hover:scale-105 transition-all"
                >
                  <Crown size={14} />
                  <span>{language === "ar" ? "العبور بلس 👑 VIP" : "Obour VIP Pass 👑"}</span>
                </Link>
              ) : (
                <Link
                  href="/plus"
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/30 font-extrabold transition-all"
                >
                  <Sparkles size={12} />
                  <span>{language === "ar" ? "ترقية إلى PRO ⚡" : "Upgrade to PRO ⚡"}</span>
                </Link>
              )}
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                {language === "ar" ? "طالب مسجل 🟢" : "Active Student 🟢"}
              </span>
            </h1>

            {/* Handle & Profile Link Section */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
              {activeUser.username ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-xs">
                  <AtSign size={13} />
                  <span>{activeUser.username}</span>
                </div>
              ) : isSelf ? (
                <button
                  type="button"
                  onClick={() => setShowUsernameModal(true)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-extrabold text-xs hover:scale-105 transition"
                >
                  <Sparkles size={12} />
                  <span>
                    {language === "ar"
                      ? "+ اختر اسم المستخدم (Handle)"
                      : "+ Choose Username Handle"}
                  </span>
                </button>
              ) : null}

              {activeUser.username && (
                <button
                  type="button"
                  onClick={() => {
                    const profileUrl = `${window.location.origin}/profile?u=${activeUser.username}`;
                    navigator.clipboard.writeText(profileUrl);
                    toast.success(
                      language === "ar"
                        ? `تم نسخ رابط البروفايل (@${activeUser.username}) 🔗`
                        : `Profile link copied (@${activeUser.username}) 🔗`
                    );
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground font-bold text-xs transition"
                >
                  <Copy size={12} />
                  <span>{language === "ar" ? "نسخ الرابط" : "Copy Link"}</span>
                </button>
              )}

              {isSelf && activeUser.username && (
                <button
                  type="button"
                  onClick={() => setShowUsernameModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground font-bold text-xs transition"
                >
                  <Edit2 size={12} />
                  <span>{language === "ar" ? "تعديل المعرف" : "Edit Handle"}</span>
                </button>
              )}

              {isSelf && (
                <button
                  type="button"
                  onClick={() => setShowOnboardingSetup(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition"
                >
                  <Sparkles size={12} />
                  <span>
                    {language === "ar"
                      ? "تعديل البيانات الأكاديمية 📝"
                      : "Update Academic Profile 📝"}
                  </span>
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
              {language === "ar"
                ? "أكاديمية العبور للهندسة والتكنولوجيا"
                : "Obour Institutes of Engineering & Technology"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs sm:text-sm font-semibold text-muted-foreground max-w-full">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/50 max-w-full overflow-hidden">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{activeUser.email}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/50 shrink-0">
              <Shield className="w-4 h-4 text-primary shrink-0" />
              <span>{activeUser.studentCode || t("profile.codeLocked")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-4xl border-border bg-card shadow-md dark:bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {language === "ar" ? "تفاصيل الحساب" : "Account Details"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {language === "ar" ? "تاريخ الانضمام" : "Joined"}
              </span>
              <span className="text-sm font-medium">
                <FormattedDate date={activeUser.createdAt} />
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {language === "ar" ? "آخر ظهور" : "Last Activity"}
              </span>
              <span className="text-sm font-medium">
                <FormattedDate date={activeUser.lastLogin} type="time" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="rounded-4xl border-border bg-card shadow-md dark:bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {language === "ar" ? "الدعم والأمان" : "Support & Security"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {language === "ar"
                ? "إذا كنت بحاجة إلى تغيير اسمك أو كود الطالب الخاص بك، يرجى التواصل مع فريق الدعم."
                : "If you need to change your name or student code, please contact the support team."}
            </p>
            <button
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("openChatbot", {
                    detail: { mode: "fill", message: "I want to change my info" },
                  })
                );
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-muted hover:bg-muted/80 rounded-xl transition-all text-sm font-bold active:scale-97"
            >
              <Edit2 className="w-4 h-4" />
              {t("profile.contactSupport")}
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Goal Planner Widget */}
      <div className="grid grid-cols-1 gap-6">
        <GpaGoalPlannerWidget />
      </div>

      {/* Points & XP Section */}
      {(() => {
        const points = activeUser.points ?? 0;

        // League thresholds matching community/page.tsx
        const LEAGUES = [
          {
            name: "Diamond",
            nameAr: "\u0627\u0644\u0645\u0627\u0633",
            emoji: "💎",
            min: 5000,
            next: Infinity,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/30",
            bar: "bg-cyan-400",
          },
          {
            name: "Gold",
            nameAr: "\u0630\u0647\u0628",
            emoji: "🥇",
            min: 2000,
            next: 5000,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/30",
            bar: "bg-amber-400",
          },
          {
            name: "Silver",
            nameAr: "\u0641\u0636\u0629",
            emoji: "🥈",
            min: 1000,
            next: 2000,
            color: "text-slate-300",
            bg: "bg-slate-500/10",
            border: "border-slate-400/30",
            bar: "bg-slate-300",
          },
          {
            name: "Bronze",
            nameAr: "\u0628\u0631\u0648\u0646\u0632",
            emoji: "🥉",
            min: 0,
            next: 1000,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/30",
            bar: "bg-orange-400",
          },
        ];

        const league = LEAGUES.find((l) => points >= l.min) ?? LEAGUES[LEAGUES.length - 1];
        const isTopLeague = league.next === Infinity;
        const progressPct = isTopLeague
          ? 100
          : Math.min(100, Math.round(((points - league.min) / (league.next - league.min)) * 100));
        const leagueName = language === "ar" ? league.nameAr : league.name;

        return (
          <div className="bg-card border border-border rounded-4xl p-6 shadow-md dark:bg-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${league.bg} ${league.border} border`}>
                  <Trophy className={`w-5 h-5 ${league.color}`} />
                </div>
                <div>
                  <h2 className="text-base font-black text-foreground">
                    {language === "ar"
                      ? "\u0646\u0642\u0627\u0637 XP \u0648\u0627\u0644\u062f\u0648\u0631\u064a"
                      : "Points & XP League"}
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    {language === "ar"
                      ? "\u062a\u0642\u062f\u0645\u0643 \u0641\u064a \u062f\u0648\u0631\u064a \u0627\u0644\u0645\u062a\u0635\u062f\u0631\u064a\u0646"
                      : "Your progress in the leaderboard"}
                  </p>
                </div>
              </div>

              {/* League badge */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black ${league.bg} ${league.color} border ${league.border}`}
              >
                <span>{league.emoji}</span>
                <span>{leagueName}</span>
              </div>
            </div>

            {/* Points display */}
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-foreground tabular-nums">
                {points.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground font-semibold mb-1">
                {language === "ar" ? "نقطة XP" : "XP Points"}
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                <span>{league.min.toLocaleString()} pts</span>
                {isTopLeague ? (
                  <span className={`${league.color} font-black`}>
                    {language === "ar" ? "أعلى مستوى! 🏆" : "Max League! 🏆"}
                  </span>
                ) : (
                  <span>{league.next.toLocaleString()} pts</span>
                )}
              </div>
              <div className="w-full bg-muted h-3 rounded-full overflow-hidden border border-border">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${league.bar}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {!isTopLeague && (
                <p className="text-[11px] text-muted-foreground font-medium text-right">
                  {language === "ar"
                    ? `${(league.next - points).toLocaleString()} نقطة للوصول لـ ${LEAGUES.find((l) => l.min === league.next)?.nameAr ?? ""}`
                    : `${(league.next - points).toLocaleString()} pts to ${LEAGUES.find((l) => l.min === league.next)?.name ?? "next"} league`}
                </p>
              )}
            </div>
          </div>
        );
      })()}

      {/* My Data Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-4xl border-border bg-card shadow-md dark:bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />
              {language === "ar" ? "إدارة البيانات" : "My Data"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {language === "ar"
                ? "يمكنك إعادة تعيين إحصائيات التعلم أو الإنجازات الخاصة بك. هذا الإجراء لا يمكن التراجع عنه."
                : "You can reset your learning stats or achievements. This action cannot be undone."}
            </p>
            <button
              onClick={() => setShowResetStatsModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-muted hover:bg-muted/80 rounded-xl transition-all text-sm font-bold"
            >
              <RotateCcw className="w-4 h-4" />
              {language === "ar" ? "إعادة تعيين الإحصائيات" : "Reset Learning Stats"}
            </button>
            <button
              onClick={() => setShowResetAchievementsModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-muted hover:bg-muted/80 rounded-xl transition-all text-sm font-bold"
            >
              <Trophy className="w-4 h-4" />
              {language === "ar" ? "إعادة تعيين الإنجازات" : "Reset Achievements"}
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <div className="pt-8 border-t border-destructive/20">
        <div className="bg-destructive/5 border border-destructive/20 rounded-4xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-destructive flex items-center gap-2 justify-center md:justify-start">
              <Trash2 className="w-5 h-5" />
              {language === "ar" ? "منطقة الخطر" : "Danger Zone"}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              {language === "ar"
                ? "حذف حسابك سيؤدي إلى مسح كافة بياناتك بشكل نهائي من المنصة."
                : "Deleting your account will permanently remove all your data from the platform."}
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-8 py-3.5 bg-destructive text-destructive-foreground rounded-2xl font-bold text-sm shadow-xl shadow-destructive/20 hover:scale-105 active:scale-95 transition-all"
          >
            {language === "ar" ? "حذف الحساب نهائياً" : "Permanently Delete Account"}
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title={language === "ar" ? "هل أنت متأكد من حذف الحساب؟" : "Delete Account?"}
        message={
          language === "ar"
            ? "هذا الإجراء نهائي ولا يمكن التراجع عنه. سيتم حذف كافة بياناتك ومشاركاتك."
            : "This action is permanent and cannot be undone. All your data and contributions will be erased."
        }
        confirmText={
          isDeleting
            ? language === "ar"
              ? "جاري الحذف..."
              : "Deleting..."
            : language === "ar"
              ? "نعم، احذف الحساب"
              : "Yes, Delete Account"
        }
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        type="danger"
      />

      <ConfirmationModal
        isOpen={showResetStatsModal}
        onClose={() => setShowResetStatsModal(false)}
        onConfirm={async () => {
          if (!user || !db) return;
          setIsResetting(true);
          try {
            await setDoc(doc(db, `users/${user.uid}/stats`, "learning"), {
              pageViews: 0,
              fileOpens: 0,
              subjectOpens: 0,
              totalActions: 0,
              dailyActivity: {},
              topSubjects: {},
            });
            toast.success(
              language === "ar" ? "تم إعادة تعيين الإحصائيات" : "Stats reset successfully"
            );
          } catch {
            toast.error(language === "ar" ? "فشل في إعادة التعيين" : "Failed to reset stats");
          } finally {
            setIsResetting(false);
            setShowResetStatsModal(false);
          }
        }}
        title={language === "ar" ? "إعادة تعيين الإحصائيات؟" : "Reset Learning Stats?"}
        message={
          language === "ar"
            ? "سيتم مسح جميع إحصائيات التعلم الخاصة بك (المشاهدات، التحميلات، النشاط). لا يمكن التراجع عن هذا الإجراء."
            : "All your learning stats (views, downloads, activity) will be erased. This action cannot be undone."
        }
        confirmText={
          isResetting
            ? language === "ar"
              ? "جاري الإعادة..."
              : "Resetting..."
            : language === "ar"
              ? "إعادة تعيين"
              : "Reset"
        }
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        type="danger"
      />

      <ConfirmationModal
        isOpen={showResetAchievementsModal}
        onClose={() => setShowResetAchievementsModal(false)}
        onConfirm={async () => {
          if (!user || !db) return;
          setIsResetting(true);
          try {
            await setDoc(doc(db, `users/${user.uid}/stats`, "learning"), {
              pageViews: 0,
              fileOpens: 0,
              subjectOpens: 0,
              totalActions: 0,
              dailyActivity: {},
              topSubjects: {},
            });
            toast.success(
              language === "ar" ? "تم إعادة تعيين الإنجازات" : "Achievements reset successfully"
            );
          } catch {
            toast.error(
              language === "ar" ? "فشل في إعادة التعيين" : "Failed to reset achievements"
            );
          } finally {
            setIsResetting(false);
            setShowResetAchievementsModal(false);
          }
        }}
        title={language === "ar" ? "إعادة تعيين الإنجازات؟" : "Reset Achievements?"}
        message={
          language === "ar"
            ? "سيتم مسح تقدم الإنجازات الخاصة بك. لا يمكن التراجع عن هذا الإجراء."
            : "All your achievement progress will be erased. This action cannot be undone."
        }
        confirmText={
          isResetting
            ? language === "ar"
              ? "جاري الإعادة..."
              : "Resetting..."
            : language === "ar"
              ? "إعادة تعيين"
              : "Reset"
        }
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        type="danger"
      />

      {/* Hidden check for role persistence */}
      <div className="opacity-0 pointer-events-none select-none h-0 w-0">
        Role: {user?.role} | Claims: {isAdmin ? "Admin" : "Student"}
      </div>

      <UsernameSetupModal
        forceShow={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
      />

      {showOnboardingSetup && (
        <StudentProfileSetup onComplete={() => setShowOnboardingSetup(false)} />
      )}
    </div>
  );
}
