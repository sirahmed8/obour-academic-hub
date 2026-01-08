import { QA } from "../types";

export const FAQ_KNOWLEDGE: QA[] = [
  // ==================== LOCATION & TRANSPORT ====================
  {
    questions: [
      "location",
      "address",
      "where is institute",
      "map",
      "transportation",
      "bus",
      "الموقع",
      "العنوان",
      "فين المعهد",
      "مكان المعهد",
      "مواصلات",
      "الباص",
      "اركب ايه",
    ],
    answer: {
      ar: "📍 **العنوان:** مدينة العبور، الحي السابع، أمام كارفور العبور.\n\n🚌 **المواصلات:**\n• موقف العاشر (السلام): اركب عربيات العبور وانزل الحي السابع.\n• من رمسيس: ميكروباصات العبور (محطة الحي السابع).",
      en: "📍 **Address:** Obour City, 7th District, In front of Carrefour Obour.\n\n🚌 **Transportation:**\n• Al-Asher Stop (Salam): Take Obour cars to 7th District.\n• Ramses: Obour Microbuses (7th District Station).",
    },
  },

  // ==================== STUDENT AFFAIRS ====================
  {
    questions: [
      "fees",
      "payment",
      "tuition",
      "cost",
      "money",
      "مصاريف",
      "دفع",
      "فلوس",
      "تكلفة",
      "رسوم",
    ],
    answer: {
      ar: "💰 **المصاريف الدراسية:**\nتختلف حسب السنة والتخصص. يفضل مراجعة شؤون الطلاب لمعرفة المبلغ الدقيق وأقساط السداد. الدفع عادة بيكون في البنك الأهلي أو CIB.",
      en: "💰 **Tuition Fees:**\nVaries by year and major. Please check Student Affairs for exact amounts and installments. Payment is usually via NBE or CIB.",
    },
  },
  {
    questions: [
      "student affairs",
      "affairs office",
      "contact admin",
      "شؤون الطلاب",
      "مكتب الشؤون",
      "التسجيل",
    ],
    answer: {
      ar: "🏢 **مكتب شؤون الطلاب:**\nموجود في المبنى الإداري (الدور الأرضي). مواعيد العمل: 9 ص - 2 م (يومياً ما عدا الجمعة).",
      en: "🏢 **Student Affairs Office:**\nLocated in the Admin Building (Ground Floor). Working hours: 9 AM - 2 PM (Daily except Friday).",
    },
  },
  {
    questions: ["transfer", "transfer papers", "تحويل", "ورق التحويل", "احول للمعهد"],
    answer: {
      ar: "📄 **التحويل للمعهد:**\nيتطلب بيان درجات من كليتك السابقة + خطاب حسن سير وسلوك. قدم الورق في الشؤون وهما هيعملوا 'المقاصة' عشان يعرفوا المواد اللي هتتشال عنك.",
      en: "📄 **Transferring:**\nRequires transcript from previous college + good conduct certificate. Submit papers to Affairs for 'Credit Transfer' evaluation.",
    },
  },

  // ==================== LIBRARY & CAMPUS ====================
  {
    questions: ["library", "books", "borrow", "مكتبة", "كتب", "استعارة"],
    answer: {
      ar: "📚 **المكتبة:**\nفي الدور الثاني. مليانة مراجع ومكان هادي للمذاكرة. عشان تستعير كتاب محتاج كارنيه المعهد.",
      en: "📚 **Library:**\nOn the 2nd floor. Full of references and a quiet place to study. You need your ID to borrow books.",
    },
  },
  {
    questions: ["wifi", "internet", "campus net", "واي فاي", "نت المعهد", "باسورد الواي فاي"],
    answer: {
      ar: "📶 **واي فاي المعهد:**\nمتاح للطلاب في الكافتيريا والمكتبة. الشبكة اسمها `Obour-Student`، والباسورد بيتغير كل تيرم (اسأل في الـ IT).",
      en: "📶 **Campus WiFi:**\nAvailable in Cafeteria and Library. Network: `Obour-Student`. Password changes every term (Ask IT).",
    },
  },
];
