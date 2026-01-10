"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Subjects",
    "nav.todo": "To-Do List",
    "nav.notifications": "Notifications",
    "nav.admin": "Admin Dashboard",

    "nav.team": "Team",
    "nav.logout": "Logout",

    // Dashboard
    "dashboard.greeting": "Welcome back",
    "dashboard.subjects": "Your Subjects",
    "dashboard.noSubjects": "No subjects available yet.",

    // Profile
    "profile.settings": "Settings",
    "profile.theme": "Theme",
    "profile.language": "Language",
    "profile.darkMode": "Dark Mode",
    "profile.lightMode": "Light Mode",
    "profile.systemMode": "System",

    // Admin
    "admin.subjects": "Add Subject",
    "admin.resources": "Resources",
    "admin.users": "Users",
    "admin.inbox": "Inbox",
    "admin.analytics": "Analytics",
    "admin.logs": "Logs",
    "admin.errors": "Errors",

    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.search": "Search",
    "common.noResults": "No results found",

    // Chat
    "chat.placeholder": "Ask me anything about your studies...",
    "chat.send": "Send",
    "chat.assistant": "Academic Assistant",
    "chat.liveSupport": "Live Support",
    "chat.offline": "Offline Mode",
    "chat.clearHistory": "Clear History",
    "chat.support": "Support",

    // Notifications
    "notifications.title": "Notifications",
    "notifications.mark_all_read": "Mark all as read",
    "notifications.marked_read": "All marked as read",
    "notifications.empty": "No notifications",
    "notifications.unread": "unread",

    // Profile
    "profile.studentCode": "Student Code",
    "profile.enterCode": "Enter your 6-digit student code",
    "profile.codeLocked": "Code is locked. Contact support to change.",
    "profile.nameLocked": "Name is locked. Contact support to change.",
    "profile.contactSupport": "Contact Support",
  },
  ar: {
    // Navigation
    "nav.home": "المواضيع",
    "nav.todo": "قائمة المهام",
    "nav.notifications": "الإشعارات",
    "nav.admin": "لوحة التحكم",

    "nav.team": "الفريق",
    "nav.logout": "تسجيل الخروج",

    // Dashboard
    "dashboard.greeting": "مرحباً بك",
    "dashboard.subjects": "المواد الدراسية",
    "dashboard.noSubjects": "لا توجد مواد متاحة حالياً.",

    // Profile
    "profile.settings": "الإعدادات",
    "profile.theme": "المظهر",
    "profile.language": "اللغة",
    "profile.darkMode": "الوضع الداكن",
    "profile.lightMode": "الوضع الفاتح",
    "profile.systemMode": "النظام",

    // Admin
    "admin.subjects": "إضافة مادة",
    "admin.resources": "الموارد",
    "admin.users": "المستخدمين",
    "admin.inbox": "صندوق الوارد",
    "admin.analytics": "التحليلات",
    "admin.logs": "السجلات",
    "admin.errors": "الأخطاء",

    // Common
    "common.loading": "جاري التحميل...",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.add": "إضافة",
    "common.search": "بحث",
    "common.noResults": "لا توجد نتائج",

    // Chat
    "chat.placeholder": "اسألني أي شيء عن دراستك...",
    "chat.send": "إرسال",
    "chat.assistant": "المساعد الأكاديمي",
    "chat.liveSupport": "الدعم المباشر",
    "chat.offline": "وضع عدم الاتصال",
    "chat.clearHistory": "مسح المحادثة",
    "chat.support": "دعم",

    // Notifications
    "notifications.title": "الإشعارات",
    "notifications.mark_all_read": "تحديد الكل كمقروء",
    "notifications.marked_read": "تم تحديد الكل كمقروء",
    "notifications.empty": "لا توجد إشعارات",
    "notifications.unread": "غير مقروءة",

    // Profile
    "profile.studentCode": "كود الطالب",
    "profile.enterCode": "أدخل كود الطالب المكون من 6 أرقام",
    "profile.codeLocked": "الكود مقفل. تواصل مع الدعم للتغيير.",
    "profile.nameLocked": "الاسم مقفل. تواصل مع الدعم للتغيير.",
    "profile.contactSupport": "تواصل مع الدعم",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem("obour-language") as Language;
    return saved === "en" || saved === "ar" ? saved : "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("obour-language", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] || key;
    },
    [language]
  );

  const dir = language === "ar" ? "rtl" : "ltr";

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      dir: dir as "ltr" | "rtl",
    }),
    [language, t, dir]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
