"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage, useAuth } from "@/contexts";
import { notificationService } from "@/services/notification.service";
import {
  Filter,
  CheckCheck,
  Trash2,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { ScrollableTabs } from "@/components/ui/ScrollableTabs";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { LoadingTable } from "@/components/ui/Loading";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { listContainer, listItem } from "@/lib/motion";
import { formatDate, formatDateArabic } from "@/lib/utils";
import { Notification } from "@/types";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "academic">("all");

  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.subscribeToUser(
      user.uid,
      (allNotifs) => {
        setNotifications(allNotifs);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      },
      { includeAdminTarget: isAdmin }
    );

    return () => unsubscribe();
  }, [user, isAdmin]);

  const markAllAsRead = async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.readBy?.includes(user?.uid));

    if (unread.length === 0) return;

    unread.forEach(async (n) => {
      try {
        await notificationService.markAsRead(n.id, user.uid);
      } catch (err) {
        console.error("Error marking read:", err);
      }
    });
    toast.success(t("notifications.marked_read") || "Marked all as read");
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await notificationService.delete(deleteId);
      toast.success(
        language === "ar" ? "تم حذف الإشعار بنجاح" : "Notification deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error(language === "ar" ? "حدث خطأ أثناء حذف الإشعار" : "Error deleting notification");
    } finally {
      setDeleteId(null);
    }
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return AlertTriangle;
      case "success":
        return CheckCircle;
      case "urgent":
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20";
      case "success":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      case "urgent":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";
    }
  };

  const unreadCount = notifications.filter((n) => !n.readBy?.includes(user?.uid || "")).length;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const isUnread = !n.readBy?.includes(user?.uid || "");
      if (activeFilter === "unread") return isUnread;
      if (activeFilter === "academic") return Boolean(n.subjectId);
      return true;
    });
  }, [notifications, activeFilter, user?.uid]);

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-10 w-full space-y-6 max-w-7xl mx-auto page-transition min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 relative shrink-0">
              <Bell className="w-8 h-8 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                  {t("nav.notifications")}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
                  {unreadCount} {language === "ar" ? "جديد" : "new"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">
                {language === "ar"
                  ? "تابع آخر الإعلانات والتحديثات الأكاديمية والتنبيهات العامة"
                  : "Stay updated with campus alerts and academic announcements"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground text-xs font-bold rounded-2xl border border-primary/20 transition-all active:scale-95 shadow-sm"
              title={language === "ar" ? "تحديد الكل كمقروء" : "Mark all as read"}
            >
              <CheckCheck className="w-4 h-4" />
              <span>{language === "ar" ? "تحديد الكل كمقروء" : "Mark All Read"}</span>
            </button>
          )}
        </div>

        {/* Filter Controls Bar */}
        <ScrollableTabs className="p-1.5 bg-card/40 backdrop-blur-md rounded-2xl border border-border/50">
          <div className="px-3 py-1 text-muted-foreground shrink-0">
            <Filter size={16} />
          </div>

          <button
            onClick={() => setActiveFilter("all")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0",
              activeFilter === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {language === "ar" ? "جميع الإشعارات" : "All Alerts"} ({notifications.length})
          </button>

          <button
            onClick={() => setActiveFilter("unread")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0",
              activeFilter === "unread"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {language === "ar" ? "غير مقروءة" : "Unread"} ({unreadCount})
          </button>

          <button
            onClick={() => setActiveFilter("academic")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0",
              activeFilter === "academic"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {language === "ar" ? "تحديثات المواد" : "Course Updates"}
          </button>
        </ScrollableTabs>

        {loading ? (
          <LoadingTable rows={5} />
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-20 bg-card/30 backdrop-blur-xl rounded-3xl border-2 border-dashed border-border/50">
            <Bell size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">
              {language === "ar" ? "لا توجد إشعارات حالياً" : "No notifications right now"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {language === "ar"
                ? "كل شيء محدث! ستظهر هنا أي تحديثات جديدة من إدارة المنصة أو المواد."
                : "Everything is up to date! New course updates and alerts will appear here."}
            </p>
          </div>
        ) : (
          <motion.div
            variants={listContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredNotifications.map((notif) => {
              const Icon = getIcon(notif.type);
              const isRead = notif.readBy?.includes(user?.uid || "");

              return (
                <motion.div
                  variants={listItem}
                  key={notif.id}
                  onClick={async () => {
                    if (!isRead && user) {
                      try {
                        await notificationService.markAsRead(notif.id, user.uid);
                      } catch (err) {
                        console.error("Failed to mark notification as read:", err);
                      }
                    }
                    if (notif.subjectId) {
                      const url = notif.resourceId
                        ? `/subject?id=${notif.subjectId}&highlight=${notif.resourceId}`
                        : `/subject?id=${notif.subjectId}`;
                      router.push(url);
                    }
                  }}
                  className={cn(
                    "rounded-3xl p-5 sm:p-6 border transition-all duration-300 backdrop-blur-xl relative overflow-hidden group",
                    isRead
                      ? "bg-card/40 border-border/40 opacity-75 hover:opacity-100 hover:border-primary/20"
                      : "bg-card border-primary/30 shadow-lg shadow-primary/5 ring-1 ring-primary/10",
                    notif.subjectId && "cursor-pointer hover:scale-[1.01]"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn("p-3.5 rounded-2xl shrink-0 shadow-sm", getColors(notif.type))}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div className="flex items-center gap-2">
                          <h3
                            className={cn(
                              "font-extrabold text-base sm:text-lg text-foreground",
                              !isRead && "text-primary"
                            )}
                          >
                            {language === "ar"
                              ? notif.titleAr || notif.title || "إشعار"
                              : notif.titleEn || notif.title || "Notification"}
                          </h3>
                          {!isRead && (
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block animate-ping" />
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground font-semibold">
                            {language === "ar"
                              ? formatDateArabic(notif.createdAt)
                              : formatDate(notif.createdAt)}
                          </span>

                          {isAdmin && (
                            <button
                              onClick={(e) => confirmDelete(notif.id, e)}
                              className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm font-medium leading-relaxed">
                        {language === "ar"
                          ? notif.messageAr || notif.message || ""
                          : notif.messageEn || notif.message || ""}
                      </p>

                      {notif.subjectId && (
                        <div className="mt-4 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                            <span>
                              {language === "ar" ? "عرض المادة الدراسية" : "View Subject Material"}
                            </span>
                            <ExternalLink size={14} />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={language === "ar" ? "حذف الإشعار" : "Delete Notification"}
        message={
          language === "ar"
            ? "هل أنت متأكد من أنك تريد حذف هذا الإشعار؟ لا يمكن التراجع عن هذا الإجراء."
            : "Are you sure you want to delete this notification? This action cannot be undone."
        }
        confirmText={language === "ar" ? "حذف" : "Delete"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        type="danger"
      />
    </>
  );
}
