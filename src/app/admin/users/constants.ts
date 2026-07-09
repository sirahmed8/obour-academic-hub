import { PermissionDefinition } from "./types";

export const PERMISSIONS: PermissionDefinition[] = [
  { key: "manage_users", label: "Manage Users", labelAr: "إدارة المستخدمين" },
  { key: "manage_subjects", label: "Manage Subjects", labelAr: "إدارة المواد" },
  { key: "manage_resources", label: "Manage Resources", labelAr: "إدارة المصادر" },
  { key: "send_notifications", label: "Send Notifications", labelAr: "إرسال إشعارات" },
  { key: "delete_chats", label: "Delete Chats", labelAr: "حذف المحادثات" },
  { key: "access_inbox", label: "Access Inbox", labelAr: "الوصول للصندوق الوارد" },
  {
    key: "manage_announcements",
    label: "Manage Announcements",
    labelAr: "إدارة الإعلانات",
  },
  { key: "view_analytics", label: "View Analytics", labelAr: "عرض الإحصائيات" },
];
