"use client";

import { useAuth, useLanguage } from "@/contexts";
import Image from "next/image";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { GpaCalculatorWidget } from "@/components/features/GpaCalculatorWidget";
import { GpaGoalPlannerWidget } from "@/components/features/GpaGoalPlannerWidget";
import { AchievementCards } from "@/components/features/AchievementCards";

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
  const { user, isAdmin, isOwner, logout } = useAuth();

  const { t, language } = useLanguage();
  const [isMounting, setIsMounting] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showResetStatsModal, setShowResetStatsModal] = useState(false);
  const [showResetAchievementsModal, setShowResetAchievementsModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setIsMounting(false);
  }, []);

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

  if (!user) return null;

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
      <div className="relative overflow-hidden flex flex-col md:flex-row items-center gap-6 bg-card/60 backdrop-blur-2xl p-8 rounded-3xl border border-primary/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-primary/30 shadow-2xl bg-muted transition-transform hover:scale-105">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || "User"}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : (
              <User className="w-16 h-16 text-muted-foreground m-8" />
            )}
          </div>
          {isAdmin && (
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground px-3.5 py-1 rounded-full text-xs font-black shadow-lg uppercase tracking-wider border border-white/20">
              {isOwner ? "Owner 👑" : "Admin 🛡️"}
            </div>
          )}
        </div>

        <div className="text-center md:text-left space-y-3 flex-1">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight flex items-center justify-center md:justify-start gap-2">
              <span>{user.displayName}</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                {language === "ar" ? "طالب مسجل 🟢" : "Active Student 🟢"}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
              {language === "ar"
                ? "أكاديمية العبور للهندسة والتكنولوجيا"
                : "Obour Institutes of Engineering & Technology"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs sm:text-sm font-semibold text-muted-foreground">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/50">
              <Mail className="w-4 h-4 text-primary" />
              {user.email}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border/50">
              <Shield className="w-4 h-4 text-primary" />
              <span>{user.studentCode || t("profile.codeLocked")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-4xl border-border/50 bg-card/40 backdrop-blur-md">
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
                <FormattedDate date={user.createdAt} />
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {language === "ar" ? "آخر ظهور" : "Last Activity"}
              </span>
              <span className="text-sm font-medium">
                <FormattedDate date={user.lastLogin} type="time" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="rounded-4xl border-border/50 bg-card/40 backdrop-blur-md">
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
              className="w-full flex items-center justify-center gap-2 py-3 bg-muted hover:bg-muted/80 rounded-xl transition-all text-sm font-bold"
            >
              <Edit2 className="w-4 h-4" />
              {t("profile.contactSupport")}
            </button>
          </CardContent>
        </Card>
      </div>

      {/* GPA Calculator & Goal Planner Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GpaCalculatorWidget />
        <GpaGoalPlannerWidget />
      </div>

      {/* Collectible Achievement Cards */}
      <AchievementCards />

      {/* My Data Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-4xl border-border/50 bg-card/40 backdrop-blur-md">
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
        Role: {user.role} | Claims: {isAdmin ? "Admin" : "Student"}
      </div>
    </div>
  );
}
