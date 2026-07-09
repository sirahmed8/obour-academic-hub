"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useEffect,
} from "react";

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
    "nav.home": "Home",
    "nav.subjects": "Subjects",
    "nav.community": "Community",
    "nav.todo": "To-Do List",
    "nav.notifications": "Notifications",
    "nav.teamManagement": "Team Management",
    "nav.announcements": "Announcements",
    "nav.subjectManagement": "Subject Management",
    "nav.sources": "Sources",
    "nav.owner": "Owner",
    "nav.admin": "Admin Dashboard",
    "nav.settings": "Settings",

    "nav.team": "Team",
    "nav.logout": "Logout",

    // Dashboard
    "dashboard.greeting": "Welcome back",
    "dashboard.subjects": "Your Subjects",
    "dashboard.noSubjects": "No subjects available yet.",
    "dashboard.adminMode": "Admin Mode",
    "dashboard.bannerTitle": "Obour Academic Hub",
    "dashboard.bannerSubtitle": "Stay on top of your studies and don't miss anything new!",
    "dashboard.whosOnline": "Who's Online?",
    "dashboard.onlineCount": "online",
    "dashboard.you": "You",
    "dashboard.analytics": "Learning Analytics",
    "dashboard.subjects_count": "Subjects",
    "dashboard.actions_count": "Actions",
    "dashboard.files_count": "Files",
    "dashboard.views_count": "Views",
    "dashboard.topFocus": "Top Focus",
    "dashboard.achievements": "Achievements",
    "dashboard.fileMaster": "File Master",
    "dashboard.fileMasterDesc": "Downloaded 10+ files",
    "dashboard.explorer": "Explorer",
    "dashboard.explorerDesc": "Visited 5+ subjects",

    // Leaderboard
    "leaderboard.title": "Global Leaderboard",
    "leaderboard.subtitle": "Compete, learn, and climb to the Diamond league!",
    "leaderboard.rank": "Rank",
    "leaderboard.student": "Student",
    "leaderboard.league": "League",
    "leaderboard.points": "Points",
    "leaderboard.pts": "pts",
    "leaderboard.empty": "No users found. Be the first to earn points!",
    "leaderboard.you": "You",
    "leaderboard.league.Diamond": "Diamond",
    "leaderboard.league.Gold": "Gold",
    "leaderboard.league.Silver": "Silver",
    "leaderboard.league.Bronze": "Bronze",

    // Login
    "login.title": "Obour Hub",
    "login.subtitle": "Your gateway to smart learning",
    "login.continueGoogle": "Continue with Google",
    "login.secure": "Secure",
    "login.private": "Private",
    "login.encrypted": "Encrypted",
    "login.footer": "© 2026 Obour Academic Hub",
    "login.privacy": "Privacy Policy",
    "login.terms": "Terms of Service",
    "login.cookies": "Cookie Policy",

    // Navbar
    "navbar.title": "Obour Hub",
    "navbar.subtitle": "Smart Learning System",

    // Profile
    "profile.settings": "Settings",
    "profile.theme": "Theme",
    "profile.language": "Language",
    "profile.darkMode": "Dark Mode",
    "profile.lightMode": "Light Mode",
    "profile.systemMode": "System",

    // Admin
    "admin.subjects": "Subject Management",
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
    "profile.fullName": "Full Name",
    "profile.studentCode": "Student Code",
    "profile.editInfo": "Update My Data",
    "profile.lockedHint": "Your data is secured. You can update it anytime.",
    "profile.codeLocked": "Code is locked. Contact support to change.",
    "profile.nameLocked": "Name is locked. Contact support to change.",
    "profile.contactSupport": "Contact Support",
    "profile.realName": "Real Name",
    "profile.saveAndLock": "Save & Lock",
    "profile.saving": "Saving...",
    "profile.updateSuccess": "Profile updated",
    "profile.updateError": "Error updating profile",
    "profile.nameValidation": "Name must contain letters only",
    "profile.codeValidation": "Student code must be 6 digits",
    "profile.enterCode": "Enter student code",

    // Solid Mode
    "profile.solidMode": "Performance Mode",
    "profile.solidModeDesc": "Disables animations & blur for speed",

    // Notification Settings
    "notifications.enable": "Enable Notifications",
    "notifications.enabled": "Notifications enabled",
    "notifications.disableInstruction": "Please disable notifications from site settings",

    // Admin Settings
    "settings.title": "Owner Settings",
    "settings.aiToggle": "Enable AI Mode",
    "settings.aiDescription": "Enable or disable global AI features like summaries",
    "settings.chatbotToggle": "Enable Chatbot",
    "settings.chatbotDesc": "Show or hide the chatbot button across the site",
    "settings.saveSuccess": "Settings updated successfully",
    "settings.saveError": "Failed to update settings",

    // Welcome Page
    "welcome.hero.badge": "Academic Excellence Platform",
    "welcome.hero.title": "Your Smart",
    "welcome.hero.titleHighlight": "Learning Hub",
    "welcome.hero.subtitle":
      "Access all your course materials, resources, and AI-powered tools in one beautiful platform built for Obour Institute students.",
    "welcome.hero.cta": "Get Started",
    "welcome.hero.scroll": "Scroll to explore",
    "welcome.features.badge": "Why Obour Hub?",
    "welcome.features.title": "Everything You Need",
    "welcome.features.subtitle": "Powerful features designed to supercharge your academic journey.",
    "welcome.features.subjects": "Smart Subjects",
    "welcome.features.subjectsDesc":
      "Browse all your courses with organized resources, lecture notes, and downloadable materials.",
    "welcome.features.liveSupport": "Live Support",
    "welcome.features.liveSupportDesc":
      "Get instant help from our support team through the live chat widget — real humans, not bots.",
    "welcome.features.analytics": "Progress Tracking",
    "welcome.features.analyticsDesc":
      "Track your learning activity, downloads, and achievements with beautiful analytics.",
    "welcome.features.community": "Live Community",
    "welcome.features.communityDesc":
      "See who's online, collaborate with classmates, and stay connected in real-time.",
    "welcome.features.todo": "To-Do List",
    "welcome.features.todoDesc":
      "Organize your tasks, deadlines, and assignments — never miss a submission again.",
    "welcome.features.notifications": "Smart Notifications",
    "welcome.features.notificationsDesc":
      "Get real-time alerts when new resources or announcements are posted by your professors.",
    "welcome.features.darkMode": "Dark & Light Mode",
    "welcome.features.darkModeDesc":
      "Easy on the eyes. Switch between dark and light mode with one click.",
    "welcome.features.bilingual": "English & Arabic",
    "welcome.features.bilingualDesc":
      "Full RTL support. Switch between English and Arabic anytime from your profile.",
    "welcome.howItWorks.badge": "Seamless Experience",
    "welcome.howItWorks.title": "How It Works",
    "welcome.howItWorks.step1": "Authenticate",
    "welcome.howItWorks.step1Desc": "Securely sign in using your official institute email.",
    "welcome.howItWorks.step2": "Access Hub",
    "welcome.howItWorks.step2Desc": "Instantly navigate through categorized academic resources.",
    "welcome.howItWorks.step3": "Enhance Learning",
    "welcome.howItWorks.step3Desc": "Utilize smart tools and download materials for offline study.",
    "welcome.stats.badge": "Live Numbers",
    "welcome.stats.title": "Growing Every Day",
    "welcome.stats.subtitle": "Real-time stats from our platform — not fake numbers.",
    "welcome.stats.students": "Students",
    "welcome.stats.totalResources": "Resources",
    "welcome.stats.totalSubjects": "Subjects",
    "welcome.stats.uptime": "Uptime",
    "welcome.stats.online": "Online Now",
    "welcome.stats.activeStudents": "Active Students",

    "welcome.why.title": "Why Obour Hub?",
    "welcome.why.subtitle": "Built by students, for students. Here's what makes us different.",
    "welcome.why.secure": "100% Secure",
    "welcome.why.secureDesc":
      "Firebase-powered auth with encrypted data. Your information is safe with us.",
    "welcome.why.fast": "Lightning Fast",
    "welcome.why.fastDesc": "Optimized for speed with instant page loads and real-time updates.",
    "welcome.why.free": "Completely Free",
    "welcome.why.freeDesc":
      "No hidden fees, no premium tiers. Every feature is free for all students.",
    "welcome.cta.title": "Ready to Start?",
    "welcome.cta.subtitle": "Join your classmates and start exploring now.",

    // Onboarding
    "onboarding.skip": "Skip",
    "onboarding.next": "Next",
    "onboarding.done": "Let's Go!",
    "onboarding.slide1.title": "Welcome to Obour Hub! 🎉",
    "onboarding.slide1.desc": "Your one-stop platform for all academic resources and tools.",
    "onboarding.slide2.title": "Browse Your Subjects 📚",
    "onboarding.slide2.desc":
      "Tap any subject card to view lectures, notes, and downloadable files.",
    "onboarding.slide3.title": "Live Support 💬",
    "onboarding.slide3.desc":
      "Connect with our support team instantly to solve any academic issues.",
    "onboarding.slide4.title": "Track Your Progress 📊",
    "onboarding.slide4.desc": "See your stats, achievements, and activity in real-time.",
    "onboarding.slide5.title": "You're All Set! 🚀",
    "onboarding.slide5.desc": "Dive in and start exploring. We're here to help you succeed.",

    // Feature Tips
    "tips.subjects": "💡 Tap any subject card to see all available resources and materials.",
    "tips.chatbot":
      "💬 Use the live support chat in the bottom-right to get help from real humans whenever you need it.",
    "tips.homescreen": "📱 Add this site to your home screen for instant access like a native app.",
    "tips.notifications":
      "🔔 Enable notifications from your profile to stay updated on new content.",
    "tips.download": "⬇️ Download resources for offline studying — they're yours to keep!",
    "tips.darkmode": "🌙 Toggle dark mode from the theme switcher in your profile menu.",
    "tips.profile": "👤 Set your student code in your profile to personalize your experience.",
  },
  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.subjects": "المواد",
    "nav.community": "المجتمع",
    "nav.todo": "قائمة المهام",
    "nav.notifications": "الإشعارات",
    "nav.teamManagement": "إدارة الفريق",
    "nav.announcements": "الإعلانات",
    "nav.subjectManagement": "إدارة المواد",
    "nav.sources": "المصادر",
    "nav.owner": "المالك",
    "nav.admin": "لوحة التحكم",
    "nav.settings": "الإعدادات العامة",

    "nav.team": "الفريق",
    "nav.logout": "تسجيل الخروج",

    // Dashboard
    "dashboard.greeting": "مرحباً بك",
    "dashboard.subjects": "المواد الدراسية",
    "dashboard.noSubjects": "لا توجد مواد متاحة حالياً.",
    "dashboard.adminMode": "وضع المسؤول",
    "dashboard.bannerTitle": "معاهد العبور",
    "dashboard.bannerSubtitle": "خليك متابع دروسك ومتفوتش أي حاجة جديدة!",
    "dashboard.whosOnline": "المتواجدون الآن",
    "dashboard.onlineCount": "متصل",
    "dashboard.you": "أنت",
    "dashboard.analytics": "تحليلات التعلم",
    "dashboard.subjects_count": "المواد",
    "dashboard.actions_count": "النشاط",
    "dashboard.files_count": "الملفات",
    "dashboard.views_count": "المشاهدات",
    "dashboard.topFocus": "الأكثر تركيزاً",
    "dashboard.achievements": "الإنجازات",
    "dashboard.fileMaster": "بطل الملفات",
    "dashboard.fileMasterDesc": "تحميل أكثر من 10 ملفات",
    "dashboard.explorer": "مستكشف المواد",
    "dashboard.explorerDesc": "زيارة 5 مواد مختلفة",

    // Leaderboard
    "leaderboard.title": "لوحة الصدارة العالمية",
    "leaderboard.subtitle": "تنافس، تعلّم، واصعد إلى دوري الألماس!",
    "leaderboard.rank": "الترتيب",
    "leaderboard.student": "الطالب",
    "leaderboard.league": "الدوري",
    "leaderboard.points": "النقاط",
    "leaderboard.pts": "نقطة",
    "leaderboard.empty": "لا يوجد مستخدمون حالياً. كن أول من يجمع النقاط!",
    "leaderboard.you": "أنت",
    "leaderboard.league.Diamond": "الألماس",
    "leaderboard.league.Gold": "الذهبي",
    "leaderboard.league.Silver": "الفضي",
    "leaderboard.league.Bronze": "البرونزي",

    // Login
    "login.title": "معاهد العبور",
    "login.subtitle": "بوابتك للتعلم الذكي والمستقبل المشرق",
    "login.continueGoogle": "تسجيل الدخول بـ Google",
    "login.secure": "آمن",
    "login.private": "خاص",
    "login.encrypted": "مشفر",
    "login.footer": "© 2026 منصة العبور التعليمية",
    "login.privacy": "سياسة الخصوصية",
    "login.terms": "شروط الخدمة",
    "login.cookies": "سياسة ملفات الارتباط",

    // Navbar
    "navbar.title": "منصة العبور",
    "navbar.subtitle": "نظام إدارة التعلم الذكي",

    // Profile
    "profile.settings": "الإعدادات",
    "profile.theme": "المظهر",
    "profile.language": "اللغة",
    "profile.darkMode": "الوضع الداكن",
    "profile.lightMode": "الوضع الفاتح",
    "profile.systemMode": "النظام",

    // Admin
    "admin.subjects": "إدارة المواد",
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
    "profile.fullName": "الاسم الكامل",
    "profile.studentCode": "كود الطالب",
    "profile.editInfo": "تحديث بياناتي",
    "profile.lockedHint": "بياناتك مؤمنة. يمكنك تعديلها في أي وقت.",
    "profile.codeLocked": "الكود مقفل. تواصل مع الدعم للتغيير.",
    "profile.nameLocked": "الاسم مقفل. تواصل مع الدعم للتغيير.",
    "profile.contactSupport": "تواصل مع الدعم",
    "profile.realName": "الاسم الحقيقي",
    "profile.saveAndLock": "حفظ وتثبيت",
    "profile.saving": "جاري الحفظ...",
    "profile.updateSuccess": "تم تحديث الملف الشخصي",
    "profile.updateError": "حدث خطأ",
    "profile.nameValidation": "الاسم يجب أن يحتوي على أحرف فقط",
    "profile.codeValidation": "كود الطالب يجب أن يكون 6 أرقام",
    "profile.enterCode": "أدخل كود الطالب",

    // Solid Mode
    "profile.solidMode": "وضع الأداء",
    "profile.solidModeDesc": "يقفل الأنيميشن والشفافية لتسريع الموقع",

    // Notification Settings
    "notifications.enable": "تفعيل الإشعارات",
    "notifications.enabled": "تم تفعيل الإشعارات",
    "notifications.disableInstruction": "يجب إيقاف الإشعارات من إعدادات المتصفح",

    // Admin Settings
    "settings.title": "إعدادات المالك",
    "settings.aiToggle": "تفعيل وضع الذكاء الاصطناعي",
    "settings.aiDescription": "تفعيل أو إيقاف ميزات الذكاء الاصطناعي العامة",
    "settings.chatbotToggle": "تفعيل روبوت الدردشة",
    "settings.chatbotDesc": "إظهار أو إخفاء زر روبوت الدردشة من جميع الصفحات",
    "settings.saveSuccess": "تم تحديث الإعدادات بنجاح",
    "settings.saveError": "فشل تحديث الإعدادات",

    // Welcome Page
    "welcome.hero.badge": "منصة التميز الأكاديمي",
    "welcome.hero.title": "بوابتك الذكية",
    "welcome.hero.titleHighlight": "للتعلم والتفوق",
    "welcome.hero.subtitle":
      "كل المحاضرات والمصادر والأدوات الذكية في مكان واحد لطلاب معاهد العبور.",
    "welcome.hero.cta": "ابدأ الآن",
    "welcome.hero.scroll": "اسحب للاستكشاف",
    "welcome.features.badge": "ليه معاهد العبور؟",
    "welcome.features.title": "كل اللي تحتاجه",
    "welcome.features.subtitle": "مميزات قوية مصممة عشان تسهّل رحلتك الأكاديمية.",
    "welcome.features.subjects": "مواد ذكية",
    "welcome.features.subjectsDesc": "تصفح كل المواد مع الملفات المنظمة والمحاضرات والملخصات.",
    "welcome.features.liveSupport": "دعم مباشر",
    "welcome.features.liveSupportDesc":
      "احصل على مساعدة فورية من فريق الدعم عبر الشات — بشر حقيقيين مش بوتات.",
    "welcome.features.analytics": "تتبع تقدمك",
    "welcome.features.analyticsDesc": "تابع نشاطك الأكاديمي وإنجازاتك بإحصائيات مبهرة.",
    "welcome.features.community": "مجتمع حي",
    "welcome.features.communityDesc": "شوف مين أونلاين وتواصل مع زملائك في الوقت الحقيقي.",
    "welcome.features.todo": "قائمة المهام",
    "welcome.features.todoDesc": "نظّم مهامك ومواعيد التسليم — مش هتنسى تاني.",
    "welcome.features.notifications": "إشعارات ذكية",
    "welcome.features.notificationsDesc": "استلم تنبيهات لحظية لما يتضاف مصادر أو إعلانات جديدة.",
    "welcome.features.darkMode": "وضع داكن وفاتح",
    "welcome.features.darkModeDesc": "مريح للعين. اتنقل بين الوضع الداكن والفاتح بضغطة واحدة.",
    "welcome.features.bilingual": "عربي وإنجليزي",
    "welcome.features.bilingualDesc": "دعم كامل RTL. اتنقل بين العربية والإنجليزية من حسابك.",
    "welcome.howItWorks.badge": "تجربة سلسة",
    "welcome.howItWorks.title": "كيف تعمل المنصة؟",
    "welcome.howItWorks.step1": "الدخول الآمن",
    "welcome.howItWorks.step1Desc": "سجل دخولك ببريدك الأكاديمي لتجربة آمنة ومخصصة.",
    "welcome.howItWorks.step2": "استكشاف المقررات",
    "welcome.howItWorks.step2Desc": "تصفح الموارد الدراسية المتوفرة لمقرراتك بسهولة تامة.",
    "welcome.howItWorks.step3": "تطوير التعلم",
    "welcome.howItWorks.step3Desc": "استخدم الأدوات الذكية وحمل الملفات لرفع مستواك الأكاديمي.",
    "welcome.stats.badge": "أرقام حقيقية",
    "welcome.stats.title": "بنكبر كل يوم",
    "welcome.stats.subtitle": "إحصائيات حقيقية من المنصة — مش أرقام وهمية.",
    "welcome.stats.students": "طالب",
    "welcome.stats.totalResources": "المصادر التعليمية",
    "welcome.stats.totalSubjects": "المواد الدراسية",
    "welcome.stats.uptime": "وقت التشغيل",
    "welcome.stats.online": "متصل الآن",
    "welcome.stats.activeStudents": "طلاب نشطون",

    "welcome.why.title": "ليه معاهد العبور؟",
    "welcome.why.subtitle": "اتعملت بإيد طلاب، عشان الطلاب. ده اللي بيميزنا.",
    "welcome.why.secure": "آمان 100%",
    "welcome.why.secureDesc": "نظام حماية Firebase مع تشفير كامل. بياناتك في أمان.",
    "welcome.why.fast": "سرعة البرق",
    "welcome.why.fastDesc": "محسّن للسرعة مع تحديثات لحظية.",
    "welcome.why.free": "مجاني بالكامل",
    "welcome.why.freeDesc": "مفيش رسوم مخفية. كل المميزات متاحة لكل الطلاب.",
    "welcome.cta.title": "مستعد تبدأ؟",
    "welcome.cta.subtitle": "انضم لزملائك وابدأ استكشف الآن.",

    // Onboarding
    "onboarding.skip": "تخطي",
    "onboarding.next": "التالي",
    "onboarding.done": "يلا نبدأ!",
    "onboarding.slide1.title": "أهلاً بك في معاهد العبور! 🎉",
    "onboarding.slide1.desc": "منصتك الشاملة لكل المصادر والأدوات الأكاديمية.",
    "onboarding.slide2.title": "تصفح المواد 📚",
    "onboarding.slide2.desc": "اضغط على أي مادة عشان تشوف المحاضرات والملفات.",
    "onboarding.slide3.title": "دعم مباشر 💬",
    "onboarding.slide3.desc": "تواصل مع فريق الدعم فوراً لحل أي مشاكل تواجهك.",
    "onboarding.slide4.title": "تابع تقدمك 📊",
    "onboarding.slide4.desc": "شوف إحصائياتك وإنجازاتك لحظة بلحظة.",
    "onboarding.slide5.title": "جاهز تبدأ! 🚀",
    "onboarding.slide5.desc": "ابدأ استكشف المنصة واحنا هنساعدك تنجح.",

    // Feature Tips
    "tips.subjects": "💡 اضغط على أي مادة عشان تشوف كل المصادر المتاحة.",
    "tips.chatbot": "💬 استخدم الدعم المباشر في أسفل اليمين عشان تكلمنا في أي وقت.",
    "tips.homescreen": "📱 ضيف الموقع للشاشة الرئيسية عشان توصله بسرعة.",
    "tips.notifications": "🔔 فعّل الإشعارات من البروفايل عشان تبقى متابع كل جديد.",
    "tips.download": "⬇️ حمّل الملفات عشان تذاكر أوفلاين في أي وقت!",
    "tips.darkmode": "🌙 فعّل الوضع الداكن من قائمة البروفايل.",
    "tips.profile": "👤 حط كود الطالب في بروفايلك عشان تجربة أفضل.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("obour-language") as Language;
    if (saved === "en" || saved === "ar") {
      setLanguageState(saved);
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = saved;
    }
    setMounted(true);
  }, []);

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

  // Prevent flash/mismatch by ensuring consistent initial render
  return (
    <LanguageContext.Provider value={value}>
      <div style={{ visibility: mounted ? "visible" : "hidden" }}>{children}</div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
