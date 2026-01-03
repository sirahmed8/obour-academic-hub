// Quick reply suggestions for common questions
export const QUICK_REPLIES = [
  {
    id: "schedule",
    text_en: "📅 Class Schedule",
    text_ar: "📅 الجدول الدراسي",
    query: "What is the class schedule?",
  },
  {
    id: "fees",
    text_en: "💰 Tuition Fees",
    text_ar: "💰 المصروفات",
    query: "How much are the tuition fees?",
  },
  {
    id: "contact",
    text_en: "📞 Contact Info",
    text_ar: "📞 معلومات التواصل",
    query: "How can I contact the institute?",
  },
  {
    id: "exams",
    text_en: "📝 Exam Info",
    text_ar: "📝 معلومات الامتحانات",
    query: "Tell me about the exams",
  },
  {
    id: "library",
    text_en: "📚 Library Hours",
    text_ar: "📚 مواعيد المكتبة",
    query: "What are the library hours?",
  },
  {
    id: "wifi",
    text_en: "📶 WiFi Access",
    text_ar: "📶 الواي فاي",
    query: "How do I connect to WiFi?",
  },
];

// Export the quick reply type for use in components
export type QuickReply = (typeof QUICK_REPLIES)[number];
