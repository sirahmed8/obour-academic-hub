import { QA } from "../types";

export const GENERAL_KNOWLEDGE: QA[] = [
  // ==================== GREETINGS (DIVERSE) ====================
  {
    questions: [
      "hello",
      "hi",
      "hey",
      "welcome",
      "hola",
      "marhaba",
      "مرحبا",
      "اهلا",
      "السلام عليكم",
      "هلا",
      "اهلين",
      "سلام",
      "هاي",
    ],
    answer: {
      ar: [
        "وعليكم السلام! 👋 يا هلا والله. نورت المنصة!",
        "أهلاً بك يا بطل! 🚀 جاهز نكسر الدنيا النهاردة؟",
        "مرحباً! 😊 أنا مساعدك الذكي. اسألني أي حاجة.",
        "يا هلا! 🌟 يومك جميل بإذن الله. كيف أقدر أساعدك؟",
        "صباح/مساء الفل! ✨ أنا هنا عشانك.",
        "أهلاً أهلاً! 🎉 نورت بيتك الثاني.",
      ],
      en: [
        "Hello there! 👋 Welcome to Obour Platform.",
        "Welcome back, Champion! 🚀 Ready to crush it today?",
        "Hi! 😊 I'm your smart assistant. Ask me anything.",
        "Hey! 🌟 Hope you're having a great day. How can I help?",
        "Good day! ✨ I'm here for you.",
        "Welcome! 🎉 Great to see you here.",
      ],
    },
    suggestions: {
      ar: ["نكتة", "حكمة اليوم", "مين المطور؟"],
      en: ["Tell me a joke", "Quote of the day", "Who is the dev?"],
    },
  },

  // ==================== JOKES (PROGRAMMER HUMOR) ====================
  {
    questions: [
      "joke",
      "tell me a joke",
      "funny",
      "laugh",
      "make me laugh",
      "نكتة",
      "قول نكتة",
      "ضحكني",
      "هات نكتة",
      "فرفشني",
    ],
    answer: {
      ar: [
        "😂 مرة مبرمج راح يشتري عيش، قال للبياع: لو عندك بيض، هات 10 أرغفة. البياع جاب 10. (اللي فاهم يضحك 😉)",
        "😂 ليه المبرمجين بيفضلوا الوضع الليلي (Dark Mode)؟ عشان النور بيجذب الـ Bugs!",
        "😂 واحد بيسأل مبرمج: الساعة كام؟ قاله: والله معرفش، بس هي شغالة عندي Local!",
        "😂 دكتور بيقول لطالب حاسب: ليه الكود مش شغال؟ قاله: والله يا دكتور كان شغال امبارح، تلاقيه نام!",
        "😂 مرة سيرفر وقع، محدش سمى عليه!",
        "😂 ايه قمة الحيرة للمبرمج؟ إنه يلاقي Comment بيقول // Do not touch this code وهو مش فاهم ليه!",
      ],
      en: [
        "😂 Why do programmers prefer dark mode? Because light attracts bugs!",
        "😂 A SQL query walks into a bar, walks up to two tables and asks... 'Can I join you?'",
        "😂 How many programmers does it take to change a light bulb? None, that's a hardware problem.",
        "😂 Why was the developer unhappy at their job? They wanted arrays.",
        "😂 I would tell you a UDP joke, but you might not get it.",
        "😂 There are 10 types of people in the world: those who understand binary, and those who don't.",
      ],
    },
  },

  // ==================== QUOTES & INSPIRATION ====================
  {
    questions: [
      "quote",
      "inspire me",
      "motivation",
      "wisdom",
      "حكمة",
      "اقتباس",
      "حفزني",
      "كلمة حلوة",
      "مقولة",
    ],
    answer: {
      ar: [
        "✨ 'من جد وجد، ومن زرع حصد.' - ابدأ الآن!",
        "✨ 'النجاح مش صدفة، النجاح هو الاستمرار لما الكل يوقف.'",
        "✨ 'لا تستصغر الخطوات البسيطة، الجبل أصله حصى.'",
        "✨ 'أفضل استثمار هو الاستثمار في نفسك وفي عقلك.'",
        "✨ 'التعليم هو السلاح الأقوى لتغيير العالم.' - نيلسون مانديلا",
      ],
      en: [
        "✨ 'The only way to do great work is to love what you do.' - Steve Jobs",
        "✨ 'It always seems impossible until it's done.' - Nelson Mandela",
        "✨ 'Believe you can and you're halfway there.'",
        "✨ 'Success is the sum of small efforts, repeated day in and day out.'",
      ],
    },
  },

  // ==================== TEAM & CREDITS ====================
  {
    questions: [
      "who made you",
      "developer",
      "creator",
      "team",
      "credits",
      "ahmed",
      "مين عملك",
      "المطور",
      "مين برمجك",
      "فريق العمل",
      "احمد",
      "مين انت",
    ],
    answer: {
      ar: [
        "💻 تم تطوير المنصة بواسطة **فريق مبدعي العبور** بقيادة **المهندس أحمد علاء**. مجهود شهور عشان راحتكم! ❤️",
        "🛠️ وراء الكواليس جنود مجهولين بقيادة المايسترو أحمد علاء الدين. شكراً لكل سطر كود اتكتب بحب! 🚀",
      ],
      en: [
        "💻 Built by **Obour Innovators Team** led by **Eng. Ahmed Alaa**. Months of hard work just for you! ❤️",
        "🛠️ Behind the scenes are unsung heroes led by Maestro Ahmed Alaa. Thanks for every line of code written with love! 🚀",
      ],
    },
  },
  {
    questions: ["love", "i love you", "marry me", "حب", "بحبك", "تتجوزيني"],
    answer: {
      ar: "😳 أنا بوت يا صديقي! بس بحب مساعدتك جداً. 💙",
      en: "😳 I'm a bot my friend! But I love helping you. 💙",
    },
  },
];
