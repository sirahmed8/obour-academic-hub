"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useLanguage } from "@/contexts";
import { ActivityLog } from "@/types";
import {
  ShieldCheck,
  Search,
  Trash2,
  PlusCircle,
  LogIn,
  CheckCircle,
  Clock,
  User as UserIcon,
  Loader2,
} from "lucide-react";

import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { cn } from "@/lib/utils";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { language } = useLanguage();

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, "logs"), orderBy("timestamp", "desc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as ActivityLog
      );
      setLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatAction = (action: string, lang: string) => {
    const map: Record<string, Record<string, string>> = {
      USER_CREATE: { en: "User Created", ar: "تم إنشاء مستخدم" },
      USER_DELETE: { en: "User Deleted", ar: "تم حذف مستخدم" },
      USER_UPDATE: { en: "User Updated", ar: "تم تعديل مستخدم" },
      ROLE_UPDATE: { en: "Role Updated", ar: "تحديث الدور" },
      PERMISSION_UPDATE: { en: "Permissions Updated", ar: "تحديث الصلاحيات" },
      SUBJECT_CREATE: { en: "Subject Added", ar: "تم إضافة مادة" },
      SUBJECT_UPDATE: { en: "Subject Updated", ar: "تم تعديل مادة" },
      SUBJECT_DELETE: { en: "Subject Deleted", ar: "تم حذف مادة" },
      RESOURCE_CREATE: { en: "Resource Added", ar: "تم إضافة مصدر" },
      RESOURCE_UPDATE: { en: "Resource Updated", ar: "تم تعديل مصدر" },
      RESOURCE_DELETE: { en: "Resource Deleted", ar: "تم حذف مصدر" },
      LOGIN: { en: "User Login", ar: "تسجيل دخول" },
      LOGOUT: { en: "User Logout", ar: "تسجيل خروج" },
      SETTINGS_UPDATE: { en: "Settings Updated", ar: "تحديث الإعدادات" },
      RESET_STATS: { en: "Statistics Reset", ar: "تصفير الإحصائيات" },
      CHAT_DELETE: { en: "Chat Deleted", ar: "تم حذف المحادثة" },
      LOGS_DELETE: { en: "Audit Logs Cleared", ar: "تصفير سجل العمليات" },
    };

    if (map[action]) return map[action][lang === "ar" ? "ar" : "en"];
    return action.replace(/_/g, " ");
  };

  return (
    <div className="p-6 lg:p-10 w-full space-y-8 page-transition">
      <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <ShieldCheck className="text-primary w-10 h-10" />
            {language === "ar" ? "سجل العمليات" : "Audit Logs"}
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            {language === "ar"
              ? "متابعة كافة التحركات الإدارية والأمنية"
              : "Monitor all administrative and security actions"}
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder={language === "ar" ? "بحث في السجلات..." : "Search logs..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-muted/50 border border-border/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50 font-medium"
          />
        </div>
      </FadeIn>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-muted-foreground font-medium animate-pulse italic">
            {language === "ar" ? "جاري جلب السجلات..." : "RETRIEVING AUDIT TRAIL..."}
          </p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-40 text-center opacity-30 flex flex-col items-center gap-6">
          <ActivityLogIcon size={80} className="text-muted-foreground" />
          <p className="text-2xl font-bold italic">
            {language === "ar" ? "لا توجد سجلات مطابقة" : "No matching logs found"}
          </p>
        </div>
      ) : (
        <StaggerChildren className="space-y-4">
          {filteredLogs.map((log) => (
            <ScaleIn
              key={log.id}
              className="group bg-card hover:bg-muted/30 p-5 rounded-3xl border border-border/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 flex flex-col sm:flex-row items-center gap-6"
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500",
                  log.action.includes("CREATE")
                    ? "bg-emerald-500"
                    : log.action.includes("DELETE")
                      ? "bg-rose-500"
                      : log.action.includes("UPDATE")
                        ? "bg-amber-500"
                        : "bg-blue-500"
                )}
              >
                {log.action.includes("CREATE") ? (
                  <PlusCircle size={24} />
                ) : log.action.includes("DELETE") ? (
                  <Trash2 size={24} />
                ) : log.action.includes("LOGIN") ? (
                  <LogIn size={24} />
                ) : (
                  <CheckCircle size={24} />
                )}
              </div>

              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {formatAction(log.action, language)}
                    </h3>
                    <span className="text-[10px] bg-muted px-2 py-1 rounded-lg font-mono text-muted-foreground/70 uppercase tracking-tighter">
                      {log.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
                    <Clock size={12} className="text-primary" />
                    {log.timestamp
                      ? (() => {
                          const t = log.timestamp as unknown as {
                            toDate?: () => Date;
                            seconds?: number;
                          };
                          if (typeof t === "string") return new Date(t);
                          if (t && typeof t.toDate === "function") return t.toDate();
                          if (t && typeof t.seconds === "number") return new Date(t.seconds * 1000);
                          return new Date();
                        })().toLocaleString(language === "ar" ? "ar-EG" : "en-US")
                      : "-"}
                  </div>
                </div>

                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  {log.details}
                </p>

                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/60 bg-muted/20 px-2 py-0.5 rounded-lg border border-border/30">
                    <UserIcon size={12} />
                    {log.userEmail}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground/30 truncate max-w-[200px]">
                    UID: {log.userId}
                  </div>
                </div>
              </div>
            </ScaleIn>
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}

function ActivityLogIcon({ size = 24, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2v10" />
      <path d="M18.4 20a10 10 0 1 0-12.8 0" />
    </svg>
  );
}
