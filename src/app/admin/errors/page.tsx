"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, limit } from "firebase/firestore";
import { useLanguage } from "@/contexts";
import { AppShell } from "@/components/layout/AppShell";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDate, formatDateArabic } from "@/lib/utils";
import { SystemError } from "@/types";

export default function AdminErrorsPage() {
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [loading, setLoading] = useState(true);
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

  const unresolvedCount = errors.filter((e) => !e.resolved).length;

  return (
    <AppShell>
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <AlertTriangle className="text-destructive" />
            {t("admin.errors")}
            {unresolvedCount > 0 && (
              <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-sm rounded-full">
                {unresolvedCount}
              </span>
            )}
          </h1>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-10 text-center">
              <Loader2 className="animate-spin mx-auto text-primary" size={40} />
            </div>
          ) : errors.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
              {language === "ar" ? "لا توجد أخطاء 🎉" : "No errors found 🎉"}
            </div>
          ) : (
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {errors.map((error) => (
                <div
                  key={error.id}
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
                          className={error.resolved ? "text-muted-foreground" : "text-destructive"}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
