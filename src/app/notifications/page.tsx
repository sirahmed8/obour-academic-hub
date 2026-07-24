"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage, useAuth } from "@/contexts";
import { notificationService } from "@/services/notification.service";

import { Bell, Info, AlertTriangle, CheckCircle, Trash2, CheckCheck } from "lucide-react";
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

  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.subscribeToUser(
      user.uid,
      (allNotifs) => {
        // No need to filter deeply here as the query is already filtered
        // But we can double check or just set state
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

    // In a real app, use a batch or backend function.
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
        return "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "success":
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case "urgent":
        return "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  const unreadCount = notifications.filter((n) => !n.readBy?.includes(user?.uid || "")).length;

  return (
    <>
      <div className="p-6 lg:p-10 w-full space-y-8 page-transition">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl relative">
              <Bell className="w-6 h-6 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("nav.notifications")}</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount} {language === "ar" ? "غير مقروءة" : "unread"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
              title={language === "ar" ? "تحديد الكل كمقروء" : "Mark all as read"}
            >
              <CheckCheck className="w-5 h-5" />
            </button>
          )}
        </div>

        {loading ? (
          <LoadingTable rows={5} />
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
            <Bell size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {language === "ar" ? "لا توجد إشعارات" : "No notifications"}
            </p>
          </div>
        ) : (
          <motion.div
            variants={listContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {notifications.map((notif) => {
              const Icon = getIcon(notif.type);
              const isRead = notif.readBy?.includes(user?.uid || "");

              return (
                <motion.div
                  variants={listItem}
                  key={notif.id}
                  onClick={async () => {
                    // Mark as read on click
                    if (!isRead && user) {
                      await notificationService.markAsRead(notif.id, user.uid);
                    }
                    // Navigate to subject if available
                    if (notif.subjectId) {
                      const url = notif.resourceId
                        ? `/subject?id=${notif.subjectId}&highlight=${notif.resourceId}`
                        : `/subject?id=${notif.subjectId}`;
                      router.push(url);
                    }
                  }}
                  className={cn(
                    "rounded-2xl p-6 border transition-all duration-200 cursor-default",
                    isRead
                      ? "bg-card/50 border-border/50 opacity-70 hover:opacity-100"
                      : "bg-card border-primary/20 shadow-sm ring-1 ring-primary/5",
                    notif.subjectId && "cursor-pointer hover:border-primary/40 hover:shadow-md"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl shrink-0", getColors(notif.type))}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <h3
                            className={cn("font-bold text-foreground", !isRead && "text-primary")}
                          >
                            {language === "ar"
                              ? notif.titleAr || notif.title || "إشعار"
                              : notif.titleEn || notif.title || "Notification"}
                            {!isRead && (
                              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500 align-middle" />
                            )}
                          </h3>
                          {isAdmin && (
                            <button
                              onClick={(e) => confirmDelete(notif.id, e)}
                              className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                              title="Delete notification"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {language === "ar"
                            ? formatDateArabic(notif.createdAt)
                            : formatDate(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                        {language === "ar"
                          ? notif.messageAr || notif.message || ""
                          : notif.messageEn || notif.message || ""}
                      </p>
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
