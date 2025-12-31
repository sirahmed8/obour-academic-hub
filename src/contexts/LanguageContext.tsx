'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.notifications': 'Notifications',
    'nav.admin': 'Admin Dashboard',
    'nav.aiStudio': 'AI Studio',
    'nav.team': 'Team',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.greeting': 'Welcome back',
    'dashboard.subjects': 'Your Subjects',
    'dashboard.noSubjects': 'No subjects available yet.',
    
    // Profile
    'profile.settings': 'Settings',
    'profile.theme': 'Theme',
    'profile.language': 'Language',
    'profile.darkMode': 'Dark Mode',
    'profile.lightMode': 'Light Mode',
    'profile.systemMode': 'System',
    
    // Admin
    'admin.subjects': 'Subjects',
    'admin.resources': 'Resources',
    'admin.users': 'Users',
    'admin.inbox': 'Inbox',
    'admin.analytics': 'Analytics',
    'admin.logs': 'Logs',
    'admin.errors': 'Errors',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.noResults': 'No results found',
    
    // Chat
    'chat.placeholder': 'Ask me anything about your studies...',
    'chat.send': 'Send',
    'chat.assistant': 'Academic Assistant',
    'chat.liveSupport': 'Live Support',
    'chat.offline': 'Offline Mode',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.notifications': 'الإشعارات',
    'nav.admin': 'لوحة التحكم',
    'nav.aiStudio': 'استوديو الذكاء',
    'nav.team': 'الفريق',
    'nav.logout': 'تسجيل الخروج',
    
    // Dashboard
    'dashboard.greeting': 'مرحباً بك',
    'dashboard.subjects': 'المواد الدراسية',
    'dashboard.noSubjects': 'لا توجد مواد متاحة حالياً.',
    
    // Profile
    'profile.settings': 'الإعدادات',
    'profile.theme': 'المظهر',
    'profile.language': 'اللغة',
    'profile.darkMode': 'الوضع الداكن',
    'profile.lightMode': 'الوضع الفاتح',
    'profile.systemMode': 'النظام',
    
    // Admin
    'admin.subjects': 'المواد',
    'admin.resources': 'الموارد',
    'admin.users': 'المستخدمين',
    'admin.inbox': 'صندوق الوارد',
    'admin.analytics': 'التحليلات',
    'admin.logs': 'السجلات',
    'admin.errors': 'الأخطاء',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.add': 'إضافة',
    'common.search': 'بحث',
    'common.noResults': 'لا توجد نتائج',
    
    // Chat
    'chat.placeholder': 'اسألني أي شيء عن دراستك...',
    'chat.send': 'إرسال',
    'chat.assistant': 'المساعد الأكاديمي',
    'chat.liveSupport': 'الدعم المباشر',
    'chat.offline': 'وضع عدم الاتصال',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('obour-language') as Language;
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('obour-language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
