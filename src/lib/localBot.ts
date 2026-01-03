// db import removed as it was unused

// Types
export interface BotResponse {
  text: string;
  confidence: number;
  suggestions?: string[];
  action?: "live_chat" | "link";
  link?: string;
}

// ----------------------------------------------------------------------
// 1. Text Normalization (Critical for Arabic)
// ----------------------------------------------------------------------
function normalizeArabic(text: string): string {
  if (!text) return "";
  let normalized = text.toLowerCase().trim();

  // Remove Tashkeel (diacritics)
  normalized = normalized.replace(/[\u064B-\u065F]/g, "");

  // Normalize Alef
  normalized = normalized.replace(/[أإآ]/g, "ا");

  // Normalize Teh Marbuta
  normalized = normalized.replace(/ة/g, "ه");

  // Normalize Yeh
  normalized = normalized.replace(/ى/g, "ي");

  // Remove punctuation and special charts
  normalized = normalized.replace(/[^\w\s\u0600-\u06FF]/g, " ");

  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, " ");

  return normalized.trim();
}

// ----------------------------------------------------------------------
// 2. Similarity / Fuzzy Matching (Levenshtein-based)
// ----------------------------------------------------------------------
function getSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;

  if (longerLength === 0) {
    return 1.0;
  }

  const editDistance = levenshteinDistance(longer, shorter);
  return (longerLength - editDistance) / parseFloat(longerLength.toString());
}

function levenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

// ----------------------------------------------------------------------
// 3. Knowledge Base (Expanded)
// ----------------------------------------------------------------------
interface QA {
  questions: string[];
  answer: {
    ar: string;
    en: string;
  };
  suggestions?: { ar: string[]; en: string[] };
}

const KNOWLEDGE_BASE: QA[] = [
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
];

// ----------------------------------------------------------------------
// 4. Matching Logic
// ----------------------------------------------------------------------
function findBestMatch(input: string): QA | null {
  const normInput = normalizeArabic(input);
  let bestMatch: QA | null = null;
  let highestScore = 0;

  for (const qa of KNOWLEDGE_BASE) {
    for (const q of qa.questions) {
      const normQ = normalizeArabic(q);

      // Exact word match check
      if (normInput.includes(normQ) || normQ.includes(normInput)) {
        // If the query is extremely short (like "hi"), require high similarity
        if (normInput.length < 3 && normQ.length < 3) {
          const score = getSimilarity(normInput, normQ);
          if (score > highestScore) {
            highestScore = score;
            bestMatch = qa;
          }
        } else {
          // Boost score for inclusion
          const score = 0.85;
          if (score > highestScore) {
            highestScore = score;
            bestMatch = qa;
          }
        }
      }

      // Fuzzy match
      const score = getSimilarity(normInput, normQ);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = qa;
      }
    }
  }

  return highestScore > 0.4 ? bestMatch : null; // Threshold
}

// ----------------------------------------------------------------------
// 5. Public API
// ----------------------------------------------------------------------
export async function getLocalBotResponse(
  input: string,
  language: "ar" | "en" = "ar"
): Promise<BotResponse> {
  const match = findBestMatch(input);

  if (match) {
    return {
      text: language === "ar" ? match.answer.ar : match.answer.en,
      confidence: 1, // High confidence since it matched rules
      suggestions: language === "ar" ? match.suggestions?.ar : match.suggestions?.en,
    };
  }

  // Fallback
  return {
    text:
      language === "ar"
        ? "عذراً، لم أفهم تماماً. هل يمكنك إعادة الصياغة أو اختيار أحد الخيارات أدناه؟"
        : "Sorry, I didn't quite catch that. Can you rephrase or choose an option below?",
    confidence: 0,
    suggestions:
      language === "ar"
        ? ["الدعم الفني", "المواد الدراسية", "تسجيل الدخول"]
        : ["Technical Support", "Subjects", "Login"],
  };
}

export function wantsLiveSupport(input: string): boolean {
  const norm = normalizeArabic(input);
  const keywords = [
    "human",
    "person",
    "support",
    "live",
    "talk",
    "chat",
    "دعم",
    "مباشر",
    "انسان",
    "موظف",
    "تحدث",
    "شات",
    "لايف",
    "ادمن",
    "admin",
  ];
  return keywords.some((k) => norm.includes(k));
}

export function needsHelpSuggestion(input: string): boolean {
  const norm = normalizeArabic(input);
  const keywords = ["help", "what", "how", "مساعدة", "كيف", "ماذا", "ليه", "why"];
  return keywords.some((k) => norm.includes(k));
}
