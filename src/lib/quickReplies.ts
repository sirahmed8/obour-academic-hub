// Quick reply suggestions for common questions
export const QUICK_REPLIES = [
  {
    id: "schedule",
    text_en: "📅 Class Schedule",
    text_ar: "📅 الجدول الدراسي",
    query_en: "What is the class schedule?",
    query_ar: "ما هو جدول المحاضرات؟",
  },
  {
    id: "fees",
    text_en: "💰 Tuition Fees",
    text_ar: "💰 المصروفات",
    query_en: "How much are the tuition fees?",
    query_ar: "كم المصروفات الدراسية؟",
  },
  {
    id: "contact",
    text_en: "📞 Contact Info",
    text_ar: "📞 معلومات التواصل",
    query_en: "How can I contact the institute?",
    query_ar: "كيف أتواصل مع المعهد؟",
  },
  {
    id: "exams",
    text_en: "📝 Exam Info",
    text_ar: "📝 معلومات الامتحانات",
    query_en: "Tell me about the exams",
    query_ar: "أخبرني عن الامتحانات",
  },
  {
    id: "library",
    text_en: "📚 Library Hours",
    text_ar: "📚 مواعيد المكتبة",
    query_en: "What are the library hours?",
    query_ar: "ما هي مواعيد المكتبة؟",
  },
  {
    id: "wifi",
    text_en: "📶 WiFi Access",
    text_ar: "📶 الواي فاي",
    query_en: "How do I connect to WiFi?",
    query_ar: "كيف أتصل بالواي فاي؟",
  },
  {
    id: "study_tips",
    text_en: "📖 Study Tips",
    text_ar: "📖 نصائح للمذاكرة",
    query_en: "Give me study tips",
    query_ar: "أعطني نصائح للمذاكرة",
  },
  {
    id: "live_support",
    text_en: "💬 Talk to Human",
    text_ar: "💬 تحدث مع بشري",
    query_en: "I want to talk to a real person",
    query_ar: "أريد التحدث مع شخص حقيقي",
  },
];

// Export the quick reply type for use in components
export type QuickReply = (typeof QUICK_REPLIES)[number];
