"use client";

import { useEffect, useState } from "react";
import { User } from "@/types";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, deleteDoc, limit } from "firebase/firestore";
import { motion } from "framer-motion";
import { X, Download, Trash2, Activity, MessageSquare, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

// Define proper types for admin data
interface LogEntry {
  id: string;
  path?: string;
  type?: string;
  details?: string;
  timestamp?: { seconds: number };
}

interface ChatEntry {
  id: string;
  content?: string;
  role?: string;
  timestamp?: string | { seconds: number };
}

interface ErrorEntry {
  id: string;
  message?: string;
  context?: string;
  stack?: string;
  timestamp?: { seconds: number };
}

interface UserDetailModalProps {
  user: User;
  onClose: () => void;
  language: "ar" | "en";
}

export function UserDetailModal({ user, onClose, language }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"activity" | "chats" | "errors">("activity");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    logs: LogEntry[];
    chats: ChatEntry[];
    errors: ErrorEntry[];
  }>({ logs: [], chats: [], errors: [] });

  useEffect(() => {
    const fetchData = async () => {
      if (!db) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch Logs (Last 50)
        const logsQ = query(
          collection(db, "analytics_logs"),
          where("userId", "==", user.uid),
          limit(50)
        );

        // Fetch Errors
        const errorsQ = query(
          collection(db, "error_logs"),
          where("userId", "==", user.uid),
          limit(50)
        );

        const aiChatsRef = collection(db, `chats/${user.uid}/messages`);
        const liveChatsRef = collection(db, `chats/${user.uid}_support/messages`);

        const [logsSnap, errorsSnap, aiChatsSnap, liveChatsSnap] = await Promise.all([
          getDocs(logsQ),
          getDocs(errorsQ),
          getDocs(aiChatsRef),
          getDocs(liveChatsRef),
        ]);

        // Directly set state with mapped and normalized data

        setData({
          logs: logsSnap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              timestamp: data.timestamp
                ? {
                    seconds: Math.floor(
                      new Date(
                        data.timestamp.toDate
                          ? data.timestamp.toDate()
                          : data.timestamp.seconds * 1000
                      ).getTime() / 1000
                    ),
                  }
                : undefined,
            } as LogEntry;
          }),
          errors: errorsSnap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              timestamp: data.timestamp
                ? {
                    seconds: Math.floor(
                      new Date(
                        data.timestamp.toDate
                          ? data.timestamp.toDate()
                          : data.timestamp.seconds * 1000
                      ).getTime() / 1000
                    ),
                  }
                : undefined,
            } as ErrorEntry;
          }),
          chats: [...aiChatsSnap.docs, ...liveChatsSnap.docs].map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              timestamp: data.timestamp
                ? data.timestamp.toDate
                  ? data.timestamp.toDate().toISOString()
                  : new Date(data.timestamp.seconds * 1000).toISOString()
                : undefined,
            } as ChatEntry;
          }),
        });
      } catch (err) {
        console.error("UserDetailModal fetch error:", err);
        toast.error("Failed to load user data. Check console for details.");
      }
      setLoading(false);
    };

    fetchData();
  }, [user.uid]);

  const handleExport = () => {
    const exportData = {
      userProfile: user,
      ...data,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `user_data_${user.displayName?.replace(/\s+/g, "_")}_${user.uid}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const handleDeleteData = async () => {
    if (
      !window.confirm(
        "Are you sure? This will delete ALL tracked data for this user. This cannot be undone."
      )
    )
      return;

    if (!db) return;

    try {
      // Delete analytics logs
      const deletePromises = data.logs.map((l) => deleteDoc(doc(db!, "analytics_logs", l.id)));
      await Promise.all(deletePromises);

      toast.success("Logs deleted successfully");
      setData((prev) => ({ ...prev, logs: [] }));
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete data");
    }
  };

  const formatTimestamp = (ts: { seconds: number } | string | undefined) => {
    if (!ts) return "Unknown";
    if (typeof ts === "string") return new Date(ts).toLocaleString();
    if (typeof ts === "object" && "seconds" in ts) {
      return new Date(ts.seconds * 1000).toLocaleString();
    }
    return "Unknown";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      tabIndex={-1}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 30,
          mass: 0.8,
        }}
        className="w-full max-w-4xl max-h-[85vh] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-4">
            <Image
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
              alt={user.displayName}
              width={56}
              height={56}
              className="rounded-full shadow-lg border-2 border-border"
            />
            <div>
              <h2 className="text-xl font-extrabold text-foreground">{user.displayName}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-1.5">
                <span className="text-[10px] bg-primary/10 px-2.5 py-0.5 rounded-full text-primary font-semibold">
                  {user.role}
                </span>
                <span className="text-[10px] bg-muted px-2.5 py-0.5 rounded-full font-mono text-muted-foreground">
                  {user.uid}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-b border-border flex gap-4 bg-muted/20">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 dark:text-indigo-400 rounded-xl text-sm font-bold transition-all active:scale-95 border border-indigo-100 dark:border-indigo-900/30"
          >
            <Download size={16} />
            {language === "ar" ? "تصدير البيانات (JSON)" : "Export Data (JSON)"}
          </button>
          <button
            onClick={handleDeleteData}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/40 dark:text-red-400 rounded-xl text-sm font-bold transition-all active:scale-95 border border-red-100 dark:border-red-900/30"
          >
            <Trash2 size={16} />
            {language === "ar" ? "حذف البيانات" : "Delete Data"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-muted/10">
          {(
            [
              {
                id: "activity",
                icon: Activity,
                label: language === "ar" ? "سجل النشاط" : "Activity Logs",
              },
              {
                id: "chats",
                icon: MessageSquare,
                label: language === "ar" ? "المحادثات" : "Chats",
              },
              {
                id: "errors",
                icon: AlertTriangle,
                label: language === "ar" ? "الأخطاء" : "Errors",
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors relative",
                activeTab === tab.id
                  ? "text-primary bg-background/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-background/50 text-foreground font-mono text-sm relative">
          {loading ? (
            <div className="flex items-center justify-center h-full py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              {activeTab === "activity" &&
                (data.logs.length === 0 ? (
                  <p className="text-muted-foreground/50 italic text-center p-12">
                    {language === "ar" ? "لا يوجد سجل نشاط" : "No activity logs found"}
                  </p>
                ) : (
                  data.logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-card rounded-2xl border border-border flex gap-4 hover:bg-muted/30 transition-colors shadow-sm"
                    >
                      <span className="text-indigo-600 dark:text-indigo-400 w-24 shrink-0 truncate text-xs font-semibold">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <div className="flex-1 break-all text-xs">
                        <span
                          className={cn(
                            "font-bold mr-2",
                            log.type === "PAGE_VIEW" && "text-green-600 dark:text-green-400",
                            log.type === "SUBJECT_OPEN" && "text-purple-600 dark:text-purple-400",
                            log.type === "FILE_OPEN" && "text-amber-600 dark:text-amber-400",
                            log.type === "REPORT_ISSUE" && "text-red-600 dark:text-red-400"
                          )}
                        >
                          {log.type || "ACTION"}
                        </span>
                        <span className="text-foreground/80">
                          {log.details || log.path || "No details"}
                        </span>
                      </div>
                    </div>
                  ))
                ))}

              {activeTab === "chats" &&
                (data.chats.length === 0 ? (
                  <p className="text-muted-foreground/50 italic text-center p-12">
                    {language === "ar" ? "لا يوجد محادثات" : "No chats found"}
                  </p>
                ) : (
                  data.chats.map((chat) => (
                    <div
                      key={chat.id}
                      className="p-4 bg-card rounded-2xl border border-border space-y-1.5 hover:bg-muted/30 transition-colors shadow-sm"
                    >
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatTimestamp(chat.timestamp)}</span>
                        <span className="font-bold uppercase tracking-wider text-[10px] bg-muted px-2 py-0.5 rounded-full">
                          {chat.role}
                        </span>
                      </div>
                      <p className="text-foreground/95 text-xs whitespace-pre-wrap leading-relaxed">
                        {chat.content}
                      </p>
                    </div>
                  ))
                ))}

              {activeTab === "errors" &&
                (data.errors.length === 0 ? (
                  <p className="text-muted-foreground/50 italic text-center p-12">
                    {language === "ar" ? "لا يوجد أخطاء مسجلة" : "No errors recorded"}
                  </p>
                ) : (
                  data.errors.map((err) => (
                    <div
                      key={err.id}
                      className="p-4 bg-red-500/5 dark:bg-red-500/10 rounded-2xl border border-red-500/20 dark:border-red-500/30 space-y-2 shadow-sm"
                    >
                      <div className="flex justify-between text-xs text-red-600 dark:text-red-400">
                        <span>{formatTimestamp(err.timestamp)}</span>
                        <span className="font-bold">{err.context}</span>
                      </div>
                      <p className="text-red-800 dark:text-red-200 font-bold text-xs">
                        {err.message}
                      </p>
                      {err.stack && (
                        <pre className="text-[10px] text-red-800/60 dark:text-red-200/50 mt-2 overflow-x-auto p-3 bg-red-500/10 rounded-xl max-h-40 custom-scrollbar">
                          {err.stack}
                        </pre>
                      )}
                    </div>
                  ))
                ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
