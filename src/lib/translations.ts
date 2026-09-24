export type Language = "en" | "ar";

export const translations: Record<Language, Record<string, string>> = {
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
    "login.refund": "Refund Policy",

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
      "Get prompt assistance from our dedicated academic support team through the integrated chat.",
    "welcome.features.analytics": "Progress Tracking",
    "welcome.features.analyticsDesc":
      "Track your learning activity, downloads, and achievements with comprehensive analytics.",
    "welcome.features.community": "Live Community",
    "welcome.features.communityDesc":
      "See active members, collaborate with classmates, and stay connected in real-time.",
    "welcome.features.todo": "To-Do List",
    "welcome.features.todoDesc":
      "Organize your coursework, deadlines, and assignments without missing a deadline.",
    "welcome.features.notifications": "Smart Notifications",
    "welcome.features.notificationsDesc":
      "Get real-time alerts when new course resources or official announcements are published.",
    "welcome.features.darkMode": "Dark & Light Mode",
    "welcome.features.darkModeDesc":
      "Designed for eye comfort. Switch between dark and light themes with a single click.",
    "welcome.features.bilingual": "English & Arabic",
    "welcome.features.bilingualDesc":
      "Full RTL support. Seamlessly toggle between English and Arabic from your account.",
    "welcome.howItWorks.badge": "Seamless Experience",
    "welcome.howItWorks.title": "How It Works",
    "welcome.howItWorks.step1": "Authenticate",
    "welcome.howItWorks.step1Desc": "Securely sign in using your official institute email.",
    "welcome.howItWorks.step2": "Access Hub",
    "welcome.howItWorks.step2Desc": "Instantly navigate through categorized academic resources.",
    "welcome.howItWorks.step3": "Enhance Learning",
    "welcome.howItWorks.step3Desc":
      "Utilize academic tools and download materials for offline study.",
    "welcome.stats.badge": "Live Numbers",
    "welcome.stats.title": "Growing Every Day",
    "welcome.stats.subtitle": "Real-time statistics from our academic platform.",
    "welcome.stats.students": "Students",
    "welcome.stats.totalResources": "Resources",
    "welcome.stats.totalSubjects": "Subjects",
    "welcome.stats.uptime": "Uptime",
    "welcome.stats.online": "Online Now",
    "welcome.stats.activeStudents": "Active Students",

    "welcome.why.title": "Why Obour Hub?",
    "welcome.why.subtitle": "Built specifically for students of Obour Higher Institutes.",
    "welcome.why.secure": "Verified & Secure",
    "welcome.why.secureDesc":
      "Firebase-powered authentication with encrypted transport. Your academic records remain protected.",
    "welcome.why.fast": "Optimized Real-time Performance",
    "welcome.why.fastDesc":
      "Engineered for speed with instant page rendering and live synchronization.",
    "welcome.why.free": "Free Core Access",
    "welcome.why.freeDesc":
      "Full access to browse curriculum, download lectures, and view study materials is free for all students.",
    "welcome.cta.title": "Ready to Start?",
    "welcome.cta.subtitle": "Join your classmates and start exploring now.",

    // Onboarding
    "onboarding.skip": "Skip",
    "onboarding.next": "Next",
    "onboarding.done": "Get Started",
    "onboarding.slide1.title": "Welcome to Obour Hub",
    "onboarding.slide1.desc":
      "Your unified portal for all official course resources and academic tools.",
    "onboarding.slide2.title": "Browse Your Subjects",
    "onboarding.slide2.desc":
      "Select any subject to view lectures, notes, and downloadable course materials.",
    "onboarding.slide3.title": "Live Support",
    "onboarding.slide3.desc":
      "Connect with our support team to resolve questions or platform issues quickly.",
    "onboarding.slide4.title": "Track Your Progress",
    "onboarding.slide4.desc": "Monitor your stats, achievements, and activity in real-time.",
    "onboarding.slide5.title": "You're All Set",
    "onboarding.slide5.desc": "Start exploring the platform to support your academic success.",

    // Feature Tips
    "tips.subjects": "Tap any subject card to see all available resources and materials.",
    "tips.chatbot":
      "Use the support chat at the bottom to connect with the team whenever you need help.",
    "tips.homescreen": "Add this web app to your home screen for fast native-like access.",
    "tips.notifications":
      "Enable notifications in your profile settings to receive critical updates.",
    "tips.download": "Download resources for offline studying whenever you need them.",
    "tips.darkmode": "Toggle dark mode from the theme switcher in your profile menu.",
    "tips.profile": "Set your student code in your profile for a personalized experience.",
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
    "login.refund": "سياسة الاسترجاع",

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
      "احصل على مساعدة فورية من فريق الدعم الأكاديمي عبر الشات المباشر على مدار اليوم.",
    "welcome.features.analytics": "تتبع تقدمك",
    "welcome.features.analyticsDesc": "تابع نشاطك الأكاديمي وإنجازاتك بإحصائيات شاملة ومفصلة.",
    "welcome.features.community": "مجتمع حي",
    "welcome.features.communityDesc": "تعرف على الأعضاء النشطين وتواصل مع زملائك في الوقت الحقيقي.",
    "welcome.features.todo": "قائمة المهام",
    "welcome.features.todoDesc": "نظّم مهامك ومواعيد التسليم لتفادي أي تأخير في دراستك.",
    "welcome.features.notifications": "إشعارات ذكية",
    "welcome.features.notificationsDesc":
      "استلم تنبيهات لحظية فور إضافة مصادر أو إعلانات دراسية جديدة.",
    "welcome.features.darkMode": "وضع داكن وفاتح",
    "welcome.features.darkModeDesc": "مريح للعين. تنقل بين الوضع الداكن والفاتح بضغطة واحدة.",
    "welcome.features.bilingual": "عربي وإنجليزي",
    "welcome.features.bilingualDesc":
      "دعم كامل لاتجاه النص RTL مع إمكانية التبديل بين اللغتين من حسابك.",
    "welcome.howItWorks.badge": "تجربة سلسة",
    "welcome.howItWorks.title": "كيف تعمل المنصة؟",
    "welcome.howItWorks.step1": "الدخول الآمن",
    "welcome.howItWorks.step1Desc": "سجل دخولك ببريدك المعتمد لتجربة آمنة ومخصصة.",
    "welcome.howItWorks.step2": "استكشاف المقررات",
    "welcome.howItWorks.step2Desc": "تصفح الموارد الدراسية المتوفرة لمقرراتك بسهولة تامة.",
    "welcome.howItWorks.step3": "تطوير التعلم",
    "welcome.howItWorks.step3Desc": "استخدم الأدوات الأكاديمية وحمّل الملفات لرفع مستواك الدراسي.",
    "welcome.stats.badge": "أرقام حقيقية",
    "welcome.stats.title": "تطور مستمر",
    "welcome.stats.subtitle": "إحصائيات لحظية من المنصة الأكاديمية.",
    "welcome.stats.students": "طالب",
    "welcome.stats.totalResources": "المصادر التعليمية",
    "welcome.stats.totalSubjects": "المواد الدراسية",
    "welcome.stats.uptime": "وقت التشغيل",
    "welcome.stats.online": "متصل الآن",
    "welcome.stats.activeStudents": "طلاب نشطون",

    "welcome.why.title": "لماذا معاهد العبور؟",
    "welcome.why.subtitle": "منصة مخصصة لطلاب معاهد العبور العليا لدعم مسيرتهم التعليمية.",
    "welcome.why.secure": "بوابة معتمدة وآمنة",
    "welcome.why.secureDesc": "نظام حماية وتوثيق متكامل لتأمين بياناتك وسجلاتك الأكاديمية.",
    "welcome.why.fast": "أداء فائق واستجابة لحظية",
    "welcome.why.fastDesc": "محسّنة للسرعة الفائقة مع تحديثات ومزامنة مباشرة.",
    "welcome.why.free": "وصول أساسي مجاني",
    "welcome.why.freeDesc": "تصفح المناهج وتنزيل المحاضرات والمصادر متاح لجميع طلاب المعهد مجاناً.",
    "welcome.cta.title": "مستعد تبدأ؟",
    "welcome.cta.subtitle": "انضم لزملائك وابدأ استكشف الآن.",

    // Onboarding
    "onboarding.skip": "تخطي",
    "onboarding.next": "التالي",
    "onboarding.done": "ابدأ الآن",
    "onboarding.slide1.title": "أهلاً بك في معاهد العبور",
    "onboarding.slide1.desc": "منصتك الشاملة لكافة المصادر والأدوات الأكاديمية المعتمدة.",
    "onboarding.slide2.title": "تصفح المقررات الدراسية",
    "onboarding.slide2.desc": "اضغط على أي مادة للاطلاع على المحاضرات والملخصات والملفات المرفقة.",
    "onboarding.slide3.title": "دعم أكاديمي مباشر",
    "onboarding.slide3.desc": "تواصل مع فريق الدعم لحل أي استفسارات أو عقبات تواجهك.",
    "onboarding.slide4.title": "متابعة تقدمك الأكاديمي",
    "onboarding.slide4.desc": "تابع إحصائياتك وإنجازاتك الأكاديمية لحظة بلحظة.",
    "onboarding.slide5.title": "أنت جاهز للبدء",
    "onboarding.slide5.desc": "ابدأ استكشاف المنصة والاستفادة من مواردها لتحقيق التفوق.",

    // Feature Tips
    "tips.subjects": "اضغط على أي مادة لاستعراض كافة المصادر والمحاضرات المتاحة.",
    "tips.chatbot": "استخدم نافذة المساعد الأكاديمي للتواصل والحصول على المساعدة في أي وقت.",
    "tips.homescreen": "أضف المنصة إلى الشاشة الرئيسية لهاتفك للوصول السريع.",
    "tips.notifications": "فعّل الإشعارات من الملف الشخصي لمتابعة الإعلانات الجديدة أولاً بأول.",
    "tips.download": "حمّل المواد والمحاضرات للمذاكرة دون اتصال بالإنترنت في أي وقت.",
    "tips.darkmode": "يمكنك التبديل بين الوضع الداكن والفاتح من قائمة الملف الشخصي.",
    "tips.profile": "أدخل كود الطالب في ملفك الشخصي لتخصيص تجربتك الأكاديمية.",
  },
};
