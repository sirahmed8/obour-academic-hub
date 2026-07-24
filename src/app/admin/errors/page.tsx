"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, doc, writeBatch } from "firebase/firestore";
import { toast } from "sonner";
import { useLanguage } from "@/contexts";
import { AlertCircle, Search, Clock, Bug, Layout, Server, Trash2 } from "lucide-react";

import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { LoadingTable } from "@/components/ui/Loading";
interface SystemError {
  id: string;
  message: string;
  timestamp: string | { toDate: () => Date; seconds: number };
  stack?: string;
  context?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
}

export default function AdminErrorsPage() {
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, "system_errors"), orderBy("timestamp", "desc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as SystemError
      );
      setErrors(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const executeDeleteAll = async () => {
    if (!db) return;
    try {
      setLoading(true);
      const batch = writeBatch(db);
      errors.forEach((err) => {
        batch.delete(doc(db!, "system_errors", err.id));
      });
      await batch.commit();
      toast.success(language === "ar" ? "تم مسح الأخطاء بنجاح" : "All errors cleared successfully");
    } catch (e) {
      console.error(e);
      toast.error(language === "ar" ? "فشل المسح" : "Failed to clear errors");
    } finally {
      setLoading(false);
    }
  };

  const filteredErrors = errors.filter(
    (err) =>
      err.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (err.context && err.context.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 lg:p-10 w-full space-y-8 page-transition">
      <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <AlertCircle className="text-rose-500 w-10 h-10" />
            {language === "ar" ? "أخطاء النظام" : "System Errors"}
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            {language === "ar"
              ? "متابعة استقرار المنصة وتحليل المشاكل التقنية"
              : "Monitor platform stability and analyze technical issues"}
          </p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder={language === "ar" ? "بحث في الأخطاء..." : "Search errors..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all placeholder:text-muted-foreground/50 font-medium"
            />
          </div>
          {errors.length > 0 && (
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={loading}
              className="px-4 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 transition-all flex items-center justify-center disabled:opacity-50"
              title={language === "ar" ? "مسح جميع الأخطاء" : "Clear All Errors"}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </FadeIn>

      {loading ? (
        <LoadingTable rows={6} />
      ) : filteredErrors.length === 0 ? (
        <div className="py-40 text-center opacity-30 flex flex-col items-center gap-6">
          <Bug size={80} className="text-muted-foreground" />
          <p className="text-2xl font-bold italic">
            {language === "ar" ? "لا توجد أخطاء مسجلة" : "No errors logged"}
          </p>
        </div>
      ) : (
        <StaggerChildren className="space-y-4">
          {filteredErrors.map((err) => (
            <ScaleIn
              key={err.id}
              className="group bg-card hover:bg-rose-500/2 p-6 rounded-3xl border border-border/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-rose-500/5"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                  <Server size={24} />
                </div>

                <div className="flex-1 min-w-0 w-full space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-rose-500 transition-colors">
                        {err.context || (language === "ar" ? "خطأ في النظام" : "System Error")}
                      </h3>
                      <span className="text-[10px] bg-rose-500/10 text-rose-600 px-2 py-1 rounded-lg font-mono font-bold uppercase">
                        {err.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
                      <Clock size={12} className="text-rose-500" />
                      {err.timestamp
                        ? (typeof err.timestamp === "string"
                            ? new Date(err.timestamp)
                            : err.timestamp.toDate()
                          ).toLocaleString(language === "ar" ? "ar-EG" : "en-US")
                        : "-"}
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-2xl border border-border/30 font-mono text-sm text-foreground overflow-x-auto whitespace-pre-wrap break-all border-l-4 border-l-rose-500">
                    {err.message}
                  </div>

                  {err.url && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium truncate opacity-60">
                      <Layout size={12} />
                      {err.url}
                    </div>
                  )}

                  {err.stack && (
                    <details className="mt-4">
                      <summary className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-colors outline-none select-none">
                        {language === "ar" ? "عرض تفاصيل الخطأ (Stack Trace)" : "Show Stack Trace"}
                      </summary>
                      <div className="mt-2 p-5 bg-black/90 rounded-2xl text-[10px] text-rose-400/80 font-mono overflow-x-auto border border-white/5">
                        {err.stack}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </ScaleIn>
          ))}
        </StaggerChildren>
      )}

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          setShowConfirmModal(false);
          executeDeleteAll();
        }}
        title={language === "ar" ? "مسح جميع الأخطاء" : "Clear All Errors"}
        message={
          language === "ar"
            ? "هل أنت متأكد من حذف جميع سجلات الأخطاء؟ لا يمكن التراجع عن هذا الإجراء."
            : "Are you sure you want to delete ALL logged errors? This action cannot be undone."
        }
        confirmText={language === "ar" ? "حذف الكل" : "Delete All"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        type="danger"
      />
    </div>
  );
}
