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
      ar: [
        "وعليكم السلام! 👋 أهلاً بك في منصة العبور. أنا مساعدك الذكي، جاهز لأي سؤال!",
        "أهلاً بك يا بطل! 🚀 كيف يمكنني مساعدتك اليوم في رحلتك الدراسية؟",
        "مرحباً! 😊 أنا هنا لتسهيل تجربتك في المنصة. اسألني عن أي شيء!",
        "يا هلا والله! 🌟 نورت المنصة. آمرني، كيف أقدر أخدمك؟",
        "صباح/مساء النور! ✨ جاهز للإنجاز؟ أنا معك خطوة بخطوة.",
      ],
      en: [
        "Hello there! 👋 Welcome to Obour Platform. I'm your smart assistant, ready to help!",
        "Welcome, Champion! 🚀 How can I assist you with your studies today?",
        "Hi! 😊 I'm here to make your experience smoother. Ask me anything!",
        "Hey! 🌟 Great to see you. How can I be of service?",
        "Good day! ✨ Ready to achieve? I'm here to support you.",
      ],
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
      "علومك",
    ],
    answer: {
      ar: [
        "أنا مجرد بوت، بس أموري تمام طول ما أنا أساعدك! 😄 كيف أقدر أفيدك؟",
        "بخير دامك بخير! 🤖 جاهز للرد على استفساراتك.",
        "عال العال! 🚀 مستعد لمساعدتك في أي وقت.",
        "أنا برنامج، بس حاس بنشاط! 💪 إيش اللي شاغل بالك؟",
      ],
      en: [
        "I'm just a bot, but I'm doing great as long as I'm helping you! 😄 How can I assist?",
        "I'm doing well, thanks for asking! 🤖 Ready to answer your questions.",
        "Systems fully operational! 🚀 Ready to help you anytime.",
        "I'm software, but feeling energetic! 💪 What's on your mind?",
      ],
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
      "ربي يسعدك",
    ],
    answer: {
      ar: [
        "العفو! واجبي أساعدك. بالتوفيق يا بطل! 🚀",
        "على الرحب والسعة! 😊 أنا هنا دائماً لخدمتك.",
        "الله يعافيك! أتمنى لك التوفيق في دراستك. ✨",
        "لا شكر على واجب! شد حيلك 💪",
      ],
      en: [
        "You're welcome! My pleasure to help. Good luck, champion! 🚀",
        "Anytime! 😊 I'm always here to serve you.",
        "Glad calls help! Wishing you success in your studies. ✨",
        "No problem at all! Keep up the great work 💪",
      ],
    },
  },
  {
    questions: [
      "bye",
      "goodbye",
      "see you",
      "later",
      "مع السلامة",
      "باي",
      "وداعاً",
      "الى اللقاء",
      "نشوفك على خير",
    ],
    answer: {
      ar: [
        "مع السلامة! 👋 موفق في دراستك. ارجع لي وقت ما تحتاج مساعدة!",
        "في حفظ الله! 🌟 لا تتردد تكلمني في أي وقت.",
        "باي باي! 👋 ذاكر كويس وأشوفك قريب.",
        "إلى اللقاء! أتمنى لك يوماً سعيداً ومليئاً بالإنجازات. ✨",
      ],
      en: [
        "Goodbye! 👋 Good luck with your studies. Come back whenever you need help!",
        "Stay safe! 🌟 Don't hesitate to chat anytime.",
        "Bye bye! 👋 Study hard and see you soon.",
        "See you! Have a productive and wonderful day. ✨",
      ],
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
      "وظيفتك",
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
      "صاحب الموقع",
    ],
    answer: {
      ar: [
        "تم تطوير المنصة بجهود فريق مبدعي العبور 💻 بقيادة المهندس أحمد. فريق متميز يعمل بحب لتحسين تجربتكم! ❤️",
        "وراء هذا العمل فريق عظيم بقيادة المايسترو أحمد! 🚀 هدفنا نسهل عليكم الدراسة.",
        "المطور الرئيسي هو أحمد، مع فريق مبدعي العبور. 🌟 شغالين ليل نهار لخدمتكم!",
      ],
      en: [
        "The platform was built by the Obour Innovators team 💻, led by Engineer Ahmed. A dedicated team building with love! ❤️",
        "Behind this work is a great team led by Maestro Ahmed! 🚀 Our goal is to make studying easier for you.",
        "Lead developer is Ahmed, with the Obour Innovators team. 🌟 Working day and night to serve you!",
      ],
    },
  },

  // ==================== ACADEMIC & SUBJECTS ====================
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
      "المحاضرات",
    ],
    answer: {
      ar: "📚 جميع المواد الدراسية موجودة في الصفحة الرئيسية (Dashboard). اضغط على أي مادة لتجد:\n• المحاضرات المصورة\n• ملفات الـ PDF\n• قسم المناقشة\n• التجميعات",
      en: "📚 All subjects are on the main Dashboard. Click any subject to find:\n• Video Lectures\n• PDF Files\n• Discussion Section\n• Past Papers",
    },
  },
  {
    questions: ["cs", "computer science", "حاسب", "حاسبات", "علوم حاسب", "كمبيوتر"],
    answer: {
      ar: "💻 قسم علوم الحاسب هو المستقبل! المواد تشمل البرمجة، الخوارزميات، وقواعد البيانات. ركز على التطبيق العملي لأنه الأهم.",
      en: "💻 CS is the future! Courses cover programming, algorithms, and databases. Focus on practical application, it's key.",
    },
  },
  {
    questions: ["mis", "information systems", "نظم معلومات", "نظم", "ادارة"],
    answer: {
      ar: "📊 نظم المعلومات الإدارية (MIS) تجمع بين التكنولوجيا والإدارة. موادك تركز على الداتا، التحليل، وإدارة المشاريع.",
      en: "📊 MIS combines tech and management. Your subjects focus on data, analysis, and project management.",
    },
  },
  {
    questions: ["business", "biz", "ادارة اعمال", "بيزنس", "تجارة"],
    answer: {
      ar: "💼 إدارة الأعمال تتطلب فهم للسوق والقيادة. المواد تشمل المحاسبة، التسويق، والاقتصاد.",
      en: "💼 Business Admin requires market understanding and leadership. Subjects include Accounting, Marketing, and Economics.",
    },
  },

  // ==================== EXAMS & GRADES ====================
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
      ar: [
        "📝 الاختبارات تحدد من قبل الدكاترة، لكن التجميعات والأسئلة السابقة موجودة في صفحة كل مادة تحت 'المصادر'.",
        "استعد جيداً! 📚 راجع المحاضرات أول بأول، وحل التجميعات الموجودة في المنصة لضمان الـ A+ بإذن الله.",
      ],
      en: [
        "📝 Exams are set by professors, but past papers and quizzes are available in each Subject's 'Resources' section.",
        "Prepare well! 📚 Review lectures daily and solve past papers on the platform to secure that A+!",
      ],
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
      ar: "📊 المعدل التراكمي (GPA) مهم جداً. حاول تحافظ عليه فوق 3.0. نصيحتي: لا تضيع درجات الأعمال (الحضور والكويزات) لأنها مضمونة!",
      en: "📊 Your GPA is crucial. Try to keep it above 3.0. My advice: Don't lose coursework marks (attendance & quizzes) as they are guaranteed!",
    },
  },
  {
    questions: ["calc gpa", "calculate", "احسب معدلي", "كيف احسب المعدل"],
    answer: {
      ar: "🧮 لحساب المعدل: اضرب درجة كل مادة في عدد ساعاتها، اجمعهم، واقسم على مجموع الساعات الكلي. أو استخدم حاسبة المعدل الموجودة في إعدادات المنصة.",
      en: "🧮 To calc GPA: Multiply each grade by its credit hours, sum them up, and divide by total credit hours. Or use the GPA Calculator in platform settings.",
    },
  },

  // ==================== FEATURES & TOOLS ====================
  {
    questions: [
      "todo",
      "to-do",
      "task",
      "tasks",
      "list",
      "مهام",
      "قائمة مهام",
      "تودو",
      "واجباتي",
      "مذاكرتي",
    ],
    answer: {
      ar: "✅ قائمة المهام (To-Do List) ميزة قوية في المنصة! تقدر:\n• تضيف مهامك الدراسية\n• تحدد مواعيد نهائية\n• تربط المهمة بمادة معينة\n• وتتابع إنجازك يومياً.",
      en: "✅ The To-Do List is a powerful feature! You can:\n• Add study tasks\n• Set due dates\n• Link tasks to subjects\n• Track your daily progress.",
    },
    suggestions: {
      ar: ["افتح القائمة", "إضافة مهمة"],
      en: ["Open List", "Add Task"],
    },
  },
  {
    questions: ["analytics", "stats", "statistics", "احصائيات", "تحليل", "ادائي", "مستواي"],
    answer: {
      ar: "📈 صفحة الإحصائيات (Analytics) توريك:\n• عدد الساعات اللي ذاكرتها\n• تقدمك في المواد\n• عدد المهام المنجزة\nتساعدك تعرف نقاط قوتك وضعفك!",
      en: "📈 The Analytics page shows you:\n• Hours studied\n• Subject progress\n• Completed tasks\nHelping you identify strengths and weaknesses!",
    },
  },
  {
    questions: ["chat", "group", "discussion", "شات", "محادثة", "قروب", "مجموعة", "نقاش"],
    answer: {
      ar: "💬 كل مادة فيها 'شات عام' للمناقشة مع زملائك والدكتور. استغله لتبادل المعلومات وسؤال الأسئلة الصعبة.",
      en: "💬 Each subject has a 'General Chat' for discussing with peers and professors. Use it to exchange info and ask hard questions.",
    },
  },

  // ==================== TECH SUPPORT & ACCOUNT ====================
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
      ar: "🔐 التسجيل حصرياً بحساب Google (الجامعي أو الشخصي). الأمان عندنا أولوية 100%! 👍",
      en: "🔐 Registration is exclusively via Google (Uni or Personal). Security is our 100% priority! 👍",
    },
  },
  {
    questions: ["password", "forgot", "reset", "كلمة سر", "باسورد", "نسيت", "استعادة"],
    answer: {
      ar: "🔑 بما أننا نستخدم Google Sign-In، تغيير أو استعادة كلمة السر يتم من خلال إعدادات حسابك في Google وليس المنصة.",
      en: "🔑 Since we use Google Sign-In, password changes/recovery happen via your Google Account settings, not the platform.",
    },
  },
  {
    questions: ["slow", "lag", "بطيء", "لاق", "تعليق", "بيعلق", "ثقيل"],
    answer: {
      ar: "🐢 إذا الموقع بطيء، جرب:\n1. تأكد من سرعة النت\n2. امسح الكاش (Clear Cache)\n3. جرب متصفح تاني (Chrome هو الأفضل معنا).",
      en: "🐢 If site is slow, try:\n1. Check internet speed\n2. Clear Cache\n3. Try another browser (Chrome works best).",
    },
  },
  {
    questions: ["app", "install", "pwa", "تطبيق", "تحميل", "تثبيت"],
    answer: {
      ar: "📱 المنصة تدعم PWA! يعني تقدر تثبتها كتطبيق على موبايلك:\n• آيفون: اضغط Share ثم Add to Home Screen\n• أندرويد: اضغط الثلاث نقاط ثم Install App",
      en: "📱 We support PWA! Install as an app:\n• iPhone: Share -> Add to Home Screen\n• Android: Keep dots -> Install App",
    },
  },

  // ==================== FUN & EXTRAS ====================
  {
    questions: ["joke", "funny", "نكتة", "ضحكني", "مزحة", "فرفشني"],
    answer: {
      ar: [
        "😂 مرة واحد مبرمج حب يخطب، جاب لعروسه وردة Virtual!",
        "😂 طالب هندسة دخل الامتحان بالمسطرة، عشان يشوف الأسئلة من كل الزوايا!",
        "😂 مرة كمبيوتر راح للدكتور قاله: يا دكتور حاسس بسخونة.. قاله: أكيد عندك فيروس!",
        "😂 ليش الطالب دايماً بردان؟ لأنه محاط بـ 'درجات' منخفضة! (سامحني بايخة شوي 🌚)",
      ],
      en: [
        "😂 Why do programmers prefer dark mode? Because light attracts bugs!",
        "😂 Why did the student eat his homework? Because the teacher said it was a piece of cake!",
        "😂 How many programmers does it take to change a light bulb? None, that's a hardware problem.",
        "😂 Why was the math book sad? Because it had too many problems.",
      ],
    },
  },
  {
    questions: ["quote", "inspire", "motivation", "حكمة", "اقتباس", "تحفيز", "حفزني"],
    answer: {
      ar: [
        "✨ 'من جد وجد، ومن زرع حصد.' - استمر يا بطل!",
        "✨ 'العلم نور، والجهل ظلام.' - طريقك منير بإذن الله.",
        "✨ 'لا تؤجل عمل اليوم إلى الغد.' - ابدأ الآن!",
        "✨ 'النجاح هو مجموع مجهودات صغيرة تتكرر يوماً بعد يوم.'",
      ],
      en: [
        "✨ 'The only way to do great work is to love what you do.' - Steve Jobs",
        "✨ 'Believe you can and you're halfway there.'",
        "✨ 'Success is the sum of small efforts, repeated day in and day out.'",
        "✨ 'Education is the most powerful weapon which you can use to change the world.' - Nelson Mandela",
      ],
    },
  },
  {
    questions: ["love you", "حبك", "احبك", "تحبني"],
    answer: {
      ar: "وأنا أحب مساعدة كل طلاب العبور! 💙 أنتم فخر المنصة.",
      en: "And I love helping all Obour students! 💙 You are the pride of this platform.",
    },
  },
  {
    questions: ["team", "about us", "developers", "فريق", "من نحن", "المطورين"],
    answer: {
      ar: "تم بناء هذه المنصة بحب ❤️ من فريق مبدعي العبور. شكراً لدعمكم المتواصل!",
      en: "This platform was built with love ❤️ by the Obour Innovators team. Thanks for your continuous support!",
    },
  },
  {
    questions: ["secret", "easter egg", "سر", "مفاجأة"],
    answer: {
      ar: "🤫 السر الحقيقي للنجاح هو... المذاكرة أول بأول! (كنت متوقع كود سري صح؟ 😉)",
      en: "🤫 The real secret to success is... Studying consistently! (Expected a cheat code, didn't you? 😉)",
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
      "بايظ",
    ],
    answer: {
      ar: "🔧 آسف لسماع ذلك! جرب:\n1. تحديث الصفحة (F5)\n2. مسح الكاش\n3. إذا استمرت، الدعم المباشر (Live Chat) موجود لخدمتك فوراً.",
      en: "🔧 Sorry to hear that! Try:\n1. Refresh (F5)\n2. Clear cache\n3. If stuck, Live Chat is ready to serve you immediately.",
    },
    suggestions: {
      ar: ["تحويل للدعم المباشر", "كيف أمسح الكاش؟"],
      en: ["Switch to Live Support", "How to clear cache?"],
    },
  },
  {
    questions: ["help", "مساعدة", "ساعدني", "need help", "can you help", "أحتاج مساعدة"],
    answer: {
      ar: "أنا هنا لخدمتك! 🛡️ اسألني عن:\n• المواد\n• الجدول\n• الدرجات\n• أو أي مشكلة تواجهك.",
      en: "I'm here to serve! 🛡️ Ask me about:\n• Subjects\n• Schedule\n• Grades\n• Or any issue you're facing.",
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
      "خدمة العملاء",
    ],
    answer: {
      ar: "👨‍💻 للتحدث مع الدعم المباشر:\n• اضغط زر 'LIVE CHAT' بالأعلى\n• أو اكتب 'مشكلة' وسأحولك فوراً.",
      en: "👨‍💻 To talk to Live Support:\n• Click 'LIVE CHAT' button above\n• Or type 'problem' and I'll connect you instantly.",
    },
  },

  // ==================== FALLBACK / MISC ====================
  // General queries that might match loosely
  {
    questions: ["info", "information", "معلومات", "تفاصيل"],
    answer: {
      ar: "أي معلومات تبحث عنها؟ المواد، التسجيل، أم الامتحانات؟ حدد سؤالك وسأساعدك بدقة. 🎯",
      en: "What info do you need? Subjects, Registration, or Exams? Be specific and I'll help precisely. 🎯",
    },
  },
];
