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
// 3. Knowledge Base
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
  // Greeting
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
    ],
    answer: {
      ar: "مرحباً بك في منصة العبور! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟\nيمكنك سؤالي عن الخدمات، المواد، أو الدعم الفني.",
      en: "Welcome to Obour Platform! I'm your smart assistant. How can I help you today?\nYou can ask me about services, subjects, or technical support.",
    },
    suggestions: {
      ar: ["كيف اسجل؟", "ما هي المواد؟", "مشكلة تقنية"],
      en: ["How to register?", "What are subjects?", "Technical issue"],
    },
  },
  // Who are you
  {
    questions: [
      "who are you",
      "what is this",
      "bot",
      "من انت",
      "مين انت",
      "شنو هذا",
    ],
    answer: {
      ar: "أنا المساعد الذكي الخاص بمنصة العبور، موجود لمساعدتك في الوصول للمعلومات والدعم بسرعة.",
      en: "I am the smart assistant for Obour Platform, here to help you access information and support quickly.",
    },
  },
  // Registration / Sign up
  {
    questions: [
      "register",
      "sign up",
      "login",
      "account",
      "تسجيل",
      "دخول",
      "حساب",
      "انشاء حساب",
    ],
    answer: {
      ar: "يمكنك تسجيل الدخول أو إنشاء حساب جديد بسهولة عبر زر 'Login' في القائمة العلوية باستخدام حساب Google الجامعي أو الشخصي.",
      en: "You can login or create a new account easily via the 'Login' button in the top menu using your Google University or personal account.",
    },
  },
  // Subjects / Materials
  {
    questions: [
      "material",
      "subject",
      "course",
      "resource",
      "pdf",
      "مواد",
      "مادة",
      "مقرر",
      "ملخصات",
    ],
    answer: {
      ar: "تتوفر جميع المواد الدراسية في قسم 'Subjects'. يمكنك تصفح التلخيصات، الأسئلة السابقة، والمصادر هناك.",
      en: "All study materials are available in the 'Subjects' section. You can browse summaries, past questions, and resources there.",
    },
  },
  // Technical Support
  {
    questions: [
      "problem",
      "issue",
      "bug",
      "error",
      "help",
      "chat",
      "live",
      "support",
      "مشكلة",
      "خطأ",
      "مساعدة",
      "دعم",
      "فني",
      "تحدث",
    ],
    answer: {
      ar: "إذا كنت تواجه مشكلة تقنية، يمكنك التحدث مباشرة مع فريق الدعم الفني. هل تود أن أحولك للدعم المباشر؟",
      en: "If you are facing a technical issue, you can chat directly with our support team. Would you like me to switch you to Live Support?",
    },
    suggestions: {
      ar: ["تحويل للدعم المباشر"],
      en: ["Switch to Live Support"],
    },
  },
  // Owners / About
  {
    questions: [
      "owner",
      "creator",
      "admin",
      "dev",
      "من صنع",
      "المطور",
      "المالك",
      "احمد",
      "ahmed",
    ],
    answer: {
      ar: "تم تطوير هذه المنصة بواسطة المبدعين في معاهد العبور لتسهيل الرحلة التعليمية للطلاب.",
      en: "This platform was developed by the innovators at Obour Institutes to facilitate the educational journey for students.",
    },
  },
  // Exams
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
    ],
    answer: {
      ar: "يمكنك العثور على نماذج اختبارات سابقة وتجميعات في صفحة المادة الخاصة بها تحت قسم 'Resources'.",
      en: "You can find past exam papers and collections on the specific subject page under the 'Resources' section.",
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
      suggestions:
        language === "ar" ? match.suggestions?.ar : match.suggestions?.en,
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
  ];
  return keywords.some((k) => norm.includes(k));
}

export function needsHelpSuggestion(input: string): boolean {
  const norm = normalizeArabic(input);
  const keywords = [
    "help",
    "what",
    "how",
    "مساعدة",
    "كيف",
    "ماذا",
    "ليه",
    "why",
  ];
  return keywords.some((k) => norm.includes(k));
}
