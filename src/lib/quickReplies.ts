// Quick reply suggestions - Reduced to 4 most useful
export const QUICK_REPLIES = [
  {
    id: "subjects",
    text_en: "📚 Browse Subjects",
    text_ar: "📚 تصفح المواد",
    query_en: "How can I browse subjects and materials?",
    query_ar: "كيف أتصفح المواد والملفات؟",
  },
  {
    id: "exams",
    text_en: "📝 Exam Tips",
    text_ar: "📝 نصائح الامتحانات",
    query_en: "Give me exam tips and where to find past exams",
    query_ar: "أعطني نصائح للامتحانات وأين أجد التجميعات",
  },
  {
    id: "study_tips",
    text_en: "📖 Study Tips",
    text_ar: "📖 نصائح المذاكرة",
    query_en: "Give me effective study tips",
    query_ar: "أعطني نصائح فعالة للمذاكرة",
  },
  {
    id: "live_support",
    text_en: "💬 Live Support",
    text_ar: "💬 الدعم المباشر",
    query_en: "I want to talk to live support",
    query_ar: "أريد التحدث مع الدعم المباشر",
  },
];

// Export the quick reply type for use in components
export type QuickReply = (typeof QUICK_REPLIES)[number];
