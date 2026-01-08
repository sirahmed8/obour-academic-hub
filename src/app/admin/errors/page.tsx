"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  limit,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { useLanguage } from "@/contexts";
import { AppShell } from "@/components/layout/AppShell";
import { AlertTriangle, CheckCircle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate, formatDateArabic } from "@/lib/utils";
import { SystemError } from "@/types";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";

export default function AdminErrorsPage() {
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const { language, t } = useLanguage();

  useEffect(() => {
    const q = query(collection(db, "system_errors"), orderBy("timestamp", "desc"), limit(100));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setErrors(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as SystemError));
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    // CRITICAL: Return the unsubscribe function to prevents memory leaks
    return () => unsubscribe();
  }, []);

  const markResolved = async (id: string) => {
    try {
      await updateDoc(doc(db, "system_errors", id), { resolved: true });
      toast.success(language === "ar" ? "تم التحديد كمحلول" : "Marked as resolved");
    } catch {
      toast.error(language === "ar" ? "فشل التحديث" : "Update failed");
    }
  };

  const clearAllErrors = async () => {
    setClearing(true);
    try {
      const snapshot = await getDocs(collection(db, "system_errors"));
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      toast.success(language === "ar" ? "تم مسح جميع الأخطاء" : "All errors cleared");
      setShowClearModal(false);
    } catch {
      toast.error(language === "ar" ? "فشل مسح الأخطاء" : "Failed to clear errors");
    } finally {
      setClearing(false);
    }
  };

  const unresolvedCount = errors.filter((e) => !e.resolved).length;

  return (
    <AppShell>
      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={clearAllErrors}
        title={language === "ar" ? "مسح جميع الأخطاء" : "Clear All Errors"}
        message={
          language === "ar"
            ? `هل أنت متأكد من مسح جميع الأخطاء (${errors.length})؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to clear all ${errors.length} errors? This action cannot be undone.`
        }
        confirmText={
          clearing
            ? language === "ar"
              ? "جاري المسح..."
              : "Clearing..."
            : language === "ar"
              ? "مسح الكل"
              : "Clear All"
        }
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        type="danger"
      />
      <div className="p-6 lg:p-10 w-full page-transition">
        <FadeIn className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <AlertTriangle className="text-destructive" />
            {t("admin.errors")}
            {unresolvedCount > 0 && (
              <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-sm rounded-full animate-pulse">
                {unresolvedCount}
              </span>
            )}
          </h1>
          {errors.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Trash2 size={16} />
              {language === "ar" ? "مسح الكل" : "Clear All"}
            </button>
          )}
        </FadeIn>

        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-10 text-center">
              <Loader2 className="animate-spin mx-auto text-primary" size={40} />
            </div>
          ) : errors.length === 0 ? (
            <FadeIn>
              <div className="p-10 text-center text-muted-foreground">
                <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                {language === "ar" ? "لا توجد أخطاء 🎉" : "No errors found 🎉"}
              </div>
            </FadeIn>
          ) : (
            <StaggerChildren className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {errors.map((error) => (
                <ScaleIn key={error.id}>
                  <div
                    className={cn(
                      "p-4 transition-colors",
                      error.resolved ? "opacity-50" : "hover:bg-destructive/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            size={16}
                            className={
                              error.resolved ? "text-muted-foreground" : "text-destructive"
                            }
                          />
                          <p className="font-medium text-foreground truncate">{error.error}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{error.context}</p>
                        {error.stack && (
                          <pre className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded overflow-x-auto max-h-20">
                            {error.stack}
                          </pre>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {language === "ar"
                            ? formatDateArabic(error.timestamp)
                            : formatDate(error.timestamp)}
                        </p>
                      </div>
                      {!error.resolved && (
                        <button
                          onClick={() => markResolved(error.id)}
                          className="px-3 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-600 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                        >
                          <CheckCircle size={14} />
                          {language === "ar" ? "حل" : "Resolve"}
                        </button>
                      )}
                    </div>
                  </div>
                </ScaleIn>
              ))}
            </StaggerChildren>
          )}
        </div>
      </div>
    </AppShell>
  );
}
