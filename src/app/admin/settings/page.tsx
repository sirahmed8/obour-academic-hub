"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useLanguage, useAuth } from "@/contexts";
import {
  Settings,
  Cpu,
  Loader2,
  Sparkles,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { FadeIn, ScaleIn } from "@/components/ui/Animations";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { LoadingCardGrid } from "@/components/ui/Loading";
import { SiteSettings } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingAI, setSavingAI] = useState(false);
  const [savingChatbot, setSavingChatbot] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { language, t } = useLanguage();
  const { isOwner, user } = useAuth();

  useEffect(() => {
    if (!db) return;

    const settingsRef = doc(db!, "settings", "global");

    const unsubscribe = onSnapshot(
      settingsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings(docSnap.data() as SiteSettings);
        } else {
          setSettings({ aiEnabled: true, chatbotEnabled: true });
        }
        setLoading(false);
      },
      (error) => {
        console.error("AdminSettingsPage: Settings listener error", error);
        setLoading(false);
        if (error.code === "permission-denied") {
          toast.error("You don't have permission to access these settings.");
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleToggleAI = async () => {
    if (!settings || !db || !user) return;
    setSavingAI(true);
    try {
      await setDoc(
        doc(db, "settings", "global"),
        {
          aiEnabled: !settings.aiEnabled,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        },
        { merge: true }
      );
      toast.success(t("settings.saveSuccess"));
    } catch (error) {
      console.error("Failed to update AI settings:", error);
      toast.error(t("settings.saveError"));
    } finally {
      setSavingAI(false);
    }
  };

  const handleToggleChatbot = async () => {
    if (!settings || !db || !user) return;
    setSavingChatbot(true);
    try {
      await setDoc(
        doc(db, "settings", "global"),
        {
          chatbotEnabled: settings.chatbotEnabled === undefined ? false : !settings.chatbotEnabled,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        },
        { merge: true }
      );
      toast.success(t("settings.saveSuccess"));
    } catch (error) {
      console.error("Failed to update Chatbot settings:", error);
      toast.error(t("settings.saveError"));
    } finally {
      setSavingChatbot(false);
    }
  };

  const handleSyncStats = async () => {
    setIsSyncing(true);
    try {
      await apiFetch("/api/admin/settings/sync-stats", {
        method: "POST",
      });

      toast.success(
        language === "ar" ? "تمت مزامنة الإحصائيات بنجاح" : "Statistics synced successfully"
      );
    } catch (error) {
      console.error("Failed to sync stats:", error);
      toast.error(language === "ar" ? "فشل مزامنة الإحصائيات" : "Failed to sync statistics");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetStats = async () => {
    setIsResetting(true);
    try {
      await apiFetch("/api/admin/settings/reset-stats", {
        method: "POST",
      });

      toast.success(
        language === "ar" ? "تم تصفير الإحصائيات بنجاح" : "Statistics reset successfully"
      );
    } catch (error) {
      console.error("Failed to reset stats:", error);
      toast.error(language === "ar" ? "فشل تصفير الإحصائيات" : "Failed to reset statistics");
    } finally {
      setIsResetting(false);
      setShowResetModal(false);
    }
  };

  return (
    <>
      <div className="p-6 lg:p-10 w-full page-transition">
        <FadeIn className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Settings className="text-primary" />
            {t("settings.title")}
          </h1>
        </FadeIn>

        {loading ? (
          <LoadingCardGrid count={4} />
        ) : (
          <div className="space-y-6">
            <ScaleIn>
              <div className="group bg-card p-6 rounded-3xl border border-border hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden relative">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition-all duration-500" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-500">
                      <Cpu size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        {t("settings.aiToggle")}
                        {settings?.aiEnabled && <Sparkles size={16} className="text-yellow-500" />}
                      </h3>
                      {t("settings.aiDescription") && (
                        <p className="text-sm text-muted-foreground mt-1 max-w-md">
                          {t("settings.aiDescription")}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleToggleAI}
                    disabled={savingAI}
                    className={`relative w-16 h-8 rounded-full transition-all duration-500 outline-none focus:ring-4 focus:ring-primary/20 ${
                      settings?.aiEnabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ${
                        settings?.aiEnabled
                          ? language === "ar"
                            ? "right-9"
                            : "left-9"
                          : language === "ar"
                            ? "right-1"
                            : "left-1"
                      } flex items-center justify-center`}
                    >
                      {savingAI ? (
                        <Loader2 size={12} className="animate-spin text-primary" />
                      ) : (
                        settings?.aiEnabled && <ShieldCheck size={12} className="text-primary" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Chatbot Toggle */}
              <div className="group bg-card p-6 rounded-3xl border border-border hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 overflow-hidden relative mt-6">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all duration-500" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform duration-500">
                      <Sparkles size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        {t("settings.chatbotToggle")}
                      </h3>
                      {t("settings.chatbotDesc") && (
                        <p className="text-sm text-muted-foreground mt-1 max-w-md">
                          {t("settings.chatbotDesc")}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleToggleChatbot}
                    disabled={savingChatbot}
                    className={`relative w-16 h-8 rounded-full transition-all duration-500 outline-none focus:ring-4 focus:ring-blue-500/20 ${
                      settings?.chatbotEnabled !== false ? "bg-blue-500" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 ${
                        settings?.chatbotEnabled !== false
                          ? language === "ar"
                            ? "right-9"
                            : "left-9"
                          : language === "ar"
                            ? "right-1"
                            : "left-1"
                      } flex items-center justify-center`}
                    >
                      {savingChatbot ? (
                        <Loader2 size={12} className="animate-spin text-blue-500" />
                      ) : (
                        settings?.chatbotEnabled !== false && (
                          <ShieldCheck size={12} className="text-blue-500" />
                        )
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </ScaleIn>

            {isOwner && (
              <ScaleIn>
                {/* Stats Sync Control */}
                <div className="group bg-primary/5 p-8 rounded-4xl border border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden relative mt-12 mb-6">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full group-hover:bg-primary/20 transition-all duration-500" />

                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="p-5 bg-primary/10 rounded-4xl text-primary shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                        <RefreshCw size={32} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-primary flex items-center gap-2">
                          {language === "ar" ? "مزامنة إحصائيات المنصة" : "Sync Platform Stats"}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium max-w-md">
                          {language === "ar"
                            ? "تحديث إحصائيات المنصة الحية (الطلاب، المواد، المصادر) بناءً على الأرقام الحقيقية في قاعدة البيانات."
                            : "Recalculate live platform statistics (students, subjects, resources) based on actual database counts."}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleSyncStats}
                      disabled={isSyncing}
                      className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSyncing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-5 h-5" />
                      )}
                      {language === "ar" ? "مزامنة الإحصائيات الآن" : "Sync Stats Now"}
                    </button>
                  </div>
                </div>

                {/* Reset Control */}
                <div className="group bg-destructive/5 p-8 rounded-4xl border border-destructive/20 hover:shadow-2xl hover:shadow-destructive/5 transition-all duration-500 overflow-hidden relative">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-destructive/10 blur-3xl rounded-full group-hover:bg-destructive/20 transition-all duration-500" />

                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="p-5 bg-destructive/10 rounded-4xl text-destructive shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                        <Trash2 size={32} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-black text-destructive flex items-center gap-2">
                          {language === "ar" ? "منطقة التحكم المتقدمة" : "Advanced Control Center"}
                          <AlertTriangle size={18} />
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium max-w-md">
                          {language === "ar"
                            ? "إعادة تعيين كافة إحصائيات المشاهدات والتحميلات وسجلات النشاط للمنصة."
                            : "Reset all platform views, downloads, and activity audit logs to zero."}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowResetModal(true)}
                      disabled={isResetting}
                      className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-destructive text-destructive-foreground font-bold shadow-xl shadow-destructive/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isResetting ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                      {language === "ar" ? "تصفير كافة الإحصائيات" : "Reset All Platform Stats"}
                    </button>
                  </div>
                </div>

                <ConfirmationModal
                  isOpen={showResetModal}
                  onClose={() => setShowResetModal(false)}
                  onConfirm={handleResetStats}
                  title={language === "ar" ? "تأكيد تصفير الإحصائيات" : "Confirm Stats Reset"}
                  message={
                    language === "ar"
                      ? "هذا الإجراء سيقوم بمسح كافة سجلات النشاط وتصفير عدادات المشاهدات للمواد والتحميلات للمصادر. هل أنت متأكد؟"
                      : "This will erase all activity logs and reset view/download counters across the entire platform. Are you sure?"
                  }
                  confirmText={language === "ar" ? "نعم، تصفير الآن" : "Yes, Reset Now"}
                  cancelText={language === "ar" ? "إلغاء" : "Cancel"}
                  type="danger"
                />
              </ScaleIn>
            )}
          </div>
        )}
      </div>
    </>
  );
}
