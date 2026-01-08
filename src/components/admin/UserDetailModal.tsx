"use client";

import { useEffect, useState } from "react";
import { User } from "@/types";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, deleteDoc, limit } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Trash2, Activity, MessageSquare, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

// Define proper types for admin data
interface LogEntry {
  id: string;
  path?: string;
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

        // Fetch Chats - this is a messages subcollection inside chats/{userId}
        const chatsRef = collection(db, `chats/${user.uid}/messages`);

        const [logsSnap, errorsSnap, chatsSnap] = await Promise.all([
          getDocs(logsQ),
          getDocs(errorsQ),
          getDocs(chatsRef),
        ]);

        setData({
          logs: logsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as LogEntry),
          errors: errorsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as ErrorEntry),
          chats: chatsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatEntry),
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

    try {
      // Delete analytics logs
      const deletePromises = data.logs.map((l) => deleteDoc(doc(db, "analytics_logs", l.id)));
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
    <AnimatePresence>
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
          className="w-full max-w-4xl max-h-[85vh] bg-white/10 dark:bg-black/50 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-4">
              <Image
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                alt={user.displayName}
                width={56}
                height={56}
                className="rounded-full shadow-lg border-2 border-white/20"
              />
              <div>
                <h2 className="text-xl font-bold text-white">{user.displayName}</h2>
                <p className="text-sm text-white/60">{user.email}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80">
                    {user.role}
                  </span>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono text-white/80">
                    {user.uid}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-white/70 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Action Bar */}
          <div className="p-4 border-b border-white/10 flex gap-4 bg-black/20">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 rounded-lg text-sm font-medium transition-colors border border-blue-500/30"
            >
              <Download size={16} />
              {language === "ar" ? "تصدير البيانات (JSON)" : "Export Data (JSON)"}
            </button>
            <button
              onClick={handleDeleteData}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg text-sm font-medium transition-colors border border-red-500/30"
            >
              <Trash2 size={16} />
              {language === "ar" ? "حذف البيانات" : "Delete Data"}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
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
                  "flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative",
                  activeTab === tab.id
                    ? "text-white bg-white/5"
                    : "text-white/50 hover:text-white hover:bg-white/5"
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
          <div className="flex-1 overflow-y-auto p-6 bg-black/20 text-white/90 font-mono text-sm relative">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              </div>
            ) : (
              <div className="space-y-2">
                {activeTab === "activity" &&
                  (data.logs.length === 0 ? (
                    <p className="text-white/40 italic text-center p-10">
                      {language === "ar" ? "لا يوجد سجل نشاط" : "No activity logs found"}
                    </p>
                  ) : (
                    data.logs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 bg-white/5 rounded border border-white/5 flex gap-4 hover:bg-white/10 transition-colors"
                      >
                        <span className="text-blue-300 w-24 shrink-0 truncate text-xs">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        <div className="flex-1 break-all">
                          <span className="text-green-300 font-bold">PAGE_VIEW</span> {log.path}
                        </div>
                      </div>
                    ))
                  ))}

                {activeTab === "chats" &&
                  (data.chats.length === 0 ? (
                    <p className="text-white/40 italic text-center p-10">
                      {language === "ar" ? "لا يوجد محادثات" : "No chats found"}
                    </p>
                  ) : (
                    data.chats.map((chat) => (
                      <div
                        key={chat.id}
                        className="p-3 bg-white/5 rounded border border-white/5 space-y-1 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex justify-between text-xs text-white/40">
                          <span>{formatTimestamp(chat.timestamp)}</span>
                          <span>{chat.role}</span>
                        </div>
                        <p className="text-white/80">{chat.content}</p>
                      </div>
                    ))
                  ))}

                {activeTab === "errors" &&
                  (data.errors.length === 0 ? (
                    <p className="text-white/40 italic text-center p-10">
                      {language === "ar" ? "لا يوجد أخطاء مسجلة" : "No errors recorded"}
                    </p>
                  ) : (
                    data.errors.map((err) => (
                      <div
                        key={err.id}
                        className="p-3 bg-red-500/10 rounded border border-red-500/20 space-y-1"
                      >
                        <div className="flex justify-between text-xs text-red-300">
                          <span>{formatTimestamp(err.timestamp)}</span>
                          <span className="font-bold">{err.context}</span>
                        </div>
                        <p className="text-red-200 font-bold">{err.message}</p>
                        {err.stack && (
                          <pre className="text-[10px] text-red-200/50 mt-2 overflow-x-auto">
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
    </AnimatePresence>
  );
}
