// Comprehensive Chatbot Knowledge Base
// Based on user transcripts and requirements

interface KnowledgeBaseItem {
  patterns: string[];
  responseAr: string;
  responseEn: string;
  category?: string;
  action?: "suggest_support";
}

function getSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;

  // Levenshtein-like approximation for short phrases could be added here
  // For now, simple token matching
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  let matches = 0;
  for (const w1 of words1) {
    if (words2.some((w2) => w2.includes(w1) || w1.includes(w2))) matches++;
  }
  return matches / Math.max(words1.length, words2.length);
}

// Helper to normalize text (remove tashkeel, unify alef, etc)
function normalizeArabic(text: string): string {
  return text
    .replace(/[إأآا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْ]/g, "")
    .trim();
}

/**
 * INTELLIGENT MATCHING LOGIC
 * Finds the best match even if not exact.
 */
function findBestMatch(input: string): KnowledgeBaseItem | null {
  const normalizedInput = normalizeArabic(input.toLowerCase());
  let bestMatch: KnowledgeBaseItem | null = null;
  let highestScore = 0;

  for (const item of KNOWLEDGE_BASE) {
    for (const pattern of item.patterns) {
      const normalizedPattern = normalizeArabic(pattern.toLowerCase());
      const score = getSimilarity(normalizedInput, normalizedPattern);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = item;
      }
    }
  }

  // Threshold for "I don't understand"
  if (highestScore < 0.4) return null;
  return bestMatch;
}

const KNOWLEDGE_BASE: KnowledgeBaseItem[] = [
  // --- GREETINGS ---
  {
    patterns: [
      "مرحبا",
      "اهلا",
      "السلام عليكم",
      "سلام",
      "hi",
      "hello",
      "hey",
      "كيفك",
      "عاملك ايه",
      "اخبارك",
      "how are you",
    ],
    responseAr:
      "أهلاً بك في معاهد العبور! 👋\nأنا مساعدك الآلي الذكي. 🤖\n\nيمكنني مساعدتك في معرفة:\n• تفاصيل الأقسام والمواد 📚\n• المصاريف وطرق الدفع 💰\n• جداول المحاضرات والامتحانات 📅\n• مكان المعهد وكيفية الوصول 📍\n\nاسألني أي شيء!",
    responseEn:
      "Welcome to Obour Institutes! 👋\nI am your smart assistant. 🤖\n\nI can help you with:\n• Departments & Subjects 📚\n• Fees & Payment 💰\n• Schedules & Exams 📅\n• Location & Directions 📍\n\nAsk me anything!",
    category: "greetings",
  },

  // --- DEPARTMENTS (General) ---
  {
    patterns: [
      "الاقسام",
      "تخصصات",
      "كليات",
      "ادرس ايه",
      "departments",
      "majors",
      "courses",
    ],
    responseAr:
      "يضم المعهد 4 أقسام رئيسية متميزة:\n\n1️⃣ **علوم الحاسب (CS)**: لتعلم البرمجة والذكاء الاصطناعي.\n2️⃣ **نظم المعلومات (MIS)**: يجمع بين التكنولوجيا والإدارة.\n3️⃣ **إدارة الأعمال**: للتسويق وإدارة الشركات.\n4️⃣ **المحاسبة**: للماليات والضرائب.\n\n💡 اكتب اسم أي قسم لمعرفة التفاصيل والمواد!",
    responseEn:
      "The institute has 4 main departments:\n\n1️⃣ **Computer Science (CS)**\n2️⃣ **Management Information Systems (MIS)**\n3️⃣ **Business Administration**\n4️⃣ **Accounting**\n\n💡 Type a department name for details!",
    category: "departments",
  },

  // --- CS ---
  {
    patterns: [
      "علوم الحاسب",
      "حاسبات",
      "برمجة",
      "cs",
      "computer science",
      "programming",
    ],
    responseAr:
      "💻 **قسم علوم الحاسب (Computer Science)**\n\nهنا ستتعلم لغات البرمجة الحديثة وتطوير البرمجيات.\n\n📚 **أهم المواد:**\n• مقدمة في البرمجة (C++, Java, Python)\n• هياكل البيانات (Data Structures)\n• قواعد البيانات (Databases)\n• الذكاء الاصطناعي (AI)\n• هندسة البرمجيات\n\n🚀 **مجالات العمل:** مطور برامج، مهندس ذكاء اصطناعي، مطور ويب.",
    responseEn:
      "💻 **Computer Science Department**\n\nLearn modern programming and software development.\n\n📚 **Key Subjects:**\n• Programming (C++, Java, Python)\n• Data Structures\n• Databases\n• Artificial Intelligence\n\n🚀 **Careers:** Software Developer, AI Engineer, Web Developer.",
    category: "departments",
  },

  // --- MIS ---
  {
    patterns: ["نظم معلومات", "mis", "management information", "نظم"],
    responseAr:
      "📊 **قسم نظم المعلومات الإدارية (MIS)**\n\nالقسم الذي يربط التكنولوجيا ببيئة العمل.\n\n📚 **أهم المواد:**\n• تحليل وتصميم النظم\n• تجارة إلكترونية\n• إدارة قواعد البيانات\n• شبكات الحاسب\n\n🚀 **مجالات العمل:** محلل نظم، مدير مشاريع تقنية، أخصائي دعم فني.",
    responseEn:
      "📊 **MIS Department**\n\nBridging technology and business.\n\n📚 **Key Subjects:**\n• System Analysis\n• E-Commerce\n• Database Management\n• Networking\n\n🚀 **Careers:** System Analyst, IT Project Manager, Support Specialist.",
    category: "departments",
  },

  // --- FEES ---
  {
    patterns: [
      "مصاريف",
      "رسوم",
      "اسعار",
      "بكام",
      "fees",
      "tuition",
      "cost",
      "price",
    ],
    responseAr:
      '💰 **المصاريف الدراسية**\n\nتختلف المصاريف حسب القسم والسنة الدراسية.\n\n📞 **للاستعلام الدقيق:**\nيرجى التواصل مع شؤون الطلاب أو زيارة مكتب الحسابات.\n\n💳 **مميزات:**\n• إمكانية التقسيط\n• خصومات للمتفوقين\n\nاكتب "دعم" للتحدث مع موظف للتفاصيل المالية.',
    responseEn:
      '💰 **Tuition Fees**\n\nFees vary by department and year.\n\n📞 **For details:** Please contact Student Affairs.\n\n💳 **Features:**\n• Installment plans available\n• Scholarships for top students\n\nType "support" to talk to an agent about finance.',
    category: "fees",
  },

  // --- EXAMS ---
  {
    patterns: [
      "امتحانات",
      "جدول الامتحانات",
      "ميدتيرم",
      "فاينل",
      "exams",
      "schedule",
      "finals",
      "midterm",
    ],
    responseAr:
      "📅 **الامتحانات**\n\nيتم إعلان الجداول رسمياً قبل الامتحانات بأسبوعين.\n\n🔔 **تابع الإشعارات** على التطبيق او صفحة الفيسبوك لمعرفة المواعيد فور نزولها.\n\nنصيحة: ابدأ المذاكرة مبكراً! 😉",
    responseEn:
      "📅 **Exams**\n\nSchedules are announced 2 weeks before exams.\n\n🔔 **Check Notifications** on the app or Facebook page for updates.\n\nTip: Start studying early! 😉",
    category: "exams",
  },

  // --- LOCATION ---
  {
    patterns: [
      "مكان",
      "عنوان",
      "موقع",
      "فين",
      "location",
      "address",
      "where",
      "map",
    ],
    responseAr:
      '📍 **عنوان المعهد**\n\nالكيلو 21 طريق مصر الإسماعيلية الصحراوي - مدينة العبور.\n\n🚗 **للوصول:**\nمتوفر باصات لنقل الطلاب من وإلى المعهد.\n\nاكتب "باص" لمعرفة مواعيد الباصات.',
    responseEn:
      "📍 **Location**\n\nKM 21 Cairo-Ismailia Desert Road - Obour City.\n\n🚗 **Transport:**\nStudent buses are available.",
    category: "location",
  },

  // --- BUS ---
  {
    patterns: [
      "باص",
      "مواصلات",
      "اتوبيس",
      "bus",
      "transport",
      "transportation",
    ],
    responseAr:
      "🚌 **خطوط الباصات**\n\nيغطي المعهد مناطق عديدة (القاهرة، الجيزة، الشرقية).\n\n⏰ التحرك صباحاً: 8:00 صباحاً\n⏰ العودة: 3:00 عصراً\n\nللاشتراك، راجع مكتب الحركة بالدور الأرضي.",
    responseEn:
      "🚌 **Bus Service**\n\nCoverage: Cairo, Giza, Sharkia.\n\n⏰ Morning: 8:00 AM\n⏰ Return: 3:00 PM\n\nVisit the transportation office to subscribe.",
    category: "services",
  },

  // --- THANKS / BYE ---
  {
    patterns: ["شكرا", "تسلم", "باي", "مع السلامة", "thanks", "bye", "goodbye"],
    responseAr: "العفو! ❤️\nأنا موجود دائماً لمساعدتك.\nبالتوفيق في دراستك! 🎓",
    responseEn:
      "You're welcome! ❤️\nAlways here to help.\nGood luck with your studies! 🎓",
    category: "chat",
  },

  // --- SWEARING / INSULTS ---
  {
    patterns: [
      "حمار",
      "غبي",
      "fuck",
      "shit",
      "bitch",
      "stupid",
      "idiot",
      "حيوان",
      "زفت",
    ],
    responseAr:
      'أنا آسف إذا ضايقتك. 😔\nأنا مجرد روبوت أحاول المساعدة.\n\nإذا عندك مشكلة حقيقية، اكتب "دعم" وهيوصلك شخص يحلها فوراً.',
    responseEn:
      "I'm sorry if I upset you. 😔\nI'm just a bot trying to help.\n\nType \"support\" to talk to a real person who can solve your issue.",
    category: "defense",
  },

  // --- SUPPORT REQUEST ---
  {
    patterns: [
      "دعم",
      "خدمة عملاء",
      "عايز اكلم حد",
      "انسان",
      "support",
      "human",
      "agent",
      "help",
    ],
    responseAr: "جاري تحويلك للدعم الفني... 🎧",
    responseEn: "Switching you to support... 🎧",
    category: "support",
    action: "suggest_support", // Special flag to trigger button
  },
];

// --- EXPORTED FUNCTIONS ---

export function getLocalBotResponse(text: string): string {
  const match = findBestMatch(text);

  if (!match) {
    // Fallback response for unknown queries
    // Try to detect topic roughly
    if (text.length < 3) return "Could you please clarify? 🤔";

    return "🤔 عذراً، لم أفهم سؤالك تماماً.\n\nيمكنك سؤالي عن:\n• المصاريف 💰\n• الأقسام 📚\n• العنوان 📍\n\nأو اكتب 'دعم' للتحدث مع موظف.";
  }

  // Check language (heuristic)
  const isArabic = /[\u0600-\u06FF]/.test(text);
  return isArabic ? match.responseAr : match.responseEn;
}

export function wantsLiveSupport(text: string): boolean {
  const match = findBestMatch(text);
  return match?.action === "suggest_support";
}

export function needsHelpSuggestion(text: string): boolean {
  // If user seems confused or asks general "what can you do"
  const patterns = ["help", "what", "مساعدة", "تعمل ايه", "وظيفتك"];
  return patterns.some((p) => text.toLowerCase().includes(p));
}
