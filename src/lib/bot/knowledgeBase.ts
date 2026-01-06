import { QA } from "./types";

export const KNOWLEDGE_BASE: QA[] = [
  // --- GREETINGS & SOCIAL ---
  {
    questions: [
      "hello",
      "hi",
      "hey",
      "welcome",
      "مرحبا",
      "هلا",
      "السلام عليكم",
      "اهلين",
      "سلام",
      "هاي",
    ],
    answer: {
      ar: "وعليكم السلام! 👋 يا هلا بك في منصة العبور. أنا جاهز لأي استفسار.",
      en: "Hello there! 👋 Welcome to Obour Platform. I'm ready to help.",
    },
    suggestions: {
      ar: ["كيف أذاكر؟", "المواد", "مشكلة تقنية"],
      en: ["How to study?", "Subjects", "Technical error"],
    },
  },
  {
    questions: ["how are you", "keefak", "kefak", "اخبارك", "كيف حالك", "عامل ايه", "شلونك"],
    answer: {
      ar: "أنا مجرد بوت، بس أموري تمام طول ما أنا أساعدك! 😄",
      en: "I'm just a bot, but I'm doing great as long as I'm helping you! 😄",
    },
  },
  {
    questions: ["thank", "merci", "shukran", "thx", "شكرا", "تسلم", "يعطيك العافية", "مشكور"],
    answer: {
      ar: "العفو! واجبي. بالتوفيق يا بطل! 🚀",
      en: "You're welcome! Good luck, champion! 🚀",
    },
  },
  {
    questions: ["love you", "حبك", "احبك", "تحبني"],
    answer: {
      ar: "وأنا أحب مساعدة كل طلاب العبور! 💙",
      en: "And I love helping all Obour students! 💙",
    },
  },

  // --- IDENTITY ---
  {
    questions: ["who are you", "what is this", "bot", "من انت", "مين انت", "شنو هذا", "انت مين"],
    answer: {
      ar: "أنا المساعد الذكي لمنصة العبور 🤖. أعرف كل كبيرة وصغيرة في الموقع وأقدر أساعدك في المواد والدعم الفني.",
      en: "I am the Obour Platform Smart Assistant 🤖. I know the ins and outs of the site and can help you with subjects and support.",
    },
  },
  {
    questions: ["owner", "admin", "dev", "ahmed", "من صنع", "المطور", "المالك", "احمد", "مين سواك"],
    answer: {
      ar: "تم تطوير المنصة بجهود المبدعين في معاهد العبور، بقيادة فريق التطوير التقني المتميز.",
      en: "The platform was built by the innovators at Obour Institutes, led by our tech dev team.",
    },
  },

  // --- ACADEMIC & EXAMS ---
  {
    questions: [
      "exam",
      "test",
      "quiz",
      "midterm",
      "final",
      "اختبار",
      "امتحان",
      "كويز",
      "مدتيرم",
      "فاينل",
      "موعد الاختبار",
    ],
    answer: {
      ar: "الاختبارات والتجميعات السابقة موجودة داخل صفحة كل مادة في قسم 'المصادر' (Resources). لا تنسى تذاكر أول بأول! 📝",
      en: "Exams and past papers are inside each Subject page under 'Resources'. Don't forget to study regularly! 📝",
    },
  },
  {
    questions: ["gpa", "grade", "score", "grades", "معدل", "درجات", "درجة", "حساب المعدل", "تقدير"],
    answer: {
      ar: "المعدل التراكمي (GPA) مهم جداً. حاول دائماً تبقي درجاتك فوق الـ C لضمان التخرج بتقدير طيب. شد حيلك!",
      en: "Your GPA is crucial. Try to keep your grades above C to ensure a good graduating score. Keep it up!",
    },
  },
  {
    questions: ["fail", "f", "رسوب", "رسبت", "سقطت", "حامل مادة"],
    answer: {
      ar: "لا سمح الله! إذا رسبت في مادة، لازم تعيدها. راجع المرشد الأكاديمي لشرح الإجراءات بالتفصيل.",
      en: "God forbid! If you fail a subject, you must retake it. Check with your academic advisor for details.",
    },
  },
  {
    questions: ["absence", "attend", "attendance", "غيب", "غياب", "حضور", "حرمان"],
    answer: {
      ar: "انتبه من الغياب! تجاوز نسبة الغياب المسموحة (25%) قد يعرضك للحرمان من دخول الاختبار النهائي.",
      en: "Watch your attendance! Exceeding 25% absence might get you barred from the final exam.",
    },
  },

  // --- PLATFORM / TECHNICAL ---
  {
    questions: [
      "login",
      "sign in",
      "register",
      "signup",
      "تسجيل",
      "دخول",
      "حساب",
      "انشاء حساب",
      "باسورد",
      "password",
    ],
    answer: {
      ar: "التسجيل متاح عبر حساب Google (الجامعي أو الشخصي). اضغط على زر 'Login' في الأعلى.",
      en: "Login is available via Google (University or Personal). Click the 'Login' button above.",
    },
  },
  {
    questions: [
      "material",
      "subject",
      "course",
      "pdf",
      "file",
      "download",
      "مواد",
      "مادة",
      "مقرر",
      "ملخصات",
      "تحميل",
      "بي دي اف",
    ],
    answer: {
      ar: "كل المواد الدراسية موجودة في صفحة 'Subjects'. اختر المادة وتصفح الملفات والمحاضرات.",
      en: "All subjects are in the 'Subjects' page. Select a subject to browse files and lectures.",
    },
  },
  {
    questions: [
      "problem",
      "bug",
      "error",
      "issue",
      "crash",
      "not working",
      "مشكلة",
      "خطأ",
      "عطل",
      "ما يفتح",
      "خربان",
    ],
    answer: {
      ar: "واجهت مشكلة؟ بسيط. يمكنك التحدث مع الدعم المباشر الآن لحلها. هل أحولك؟",
      en: "Facing an issue? No worries. You can talk to Live Support now. Shall I switch you?",
    },
    suggestions: {
      ar: ["تحويل للدعم المباشر"],
      en: ["Switch to Live Support"],
    },
  },
  {
    questions: ["dark mode", "theme", "light mode", "color", "لون", "ثيم", "داكن", "فاتي", "ليلي"],
    answer: {
      ar: "تقدر تغير الثيم (ليلي/نهاري) من القائمة الجانبية أو من إعدادات البروفايل.",
      en: "You can toggle the theme (Dark/Light) from the sidebar or profile settings.",
    },
  },
  {
    questions: [
      "profile",
      "name",
      "picture",
      "photo",
      "avatar",
      "بروفايل",
      "اسم",
      "صورة",
      "تغيير الصورة",
    ],
    answer: {
      ar: "لتغيير صورتك أو اسمك، اضغط على أيقونة المستخدم في الزاوية وادخل على 'Profile'.",
      en: "To change your photo or name, click the user icon in the corner and go to 'Profile'.",
    },
  },

  // --- MISC / FUN ---
  {
    questions: ["joke", "funny", "نكتة", "ضحكني", "مزحة"],
    answer: {
      ar: "مره واحد طالب هندسة دخل الامتحان أخذ معاه ملعقة.. ليش؟ عشان يقلب المعلومات! 😂",
      en: "Why did the developer go broke? Because he used up all his cache! 😂",
    },
  },
  {
    questions: ["news", "update", "new", "اخبار", "جديد", "تحديث"],
    answer: {
      ar: "تابع قسم الإشعارات (الجرس) لمعرفة آخر الأخبار والمواد المضافة حديثاً.",
      en: "Check the Notifications (Bell icon) for the latest news and added materials.",
    },
  },
  // --- NEW ADDITIONS ---
  {
    questions: ["schedule", "timetable", "class", "جدول", "جدول المحاضرات", "مواعيد", "حصص"],
    answer: {
      ar: "للاطلاع على جدول المحاضرات، تواصل مع شؤون الطلاب أو راجع لوحة الإعلانات في المعهد.",
      en: "For the class schedule, contact Student Affairs or check the bulletin board at the institute.",
    },
  },
  {
    questions: ["payment", "fees", "tuition", "money", "مصاريف", "رسوم", "دفع", "فلوس"],
    answer: {
      ar: "للاستفسار عن الرسوم الدراسية أو طرق الدفع، يرجى التواصل مع قسم الشؤون المالية مباشرة.",
      en: "For tuition fees or payment methods, please contact the Financial Affairs department directly.",
    },
  },
  {
    questions: ["certificate", "transcript", "document", "شهادة", "افادة", "بيان درجات", "وثيقة"],
    answer: {
      ar: "للحصول على الشهادات أو بيان الدرجات، قدم طلب في شؤون الطلاب وانتظر المعالجة (عادة 3-5 أيام عمل).",
      en: "For certificates or transcripts, submit a request to Student Affairs and wait for processing (usually 3-5 business days).",
    },
  },
  {
    questions: ["library", "book", "borrow", "مكتبة", "كتب", "استعارة"],
    answer: {
      ar: "المكتبة متاحة لجميع الطلاب. يمكنك استعارة الكتب بالبطاقة الجامعية لمدة أسبوعين.",
      en: "The library is open to all students. You can borrow books with your student ID for two weeks.",
    },
  },
  {
    questions: ["contact", "email", "phone", "call", "تواصل", "ايميل", "رقم", "اتصال"],
    answer: {
      ar: "للتواصل مع الإدارة: راسلنا عبر الموقع أو اتصل بالرقم الموحد للمعهد.",
      en: "To contact administration: message us through the site or call the institute's unified number.",
    },
  },
  {
    questions: ["internship", "training", "work", "تدريب", "شغل", "وظيفة", "تيرم"],
    answer: {
      ar: "برنامج التدريب الصيفي متاح لطلاب السنوات النهائية. تابع الإعلانات أو راجع مكتب شؤون الطلاب.",
      en: "Summer internship programs are available for final-year students. Follow announcements or visit Student Affairs.",
    },
  },
  {
    questions: ["wifi", "internet", "network", "واي فاي", "نت", "انترنت"],
    answer: {
      ar: "شبكة الـ WiFi متاحة داخل الحرم. اسأل الـ IT عن بيانات الاتصال إذا واجهتك مشكلة.",
      en: "WiFi is available on campus. Ask IT for credentials if you have trouble connecting.",
    },
  },
  {
    questions: ["study tips", "how to study", "advice", "نصائح", "ازاي اذاكر", "طريقة المذاكرة"],
    answer: {
      ar: "نصيحة ذهبية: ذاكر يومياً ولو ساعة واحدة بتركيز. استخدم تقنية Pomodoro (25 دقيقة مذاكرة + 5 راحة). بالتوفيق! 📚",
      en: "Golden tip: Study at least one focused hour daily. Try the Pomodoro technique (25 min study + 5 min break). Good luck! 📚",
    },
  },
  {
    questions: ["deadline", "due date", "submission", "ديدلاين", "موعد التسليم", "تسليم"],
    answer: {
      ar: "تأكد من مواعيد التسليم من صفحة المادة أو من الدكتور مباشرة. التأخير قد يؤثر على درجاتك!",
      en: "Check deadlines on the subject page or directly from the instructor. Late submissions may affect your grades!",
    },
  },
  {
    questions: ["team", "about us", "developers", "فريق", "من نحن", "المطورين"],
    answer: {
      ar: "تم بناء هذه المنصة بحب ❤️ من فريق مبدعي العبور. شكراً لدعمكم!",
      en: "This platform was built with love ❤️ by the Obour Innovators team. Thanks for your support!",
    },
  },
  // --- NEW ENTRIES FOR BETTER COVERAGE ---
  {
    questions: ["help", "مساعدة", "ساعدني", "need help", "can you help"],
    answer: {
      ar: "بالطبع! أنا هنا للمساعدة. اسألني عن المواد، الامتحانات، أو أي شيء يخص المنصة! 💪",
      en: "Of course! I'm here to help. Ask me about subjects, exams, or anything about the platform! 💪",
    },
    suggestions: {
      ar: ["المواد الدراسية", "الامتحانات", "الدعم الفني"],
      en: ["Subjects", "Exams", "Technical Support"],
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
      ar: "لتغيير لغة الموقع، اضغط على أيقونة اللغة في الشريط العلوي. يمكنك التبديل بين العربية والإنجليزية.",
      en: "To change the site language, click the language icon in the top bar. You can switch between Arabic and English.",
    },
  },
  {
    questions: ["app", "mobile", "تطبيق", "موبايل", "جوال", "download app", "تحميل التطبيق"],
    answer: {
      ar: "المنصة تعمل من أي متصفح على الموبايل أو الكمبيوتر. يمكنك إضافتها للشاشة الرئيسية للوصول السريع!",
      en: "The platform works from any browser on mobile or desktop. You can add it to your home screen for quick access!",
    },
  },
  {
    questions: ["notification", "notifications", "اشعار", "اشعارات", "تنبيه", "تنبيهات"],
    answer: {
      ar: "لتفعيل الإشعارات، اضغط على أيقونة الجرس في الشريط العلوي وفعّل الإشعارات من المتصفح.",
      en: "To enable notifications, click the bell icon in the top bar and enable notifications from your browser.",
    },
  },
  {
    questions: ["logout", "sign out", "خروج", "تسجيل خروج"],
    answer: {
      ar: "لتسجيل الخروج، اضغط على صورتك في الزاوية واختر 'تسجيل خروج' من القائمة.",
      en: "To logout, click your profile picture in the corner and select 'Logout' from the menu.",
    },
  },
  {
    questions: ["student code", "كود الطالب", "رقم الطالب", "student id"],
    answer: {
      ar: "كود الطالب هو رقمك المكون من 6 أرقام. يمكنك إدخاله من خلال إعدادات الملف الشخصي.",
      en: "Your student code is your 6-digit number. You can enter it through the profile settings.",
    },
  },
  {
    questions: ["safe", "secure", "privacy", "آمن", "خصوصية", "أمان"],
    answer: {
      ar: "خصوصيتك مهمة! جميع بياناتك محمية ونستخدم نظام Google للتسجيل الآمن. 🔒",
      en: "Your privacy matters! All your data is protected and we use Google for secure authentication. 🔒",
    },
  },
];
