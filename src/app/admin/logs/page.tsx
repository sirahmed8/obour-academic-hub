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

import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
  FileText,
  Trash2,
  Loader2,
  AlertTriangle,
  LogIn,
  PlusCircle,
  CheckCircle,
  Search,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatDateArabic } from "@/lib/utils";
import { ActivityLog } from "@/types";
import { doc, deleteDoc as deleteDocFn } from "firebase/firestore";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("adminLogsSearch") || "";
    }
    return "";
  });
  const { language, t } = useLanguage();

  // Persist State & Scroll
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem("adminLogsScroll", window.scrollY.toString());
    };
    window.addEventListener("scroll", handleScroll);

    // Restore scroll
    const savedScroll = sessionStorage.getItem("adminLogsScroll");
    if (savedScroll) {
      window.scrollTo(0, parseFloat(savedScroll));
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("adminLogsSearch", searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const q = query(collection(db, "logs"), orderBy("timestamp", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ActivityLog));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.details.toLowerCase().includes(searchLower) ||
      (log.userEmail && log.userEmail.toLowerCase().includes(searchLower))
    );
  });

  const downloadLogs = () => {
    if (filteredLogs.length === 0) {
      toast.error(language === "ar" ? "لا توجد سجلات لتحميلها" : "No logs to download");
      return;
    }

    const headers = ["Timestamp", "Action", "Details", "User Email", "User ID"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map((log) => {
        let dateVal = new Date();
        const ts = log.timestamp as unknown;
        // Handle Firestore Timestamp or String or Date
        if (ts && typeof (ts as { toDate: () => Date }).toDate === "function") {
          dateVal = (ts as { toDate: () => Date }).toDate();
        } else if (ts && typeof (ts as { seconds: number }).seconds === "number") {
          dateVal = new Date((ts as { seconds: number }).seconds * 1000);
        } else if (typeof ts === "string") {
          dateVal = new Date(ts);
        }
        const date = dateVal.toISOString();
        const details = `"${log.details.replace(/"/g, '""')}"`; // Escape quotes
        return [date, log.action, details, log.userEmail || "System", log.userId || ""].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `logs_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    <>
      <div className="p-6 lg:p-10 w-full page-transition">
        <FadeIn className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <FileText className="text-primary" />
            {t("admin.logs")}
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 rtl:right-3 rtl:left-auto pointer-events-none z-10" />
              <input
                type="text"
                placeholder={language === "ar" ? "بحث في السجلات..." : "Search logs..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 pl-10 pr-10 rounded-2xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none text-sm shadow-sm placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={downloadLogs}
                className="flex-1 sm:flex-none px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all font-medium flex items-center justify-center gap-2"
                title={language === "ar" ? "تحميل CSV" : "Download CSV"}
              >
                <Download size={18} />
                <span className="hidden sm:inline">{language === "ar" ? "تصدير" : "Export"}</span>
              </button>

              {logs.length > 0 && (
                <button
                  onClick={() => setShowClearModal(true)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-xl transition-all active:scale-95 font-medium flex items-center justify-center gap-2"
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Trash2 size={18} />
                  )}
                  <span className="hidden sm:inline">{language === "ar" ? "مسح" : "Clear"}</span>
                </button>
              )}
            </div>
          </div>
        </FadeIn>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : logs.length === 0 ? (
            <FadeIn>
              <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-border">
                <FileText size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground font-medium">
                  {language === "ar" ? "لا توجد سجلات" : "No activity logs found"}
                </p>
              </div>
            </FadeIn>
          ) : (
            <StaggerChildren className="space-y-3">
              {filteredLogs.map((log) => (
                <ScaleIn key={log.id}>
                  <div className="group bg-card p-4 rounded-2xl border border-border hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 flex items-start gap-4">
                    <div className="p-3 bg-muted rounded-xl duration-300">
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
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-lg whitespace-nowrap">
                            {language === "ar"
                              ? formatDateArabic(log.timestamp)
                              : formatDate(log.timestamp)}
                          </span>
                          <button
                            onClick={async () => {
                              try {
                                await deleteDocFn(doc(db, "logs", log.id));
                                toast.success(language === "ar" ? "تم حذف السجل" : "Log deleted");
                              } catch {
                                toast.error(language === "ar" ? "فشل الحذف" : "Delete failed");
                              }
                            }}
                            className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded-lg transition-all"
                            title={language === "ar" ? "حذف" : "Delete"}
                          >
                            <Trash2 size={14} className="text-destructive" />
                          </button>
                        </div>
                      </div>

                      <div
                        className="mt-2 flex items-center gap-2 text-xs text-muted-foreground/80 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => setSearchTerm(log.userEmail || "")}
                        title={language === "ar" ? "عرض سجلات هذا المستخدم" : "Filter by this user"}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                        {log.userEmail || "System"}
                      </div>
                    </div>
                  </div>
                </ScaleIn>
              ))}
              {filteredLogs.length === 0 && logs.length > 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  {language === "ar" ? "لا توجد نتائج للبحث" : "No logs match your search"}
                </div>
              )}
            </StaggerChildren>
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
    </>
  );
}
