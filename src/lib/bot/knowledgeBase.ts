import { QA } from "./types";

export const KNOWLEDGE_BASE: QA[] = [
  // ==================== GREETINGS & SOCIAL ====================
  {
    questions: [
      "hello",
      "hi",
      "hey",
      "welcome",
      "good morning",
      "good evening",
      "good afternoon",
      "مرحبا",
      "هلا",
      "السلام عليكم",
      "اهلين",
      "سلام",
      "هاي",
      "صباح الخير",
      "مساء الخير",
      "اهلا",
      "اهلا وسهلا",
    ],
    answer: {
      ar: "وعليكم السلام! 👋 أهلاً بك في منصة العبور. أنا مساعدك الذكي، جاهز لأي سؤال عن المنصة أو الدراسة.",
      en: "Hello there! 👋 Welcome to Obour Platform. I'm your smart assistant, ready to help with anything about the platform or your studies.",
    },
    suggestions: {
      ar: ["كيف أذاكر؟", "المواد الدراسية", "مشكلة تقنية", "تواصل مع الدعم"],
      en: ["How to study?", "Subjects", "Technical issue", "Contact support"],
    },
  },
  {
    questions: [
      "how are you",
      "keefak",
      "kefak",
      "اخبارك",
      "كيف حالك",
      "عامل ايه",
      "شلونك",
      "ازيك",
      "كيفك",
    ],
    answer: {
      ar: "أنا مجرد بوت، بس أموري تمام طول ما أنا أساعدك! 😄 كيف أقدر أفيدك؟",
      en: "I'm just a bot, but I'm doing great as long as I'm helping you! 😄 How can I assist?",
    },
  },
  {
    questions: [
      "thank",
      "merci",
      "shukran",
      "thx",
      "thanks",
      "شكرا",
      "تسلم",
      "يعطيك العافية",
      "مشكور",
      "شكراً جزيلاً",
    ],
    answer: {
      ar: "العفو! واجبي أساعدك. بالتوفيق يا بطل! 🚀",
      en: "You're welcome! My pleasure to help. Good luck, champion! 🚀",
    },
  },
  {
    questions: ["bye", "goodbye", "see you", "later", "مع السلامة", "باي", "وداعاً", "الى اللقاء"],
    answer: {
      ar: "مع السلامة! 👋 موفق في دراستك. ارجع لي وقت ما تحتاج مساعدة!",
      en: "Goodbye! 👋 Good luck with your studies. Come back whenever you need help!",
    },
  },

  // ==================== IDENTITY & PLATFORM INFO ====================
  {
    questions: [
      "who are you",
      "what is this",
      "bot",
      "what can you do",
      "what do you do",
      "من انت",
      "مين انت",
      "شنو هذا",
      "انت مين",
      "ايش تقدر تسوي",
      "ايش تعمل",
      "شو هاد",
    ],
    answer: {
      ar: "أنا مساعد العبور الذكي 🤖 - بوت مصمم خصيصاً لمساعدتك في:\n• التنقل في المنصة\n• الإجابة على أسئلتك عن المواد\n• حل المشاكل التقنية\n• توجيهك للدعم المباشر",
      en: "I'm Obour Bot 🤖 - your smart assistant designed to help you:\n• Navigate the platform\n• Answer questions about subjects\n• Solve technical issues\n• Connect you with live support",
    },
    suggestions: {
      ar: ["أين المواد؟", "كيف أسجل؟", "مشكلة تقنية"],
      en: ["Where are subjects?", "How to register?", "Technical issue"],
    },
  },
  {
    questions: [
      "owner",
      "admin",
      "dev",
      "developer",
      "ahmed",
      "who made",
      "who built",
      "who created",
      "من صنع",
      "المطور",
      "المالك",
      "احمد",
      "مين سواك",
      "مين برمجك",
      "من بناك",
    ],
    answer: {
      ar: "تم تطوير المنصة بجهود فريق مبدعي العبور 💻 بقيادة السيد أحمد. فريق متميز يعمل باستمرار على تحسين تجربتك!",
      en: "The platform was built by the Obour Innovators team 💻, led by Mr. Ahmed. A dedicated team continuously working to improve your experience!",
    },
  },
  {
    questions: [
      "about",
      "about us",
      "about platform",
      "what is obour",
      "obour",
      "عن المنصة",
      "ماهي المنصة",
      "العبور",
      "معاهد العبور",
      "ايش هي العبور",
    ],
    answer: {
      ar: "منصة العبور الأكاديمية هي بوابتك الرقمية للتعلم! 🎓 تجد فيها:\n• جميع المواد الدراسية والمحاضرات\n• الملخصات والتجميعات\n• الإشعارات والتحديثات\n• التواصل مع الدعم",
      en: "Obour Academic Hub is your digital learning gateway! 🎓 Here you'll find:\n• All subjects and lectures\n• Summaries and past papers\n• Notifications and updates\n• Support communication",
    },
  },

  // ==================== ACADEMIC & EXAMS ====================
  {
    questions: [
      "exam",
      "test",
      "quiz",
      "midterm",
      "final",
      "examination",
      "اختبار",
      "امتحان",
      "كويز",
      "مدتيرم",
      "فاينل",
      "موعد الاختبار",
      "امتحانات",
    ],
    answer: {
      ar: "📝 الاختبارات والتجميعات موجودة داخل كل مادة في قسم 'المصادر'. نصائح للاستعداد:\n• ذاكر يومياً\n• راجع التجميعات القديمة\n• لا تتأخر عن مواعيد التسليم",
      en: "📝 Exams and past papers are inside each Subject under 'Resources'. Tips:\n• Study daily\n• Review past papers\n• Don't miss deadlines",
    },
    suggestions: {
      ar: ["أين المواد؟", "نصائح للمذاكرة"],
      en: ["Where are subjects?", "Study tips"],
    },
  },
  {
    questions: [
      "gpa",
      "grade",
      "score",
      "grades",
      "معدل",
      "درجات",
      "درجة",
      "حساب المعدل",
      "تقدير",
      "معدلي",
    ],
    answer: {
      ar: "📊 المعدل التراكمي (GPA) مقياس أدائك الأكاديمي. نصائح:\n• حافظ على درجاتك فوق C\n• احضر جميع المحاضرات\n• سلّم الواجبات في وقتها",
      en: "📊 Your GPA measures academic performance. Tips:\n• Keep grades above C\n• Attend all lectures\n• Submit assignments on time",
    },
  },
  {
    questions: ["fail", "f", "رسوب", "رسبت", "سقطت", "حامل مادة", "فشلت"],
    answer: {
      ar: "لا تقلق! 💪 إذا رسبت في مادة، يمكنك إعادتها. تواصل مع مرشدك الأكاديمي لمعرفة التفاصيل والخطوات.",
      en: "Don't worry! 💪 If you fail a course, you can retake it. Contact your academic advisor for details.",
    },
  },
  {
    questions: ["absence", "attend", "attendance", "غيب", "غياب", "حضور", "حرمان", "محروم"],
    answer: {
      ar: "⚠️ انتبه للغياب! تجاوز 25% قد يحرمك من الاختبار النهائي. حافظ على حضورك واطلع على سجل غيابك من شؤون الطلاب.",
      en: "⚠️ Watch your attendance! Exceeding 25% absence might bar you from finals. Keep track through Student Affairs.",
    },
  },
  {
    questions: [
      "schedule",
      "timetable",
      "class",
      "جدول",
      "جدول المحاضرات",
      "مواعيد",
      "حصص",
      "جدولي",
    ],
    answer: {
      ar: "📅 للاطلاع على جدول المحاضرات، راجع شؤون الطلاب أو لوحة الإعلانات في المعهد.",
      en: "📅 For your class schedule, check Student Affairs or the bulletin board at the institute.",
    },
  },
  {
    questions: [
      "deadline",
      "due date",
      "submission",
      "ديدلاين",
      "موعد التسليم",
      "تسليم",
      "الموعد النهائي",
    ],
    answer: {
      ar: "⏰ تأكد من مواعيد التسليم من صفحة المادة أو من الدكتور. التأخير يؤثر على درجاتك!",
      en: "⏰ Check deadlines on the subject page or from your instructor. Late submissions affect your grades!",
    },
  },

  // ==================== PLATFORM FEATURES ====================
  {
    questions: [
      "login",
      "sign in",
      "register",
      "signup",
      "account",
      "create account",
      "تسجيل",
      "دخول",
      "حساب",
      "انشاء حساب",
      "سجل",
      "تسجيل دخول",
    ],
    answer: {
      ar: "🔐 التسجيل سهل جداً:\n1. اضغط على 'Sign in with Google'\n2. استخدم حسابك الجامعي أو الشخصي\n3. ابدأ استخدام المنصة!",
      en: "🔐 Registration is super easy:\n1. Click 'Sign in with Google'\n2. Use your university or personal account\n3. Start using the platform!",
    },
  },
  {
    questions: ["logout", "sign out", "خروج", "تسجيل خروج"],
    answer: {
      ar: "لتسجيل الخروج: اضغط على صورتك في الزاوية ← اختر 'تسجيل خروج'. 👋",
      en: "To logout: Click your profile picture → Select 'Logout'. 👋",
    },
  },
  {
    questions: [
      "material",
      "subject",
      "course",
      "courses",
      "subjects",
      "where",
      "مواد",
      "مادة",
      "مقرر",
      "مقررات",
      "وين المواد",
      "فين المواد",
      "أين",
    ],
    answer: {
      ar: "📚 جميع المواد موجودة في الصفحة الرئيسية! اختر أي مادة لتصفح:\n• المحاضرات\n• الملخصات\n• التجميعات\n• الموارد الإضافية",
      en: "📚 All subjects are on the main page! Select any subject to browse:\n• Lectures\n• Summaries\n• Past papers\n• Additional resources",
    },
  },
  {
    questions: [
      "pdf",
      "file",
      "download",
      "lecture",
      "lectures",
      "ملفات",
      "ملخصات",
      "تحميل",
      "بي دي اف",
      "محاضرات",
      "محاضرة",
      "ملف",
    ],
    answer: {
      ar: "📥 لتحميل أي ملف:\n1. ادخل على المادة\n2. اختر الملف المطلوب\n3. اضغط على أيقونة التحميل أو اسم الملف",
      en: "📥 To download any file:\n1. Go to the subject\n2. Select the file\n3. Click the download icon or filename",
    },
  },
  {
    questions: [
      "profile",
      "name",
      "picture",
      "photo",
      "avatar",
      "صورة",
      "change photo",
      "بروفايل",
      "اسم",
      "تغيير الصورة",
      "صورتي",
      "اسمي",
      "ملفي الشخصي",
    ],
    answer: {
      ar: "👤 لتعديل ملفك الشخصي:\n• اضغط على صورتك في الزاوية\n• اختر 'Profile'\n• يمكنك تغيير اسمك ومعلوماتك",
      en: "👤 To edit your profile:\n• Click your picture in the corner\n• Select 'Profile'\n• You can change your name and info",
    },
  },
  {
    questions: ["student code", "كود الطالب", "رقم الطالب", "student id", "الكود", "رقمي"],
    answer: {
      ar: "🔢 كود الطالب هو رقمك المكون من 6 أرقام. أدخله من إعدادات الملف الشخصي لتفعيل جميع المميزات.",
      en: "🔢 Your student code is your 6-digit number. Enter it in profile settings to unlock all features.",
    },
  },
  {
    questions: [
      "dark mode",
      "theme",
      "light mode",
      "color",
      "لون",
      "ثيم",
      "داكن",
      "فاتح",
      "ليلي",
      "نهاري",
    ],
    answer: {
      ar: "🌙 تغيير الثيم:\n• من القائمة الجانبية\n• أو من إعدادات الحساب\n• يمكنك التبديل بين الوضع الليلي والنهاري",
      en: "🌙 Change theme:\n• From the sidebar\n• Or from account settings\n• Switch between dark and light mode",
    },
  },
  {
    questions: [
      "language",
      "لغة",
      "تغيير اللغة",
      "change language",
      "arabic",
      "english",
      "عربي",
      "انجليزي",
    ],
    answer: {
      ar: "🌐 لتغيير اللغة، اضغط على أيقونة اللغة في الشريط العلوي. يمكنك التبديل بين العربية والإنجليزية.",
      en: "🌐 To change language, click the language icon in the top bar. Switch between Arabic and English.",
    },
  },
  {
    questions: [
      "notification",
      "notifications",
      "bell",
      "اشعار",
      "اشعارات",
      "تنبيه",
      "تنبيهات",
      "الجرس",
    ],
    answer: {
      ar: "🔔 الإشعارات تخبرك بكل جديد! اضغط على الجرس في الأعلى لمعرفة:\n• المواد الجديدة\n• التحديثات المهمة\n• الرسائل",
      en: "🔔 Notifications keep you updated! Click the bell to see:\n• New materials\n• Important updates\n• Messages",
    },
  },
  {
    questions: ["app", "mobile", "تطبيق", "موبايل", "جوال", "download app", "تحميل التطبيق"],
    answer: {
      ar: "📱 المنصة تعمل من أي متصفح! للوصول السريع:\n• على الموبايل: أضف الصفحة للشاشة الرئيسية\n• تعمل مثل التطبيق تماماً!",
      en: "📱 The platform works from any browser! For quick access:\n• On mobile: Add page to home screen\n• Works just like an app!",
    },
  },

  // ==================== SUPPORT & ISSUES ====================
  {
    questions: [
      "problem",
      "bug",
      "error",
      "issue",
      "crash",
      "not working",
      "broken",
      "stuck",
      "مشكلة",
      "خطأ",
      "عطل",
      "ما يفتح",
      "خربان",
      "معلق",
      "لا يعمل",
    ],
    answer: {
      ar: "🔧 واجهت مشكلة؟ جرب:\n1. تحديث الصفحة (F5)\n2. مسح الكاش\n3. إذا استمرت، تحدث مع الدعم المباشر!",
      en: "🔧 Having issues? Try:\n1. Refresh the page (F5)\n2. Clear cache\n3. If it persists, talk to Live Support!",
    },
    suggestions: {
      ar: ["تحويل للدعم المباشر", "كيف أمسح الكاش؟"],
      en: ["Switch to Live Support", "How to clear cache?"],
    },
  },
  {
    questions: ["help", "مساعدة", "ساعدني", "need help", "can you help", "أحتاج مساعدة"],
    answer: {
      ar: "بالطبع! 💪 أنا هنا للمساعدة. اسألني عن:\n• المواد والمحاضرات\n• استخدام المنصة\n• المشاكل التقنية\nأو تحدث مع الدعم المباشر!",
      en: "Of course! 💪 I'm here to help. Ask me about:\n• Subjects and lectures\n• Using the platform\n• Technical issues\nOr talk to Live Support!",
    },
    suggestions: {
      ar: ["المواد", "مشكلة تقنية", "الدعم المباشر"],
      en: ["Subjects", "Technical issue", "Live Support"],
    },
  },
  {
    questions: [
      "live support",
      "human",
      "real person",
      "talk to admin",
      "support",
      "الدعم المباشر",
      "بشري",
      "تحدث لشخص",
      "ادمن",
      "دعم",
      "تحدث لبشري",
    ],
    answer: {
      ar: "👨‍💻 للتحدث مع الدعم المباشر:\n• اضغط زر 'LIVE CHAT' في الأعلى\n• اكتب مشكلتك وسيرد عليك أحد فريق الدعم",
      en: "👨‍💻 To talk to Live Support:\n• Click the 'LIVE CHAT' button above\n• Describe your issue and our team will respond",
    },
  },
  {
    questions: ["contact", "email", "phone", "call", "تواصل", "ايميل", "رقم", "اتصال"],
    answer: {
      ar: "📞 للتواصل معنا:\n• استخدم الدردشة المباشرة هنا\n• أو تواصل مع شؤون الطلاب في المعهد",
      en: "📞 To contact us:\n• Use this live chat\n• Or contact Student Affairs at the institute",
    },
  },

  // ==================== ADMINISTRATIVE ====================
  {
    questions: ["payment", "fees", "tuition", "money", "مصاريف", "رسوم", "دفع", "فلوس", "مصروفات"],
    answer: {
      ar: "💰 للاستفسار عن الرسوم الدراسية وطرق الدفع، تواصل مع قسم الشؤون المالية مباشرة.",
      en: "💰 For tuition fees and payment methods, contact the Financial Affairs department directly.",
    },
  },
  {
    questions: [
      "certificate",
      "transcript",
      "document",
      "شهادة",
      "افادة",
      "بيان درجات",
      "وثيقة",
      "اثبات",
    ],
    answer: {
      ar: "📄 للحصول على الشهادات:\n1. قدم طلب في شؤون الطلاب\n2. انتظر 3-5 أيام عمل\n3. استلم الوثيقة",
      en: "📄 For certificates:\n1. Submit request to Student Affairs\n2. Wait 3-5 business days\n3. Collect your document",
    },
  },
  {
    questions: ["library", "book", "borrow", "مكتبة", "كتب", "استعارة", "كتاب"],
    answer: {
      ar: "📚 المكتبة متاحة لجميع الطلاب! يمكنك استعارة الكتب ببطاقتك الجامعية لمدة أسبوعين.",
      en: "📚 The library is open to all students! Borrow books with your student ID for two weeks.",
    },
  },
  {
    questions: [
      "internship",
      "training",
      "work",
      "job",
      "تدريب",
      "شغل",
      "وظيفة",
      "تيرم",
      "فرصة عمل",
    ],
    answer: {
      ar: "💼 برامج التدريب متاحة لطلاب السنوات النهائية. تابع الإعلانات أو راجع شؤون الطلاب.",
      en: "💼 Internship programs are available for final-year students. Follow announcements or visit Student Affairs.",
    },
  },
  {
    questions: ["wifi", "internet", "network", "واي فاي", "نت", "انترنت", "شبكة"],
    answer: {
      ar: "📶 شبكة WiFi متاحة في الحرم الجامعي. للحصول على بيانات الاتصال، تواصل مع قسم IT.",
      en: "📶 WiFi is available on campus. For credentials, contact the IT department.",
    },
  },

  // ==================== STUDY TIPS ====================
  {
    questions: [
      "study tips",
      "how to study",
      "advice",
      "نصائح",
      "ازاي اذاكر",
      "طريقة المذاكرة",
      "كيف اذاكر",
    ],
    answer: {
      ar: "📖 نصائح ذهبية للمذاكرة:\n1. ذاكر يومياً ولو ساعة\n2. استخدم تقنية Pomodoro (25 دقيقة + 5 راحة)\n3. راجع التجميعات القديمة\n4. نم جيداً قبل الامتحان\n5. لا تؤجل!",
      en: "📖 Golden study tips:\n1. Study at least 1 hour daily\n2. Use Pomodoro (25 min + 5 break)\n3. Review past papers\n4. Sleep well before exams\n5. Don't procrastinate!",
    },
  },
  {
    questions: ["news", "update", "new", "what's new", "اخبار", "جديد", "تحديث", "ايش الجديد"],
    answer: {
      ar: "📰 تابع قسم الإشعارات (الجرس 🔔) لمعرفة آخر الأخبار والمواد المضافة!",
      en: "📰 Check Notifications (Bell 🔔) for the latest news and new materials!",
    },
  },

  // ==================== FUN & MISC ====================
  {
    questions: ["joke", "funny", "نكتة", "ضحكني", "مزحة"],
    answer: {
      ar: "😂 مرة واحد طالب هندسة دخل الامتحان أخذ معاه ملعقة.. ليش؟ عشان يقلب المعلومات!",
      en: "😂 Why did the developer go broke? Because he used up all his cache!",
    },
  },
  {
    questions: ["love you", "حبك", "احبك", "تحبني"],
    answer: {
      ar: "وأنا أحب مساعدة كل طلاب العبور! 💙 بالتوفيق!",
      en: "And I love helping all Obour students! 💙 Good luck!",
    },
  },
  {
    questions: ["team", "about us", "developers", "فريق", "من نحن", "المطورين"],
    answer: {
      ar: "تم بناء هذه المنصة بحب ❤️ من فريق مبدعي العبور. شكراً لدعمكم!",
      en: "This platform was built with love ❤️ by the Obour Innovators team. Thanks for your support!",
    },
  },
  {
    questions: ["safe", "secure", "privacy", "آمن", "خصوصية", "أمان", "هل البيانات آمنة"],
    answer: {
      ar: "🔒 خصوصيتك مهمة! جميع بياناتك محمية ونستخدم نظام Google للتسجيل الآمن.",
      en: "🔒 Your privacy matters! All data is protected and we use Google for secure auth.",
    },
  },
  {
    questions: ["report", "feedback", "suggest", "بلاغ", "اقتراح", "ملاحظة", "ابلاغ"],
    answer: {
      ar: "💡 لديك اقتراح أو ملاحظة؟ تحدث مع الدعم المباشر وسنأخذ رأيك بعين الاعتبار!",
      en: "💡 Have feedback or suggestions? Talk to Live Support and we'll consider your input!",
    },
  },

  // ==================== NAVIGATION ====================
  {
    questions: ["home", "main", "dashboard", "الرئيسية", "الصفحة الرئيسية", "الهوم"],
    answer: {
      ar: "🏠 الصفحة الرئيسية تعرض جميع المواد المتاحة بشكل منظم. اختر أي مادة للبدء!",
      en: "🏠 The home page displays all available subjects organized. Select any to start!",
    },
  },
  {
    questions: ["sidebar", "menu", "القائمة", "القائمة الجانبية", "المنيو"],
    answer: {
      ar: "📋 القائمة الجانبية تحتوي على:\n• الصفحة الرئيسية\n• الإشعارات\n• الفريق\n• إعدادات الحساب",
      en: "📋 The sidebar contains:\n• Home\n• Notifications\n• Team\n• Account settings",
    },
  },
  {
    questions: ["search", "find", "بحث", "ابحث", "اين اجد", "فين"],
    answer: {
      ar: "🔍 للبحث عن مادة أو ملف:\n• استخدم شريط البحث في الصفحة\n• اكتب اسم المادة أو الملف",
      en: "🔍 To search for a subject or file:\n• Use the search bar on the page\n• Type the subject or file name",
    },
  },
];
