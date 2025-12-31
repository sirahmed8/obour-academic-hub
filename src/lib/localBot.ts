interface KnowledgeBaseItem {
  patterns: string[];
  responseAr: string;
  responseEn: string;
}

const KNOWLEDGE_BASE: KnowledgeBaseItem[] = [
  // Greetings
  {
    patterns: [
      "مرحبا",
      "اهلا",
      "السلام عليكم",
      "هاي",
      "هلو",
      "صباح الخير",
      "مساء الخير",
    ],
    responseAr:
      "أهلاً بك في معاهد العبور! 👋\nأنا مساعدك الآلي، كيف يمكنني مساعدتك اليوم؟",
    responseEn:
      "Welcome to Obour Institutes! 👋\nI am your automated assistant. How can I help you today?",
  },
  {
    patterns: ["hello", "hi", "hey", "good morning", "good evening"],
    responseAr:
      "أهلاً بك في معاهد العبور! 👋\nأنا مساعدك الآلي، كيف يمكنني مساعدتك اليوم؟",
    responseEn:
      "Welcome to Obour Institutes! 👋\nI am your automated assistant. How can I help you today?",
  },
  {
    patterns: ["كيف حالك", "اخبارك", "عامل ايه"],
    responseAr: "أنا بخير، شكراً لسؤالك! 😊\nهل لديك أي استفسار دراسي؟",
    responseEn:
      "I am doing great, thanks for asking! 😊\nDo you have any academic questions?",
  },
  {
    patterns: ["how are you", "how r u", "whats up"],
    responseAr: "أنا بخير، شكراً لسؤالك! 😊\nهل لديك أي استفسار دراسي؟",
    responseEn:
      "I am doing great, thanks for asking! 😊\nDo you have any academic questions?",
  },
  {
    patterns: ["شكرا", "مشكور", "تسلم", "جزاك الله خير"],
    responseAr: "العفو! أنا هنا دائماً للمساعدة. 🌹",
    responseEn: "You are welcome! I am always here to help. 🌹",
  },
  {
    patterns: ["thank", "thanks", "thx"],
    responseAr: "العفو! أنا هنا دائماً للمساعدة. 🌹",
    responseEn: "You are welcome! I am always here to help. 🌹",
  },

  // About Institute
  {
    patterns: [
      "مكان المعهد",
      "العنوان",
      "موقع المعهد",
      "فين المعهد",
      "اللوكيشن",
    ],
    responseAr:
      'يقع معهد العبور في الكيلو 21 طريق بلبيس الصحراوي. 📍\nيمكنك البحث عن "معاهد العبور" على خرائط جوجل للوصول بسهولة.',
    responseEn:
      'Obour Institute is located at KM 21 Belbeis Desert Road. 📍\nYou can search for "Obour Institutes" on Google Maps for easy navigation.',
  },
  {
    patterns: ["location", "address", "where", "directions"],
    responseAr:
      'يقع معهد العبور في الكيلو 21 طريق بلبيس الصحراوي. 📍\nيمكنك البحث عن "معاهد العبور" على خرائط جوجل للوصول بسهولة.',
    responseEn:
      'Obour Institute is located at KM 21 Belbeis Desert Road. 📍\nYou can search for "Obour Institutes" on Google Maps for easy navigation.',
  },
  {
    patterns: ["مصاريف", "اسعار", "رسوم", "فلوس"],
    responseAr:
      "تختلف المصاريف حسب القسم والسنة الدراسية. 💰\nيرجى مراجعة شؤون الطلاب أو زيارة مكتب الحسابات في المعهد للحصول على التفاصيل الدقيقة.",
    responseEn:
      "Fees vary depending on the department and academic year. 💰\nPlease contact student affairs or visit the accounts office for exact details.",
  },
  {
    patterns: ["fees", "cost", "price", "tuition"],
    responseAr:
      "تختلف المصاريف حسب القسم والسنة الدراسية. 💰\nيرجى مراجعة شؤون الطلاب أو زيارة مكتب الحسابات في المعهد للحصول على التفاصيل الدقيقة.",
    responseEn:
      "Fees vary depending on the department and academic year. 💰\nPlease contact student affairs or visit the accounts office for exact details.",
  },
  {
    patterns: ["اقسام", "تخصصات", "شعب"],
    responseAr:
      "يضم المعهد عدة أقسام متميزة منها:\n• علوم الحاسب 💻\n• نظم المعلومات الإدارية 📊\n• إدارة الأعمال 💼\n• المحاسبة 📝",
    responseEn:
      "The institute has several distinguished departments:\n• Computer Science 💻\n• Management Information Systems 📊\n• Business Administration 💼\n• Accounting 📝",
  },
  {
    patterns: ["departments", "majors", "programs", "courses"],
    responseAr:
      "يضم المعهد عدة أقسام متميزة منها:\n• علوم الحاسب 💻\n• نظم المعلومات الإدارية 📊\n• إدارة الأعمال 💼\n• المحاسبة 📝",
    responseEn:
      "The institute has several distinguished departments:\n• Computer Science 💻\n• Management Information Systems 📊\n• Business Administration 💼\n• Accounting 📝",
  },

  // Exams & Study
  {
    patterns: ["جدول الامتحانات", "ميعاد الامتحان", "متى الامتحانات"],
    responseAr:
      "يتم إعلان جداول الامتحانات قبل موعدها بأسبوعين على الأقل على لوحة الإعلانات في المعهد وصفحتنا على الفيسبوك. 📅",
    responseEn:
      "Exam schedules are announced at least two weeks in advance on the institute bulletin board and our Facebook page. 📅",
  },
  {
    patterns: ["exam", "exams", "schedule", "when"],
    responseAr:
      "يتم إعلان جداول الامتحانات قبل موعدها بأسبوعين على الأقل على لوحة الإعلانات في المعهد وصفحتنا على الفيسبوك. 📅",
    responseEn:
      "Exam schedules are announced at least two weeks in advance on the institute bulletin board and our Facebook page. 📅",
  },
  {
    patterns: ["نتيجة", "نتايج", "درجات"],
    responseAr:
      "يمكنك معرفة نتيجتك من خلال شؤون الطلاب أو عبر المنصة عند تفعيلها. 🎓",
    responseEn:
      "You can check your results through student affairs or via the platform when activated. 🎓",
  },
  {
    patterns: ["result", "results", "grades", "score"],
    responseAr:
      "يمكنك معرفة نتيجتك من خلال شؤون الطلاب أو عبر المنصة عند تفعيلها. 🎓",
    responseEn:
      "You can check your results through student affairs or via the platform when activated. 🎓",
  },
  {
    patterns: ["محاضرات", "سكاشن", "غياب"],
    responseAr:
      "التزامك بحضور المحاضرات والسكاشن مهم جداً لنجاحك. 📚\nتأكد من متابعة الجدول الدراسي الخاص بقسمك.",
    responseEn:
      "Attending lectures and sections is very important for your success. 📚\nMake sure to follow your department schedule.",
  },
  {
    patterns: ["lectures", "classes", "attendance", "absent"],
    responseAr:
      "التزامك بحضور المحاضرات والسكاشن مهم جداً لنجاحك. 📚\nتأكد من متابعة الجدول الدراسي الخاص بقسمك.",
    responseEn:
      "Attending lectures and sections is very important for your success. 📚\nMake sure to follow your department schedule.",
  },

  // Technical Help
  {
    patterns: [
      "مشكلة",
      "مشكله",
      "عطل",
      "مش عارف ادخل",
      "نسيت الباسورد",
      "error",
    ],
    responseAr:
      "إذا كنت تواجه مشكلة تقنية، يمكنك:\n1. التأكد من اتصال الإنترنت 📶\n2. تحديث الصفحة 🔄\n3. التواصل مع الدعم الفني المباشر من خلال الزر في الأسفل 🎧",
    responseEn:
      "If you are facing a technical issue, you can:\n1. Check your internet connection 📶\n2. Refresh the page 🔄\n3. Contact live support using the button below 🎧",
  },
  {
    patterns: ["problem", "issue", "help", "bug", "broken", "not working"],
    responseAr:
      "إذا كنت تواجه مشكلة تقنية، يمكنك:\n1. التأكد من اتصال الإنترنت 📶\n2. تحديث الصفحة 🔄\n3. التواصل مع الدعم الفني المباشر من خلال الزر في الأسفل 🎧",
    responseEn:
      "If you are facing a technical issue, you can:\n1. Check your internet connection 📶\n2. Refresh the page 🔄\n3. Contact live support using the button below 🎧",
  },
];

// Detect if message is Arabic
function isArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text);
}

// Default fallback responses
const FALLBACK_AR =
  'عذراً، لم أفهم سؤالك تماماً. 🤔\nيمكنك صياغة السؤال بطريقة أخرى أو اكتب "دعم" للتحدث مع موظف حقيقي.';
const FALLBACK_EN =
  'Sorry, I didn\'t quite understand your question. 🤔\nYou can rephrase or type "support" to talk to a real person.';

export function getLocalBotResponse(message: string): string {
  const normalizedMsg = message.toLowerCase().trim();
  const useArabic = isArabic(message);

  for (const item of KNOWLEDGE_BASE) {
    if (item.patterns.some((p) => normalizedMsg.includes(p.toLowerCase()))) {
      return useArabic ? item.responseAr : item.responseEn;
    }
  }

  return useArabic ? FALLBACK_AR : FALLBACK_EN;
}

// Check if user wants live support
export function wantsLiveSupport(message: string): boolean {
  const normalizedMsg = message.toLowerCase().trim();
  const supportKeywords = [
    "دعم",
    "support",
    "live",
    "human",
    "موظف",
    "حقيقي",
    "مساعدة",
    "help me",
  ];
  return supportKeywords.some((k) => normalizedMsg.includes(k));
}
