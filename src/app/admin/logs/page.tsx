"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { useLanguage } from "@/contexts";
import { AppShell } from "@/components/layout/AppShell";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
  FileText,
  Trash2,
  Loader2,
  AlertTriangle,
  LogIn,
  PlusCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatDateArabic } from "@/lib/utils";
import { ActivityLog } from "@/types";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { language, t } = useLanguage();

  useEffect(() => {
    const q = query(collection(db, "logs"), orderBy("timestamp", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ActivityLog));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const clearLogs = async () => {
    setShowClearModal(false);
    setIsClearing(true);
    try {
      // Use batch delete for better performance and atomicity
      const snapshot = await getDocs(query(collection(db, "logs"), limit(500)));
      const batch = writeBatch(db);

      let count = 0;
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
      });

      if (count > 0) {
        await batch.commit();
        toast.success(language === "ar" ? "تم مسح السجلات" : "Logs cleared");
      } else {
        toast.info(language === "ar" ? "لا توجد سجلات للمسح" : "No logs to clear");
      }
    } catch (error) {
      console.error("Clear logs error:", error);
      toast.error(language === "ar" ? "فشل المسح" : "Failed to clear");
    } finally {
      setIsClearing(false);
    }
  };

  const getLogIcon = (action: string) => {
    if (action.includes("LOGIN")) return <LogIn className="text-blue-500" size={20} />;
    if (action.includes("ERROR")) return <AlertTriangle className="text-red-500" size={20} />;
    if (action.includes("CREATE")) return <PlusCircle className="text-green-500" size={20} />;
    if (action.includes("UPDATE")) return <FileText className="text-yellow-500" size={20} />;
    return <CheckCircle className="text-muted-foreground" size={20} />;
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <FileText className="text-primary" />
            {t("admin.logs")}
          </h1>
          {logs.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-all active:scale-95 font-medium flex items-center gap-2"
              disabled={isClearing}
            >
              {isClearing ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
              {language === "ar" ? "مسح السجلات" : "Clear Logs"}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
              <FileText size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground font-medium">
                {language === "ar" ? "لا توجد سجلات" : "No activity logs found"}
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="group bg-card p-4 rounded-2xl border border-border hover:shadow-md hover:border-primary/20 transition-all duration-200 flex items-start gap-4"
              >
                <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/5 transition-colors">
                  {getLogIcon(log.action)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{log.action}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {log.details}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-lg whitespace-nowrap">
                      {language === "ar"
                        ? formatDateArabic(log.timestamp)
                        : formatDate(log.timestamp)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    {log.userEmail || "System"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={clearLogs}
        title={language === "ar" ? "مسح السجلات" : "Clear Logs"}
        message={
          language === "ar"
            ? "هل أنت متأكد من مسح جميع السجلات؟ لا يمكن التراجع عن هذا الإجراء."
            : "Are you sure you want to clear all logs? This action cannot be undone."
        }
        confirmText={language === "ar" ? "مسح" : "Clear"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        type="danger"
      />
    </AppShell>
  );
}
