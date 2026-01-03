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
  {
    patterns: ["مين انت", "عرفني بنفسك", "who are you", "what can you do"],
    responseAr:
      "أنا المساعد الذكي الخاص بمعاهد العبور. 🎓\nتم تطويري لمساعدتك في الإجابة على استفساراتك حول الدراسة، المصاريف، والأقسام.\n\nأنا هنا لخدمتك 24/7! 🤖",
    responseEn:
      "I am the Obour Institutes Smart Assistant. 🎓\nI was developed to help answer your questions about studies, fees, and departments.\n\nI'm here for you 24/7! 🤖",
    category: "about_bot",
  },

  // --- ADMISSION & REGISTRATION ---
  {
    patterns: [
      "تقديم",
      "تسجيل",
      "قبول",
      "شروط",
      "اوراق",
      "ورق",
      "admission",
      "register",
      "apply",
      "requirements",
      "papers",
    ],
    responseAr:
      "📝 **للتقديم في معاهد العبور:**\n\nالأوراق المطلوبة للطلاب الجدد:\n1. أصل شهادة الثانوية العامة او ما يعادلها\n2. أصل شهادة الميلاد\n3. 6 صور شخصية\n4. نموذج 2 جند (للذكور)\n5. صورة البطاقة الشخصية\n\n📍 التقديم يتم من خلال مكتب التنسيق او التوجه لمكتب القبول والتسجيل في المعهد.",
    responseEn:
      "📝 **Admission Requirements:**\n\nRequired documents:\n1. High School Certificate (Original)\n2. Birth Certificate (Original)\n3. 6 Personal Photos\n4. Military Form 2 (Males)\n5. ID Copy\n\n📍 Apply through the coordination office or visit the admission office.",
    category: "admission",
  },
  {
    patterns: ["تحويل", "نقل", "transfer"],
    responseAr:
      "🔄 **التحويل للمعهد:**\n\nنقبل التحويلات من الكليات والمعاهد المناظرة.\nيرجى إحضار بيان درجات موثق من الجهة المحول منها والتوجه لشؤون الطلاب لعمل المقاصة العلمية.",
    responseEn:
      "🔄 **Transfers:**\n\nWe accept transfers from similar colleges.\nPlease bring an official transcript to Student Affairs for credit transfer evaluation.",
    category: "admission",
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
  {
    patterns: [
      "لغات برمجة",
      "سي بلس بلس",
      "بايثون",
      "c++",
      "python",
      "programming languages",
    ],
    responseAr:
      "نحن نركز على أهم اللغات في سوق العمل:\n- **C++**: للأساسيات القوية.\n- **Java/C#**: لتطبيقات المؤسسات.\n- **Python**: للذكاء الاصطناعي وتحليل البيانات.\n- **JavaScript/TypeScript**: لتطوير الويب.",
    responseEn:
      "We focus on industry-standard languages:\n- **C++**: For strong fundamentals.\n- **Java/C#**: For enterprise apps.\n- **Python**: For AI & Data.\n- **JavaScript/TypeScript**: For Web Dev.",
    category: "academic",
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

  // --- BUSINESS & ACCOUNTING ---
  {
    patterns: ["ادارة اعمال", "بزنس", "business", "administration"],
    responseAr:
      "💼 **قسم إدارة الأعمال**\n\nيؤهلك لإدارة الشركات والمشاريع.\n📚 **المواد:** تسويق، إدارة موارد بشرية، إدارة إنتاج، اقتصاد.\n🚀 **العمل:** مدير تسويق، رائد أعمال، مسؤول HR.",
    responseEn:
      "💼 **Business Admin**\n\nPrepare to lead companies.\n📚 **Subjects:** Marketing, HR, Economics.\n🚀 **Careers:** Marketing Manager, Entrepreneur, HR Specialist.",
    category: "departments",
  },
  {
    patterns: ["محاسبة", "accounting", "accountant"],
    responseAr:
      "📈 **قسم المحاسبة**\n\nلغة المال والأعمال.\n📚 **المواد:** محاسبة مالية، تكاليف، مراجعة، ضرائب.\n🚀 **العمل:** محاسب قانوني، مراجع حسابات، مدير مالي.",
    responseEn:
      "📈 **Accounting**\n\nThe language of business.\n📚 **Subjects:** Financial Accounting, Cost Accounting, Auditing.\n🚀 **Careers:** CPA, Auditor, Financial Manager.",
    category: "departments",
  },

  // --- FEES & PAYMENT ---
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
      '💰 **المصاريف الدراسية**\n\nتختلف المصاريف حسب القسم والسنة الدراسية.\n\n📞 **للاستعلام الدقيق:**\nيرجى التواصل مع شؤون الطلاب أو زيارة مكتب الحسابات.\n\n💳 **طرق الدفع:**\n• الدفع نقداً في الخزينة\n• الدفع الإلكتروني (قريباً)\n\nاكتب "دعم" للتحدث مع موظف للتفاصيل المالية.',
    responseEn:
      '💰 **Tuition Fees**\n\nFees vary by department and year.\n\n📞 **For details:** Please contact Student Affairs.\n\n💳 **Payment:**\n• Cash at treasury\n• Online (Coming soon)\n\nType "support" to talk to an agent about finance.',
    category: "fees",
  },
  {
    patterns: ["تقسيط", "قسط", "installments"],
    responseAr:
      "نعم، يوفر المعهد نظام تقسيط للمصروفات الدراسية على دفعتين (ترم أول وترم ثاني). يرجى مراجعة شؤون الطلاب للتفاصيل.",
    responseEn:
      "Yes, tuition can be paid in two installments (per semester). Please check with Student Affairs.",
    category: "fees",
  },

  // --- EXAMS & GRADING ---
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
  {
    patterns: ["نتيجة", "نتائج", "gpa", "تقدير", "result", "grade"],
    responseAr:
      "📊 **النتائج والتقديرات**\n\nيتبع المعهد نظام الساعات المعتمدة (GPA).\n- **A**: ممتاز (4.0)\n- **B**: جيد جداً (3.0)\n- **C**: جيد (2.0)\n- **D**: مقبول (1.0)\n- **F**: راسب\n\nيمكنك معرفة نتيجتك من خلال حسابك الطلابي.",
    responseEn:
      "📊 **Results & GPA**\n\nWe follow the GPA system.\n- **A**: Excellent (4.0)\n- **B**: Very Good (3.0)\n- **C**: Good (2.0)\n- **D**: Pass (1.0)\n- **F**: Fail\n\nCheck your results via the student portal.",
    category: "academic",
  },

  // --- LOCATION & TRANSPORT ---
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

  // --- STUDENT LIFE ---
  {
    patterns: [
      "انشطة",
      "رحلات",
      "ملاعب",
      "كافتيريا",
      "activities",
      "sports",
      "trips",
    ],
    responseAr:
      "🎉 **الحياة الطلابية**\n\nالمعهد ليس للدراسة فقط!\n- **ملاعب رياضية**: كرة قدم، طائرة.\n- **أنشطة ثقافية**: ندوات، مسابقات.\n- **رحلات**: ترفيهية وعلمية دورية.\n- **كافتيريا**: تقدم وجبات ومشروبات متنوعة.",
    responseEn:
      "🎉 **Student Life**\n\nNot just study!\n- **Sports**: Football courts.\n- **Culture**: Seminars, competitions.\n- **Trips**: Regular fun & educational trips.\n- **Cafeteria**: Serving meals & drinks.",
    category: "activities",
  },
  {
    patterns: ["واي فاي", "نت", "wifi", "internet"],
    responseAr:
      "📶 **الإنترنت**\n\nتتوفر خدمة الواي فاي المجانية في المكتبة والمعامل.\nكلمة السر: اسأل مشرف المعمل.",
    responseEn:
      "📶 **Wi-Fi**\n\nFree Wi-Fi available in library and labs.\nPassword: Ask lab supervisor.",
    category: "services",
  },

  // --- ACADEMIC STAFF ---
  {
    patterns: ["عميد", "العميد", "dean"],
    responseAr:
      "👨‍🏫 **عميد المعهد**\n\nأ.د. [الاسم] - أستاذ علوم الحاسب ونظم المعلومات.\nيستقبل الطلاب في مكتبه يومياً من 10-12 ظهراً للمشاكل الهامة.",
    responseEn:
      "👨‍🏫 **The Dean**\n\nProf. [Name] - Professor of CS & IS.\nOffice hours: 10-12 PM daily for major concerns.",
    category: "staff",
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
      "مشكلة",
      "support",
      "human",
      "agent",
      "help",
      "issue",
      "problem",
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

    return "🤔 عذراً، لم أفهم سؤالك تماماً.\n\nيمكنك سؤالي عن:\n• المصاريف 💰\n• الأقسام 📚\n• العنوان 📍\n• التقديم والتحويل 📝\n\nأو اكتب 'دعم' للتحدث مع موظف.";
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
  const patterns = [
    "help",
    "what",
    "مساعدة",
    "تعمل ايه",
    "وظيفتك",
    "مين",
    "who",
  ];
  return patterns.some((p) => text.toLowerCase().includes(p));
}
