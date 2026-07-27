"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts";
import { MessageSquare, ThumbsUp, ShieldCheck } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";

import { toast } from "sonner";

interface QAQuestion {
  id: string;
  titleAr: string;
  titleEn: string;
  subject: string;
  author: string;
  upvotes: number;
  hasDoctorAnswer: boolean;
  doctorAnswerAr?: string;
  doctorAnswerEn?: string;
}

const MOCK_QUESTIONS: QAQuestion[] = [
  {
    id: "1",
    titleAr: "ما الفرق الأساسي بين الـ Interface والـ Abstract Class في الجافا؟",
    titleEn: "What is the primary difference between Interface and Abstract Class in Java?",
    subject: "OOP Programming",
    author: "عمر خالد",
    upvotes: 24,
    hasDoctorAnswer: true,
    doctorAnswerAr:
      "إجابة د. أحمد كمال: الـ Interface يدعم الوراثة المتعددة متعددة الواجهات بينما الـ Abstract Class يتيح تعريف دوال بحالتها الافتراضية.",
    doctorAnswerEn:
      "Dr. Ahmed's Answer: Interfaces support multiple implementation inheritance whereas Abstract Classes hold default state.",
  },
  {
    id: "2",
    titleAr: "كيف يمكن تحسين استعلامات الـ SQL Join الكبيرة؟",
    titleEn: "How to optimize heavy SQL Join queries?",
    subject: "Databases",
    author: "منى علي",
    upvotes: 18,
    hasDoctorAnswer: true,
    doctorAnswerAr:
      "إجابة المعيد: باستخدام الفهارس (Indexes) على الأعمدة المستخدمة في الـ JOIN شروط الربط.",
    doctorAnswerEn: "TA Answer: Use B-Tree indexes on join key attributes.",
  },
];

export default function QAForumPage() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [questions, setQuestions] = useState<QAQuestion[]>(MOCK_QUESTIONS);

  const handleUpvote = (id: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q)));
    toast.success(isRtl ? "تم تسجيل التصويت! 👍" : "Upvoted! 👍");
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <FadeIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider">
            <MessageSquare size={14} />
            <span>{isRtl ? "منتدى أسئلة وأجوبة الأساتذة" : "Doctor & TA Q&A Board"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground font-harman">
            {isRtl
              ? "طرح الأسئلة الأكاديمية وإجابات الدكاترة المعروضة 💬"
              : "Academic Q&A & Verified Doctor Answers"}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-2xl">
            {isRtl
              ? "طرح استفساراتك الأكاديمية ومراجعة إجابات أعضاء هيئة التدريس المعتمدة."
              : "Post academic questions, upvote discussions, and review answers from professors."}
          </p>
        </div>
      </FadeIn>

      <StaggerChildren className="space-y-4">
        {questions.map((q) => (
          <ScaleIn key={q.id}>
            <div className="p-6 rounded-3xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-lg space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {q.subject}
                  </span>
                  <h3 className="font-extrabold text-lg text-foreground mt-2">
                    {isRtl ? q.titleAr : q.titleEn}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground mt-1">
                    {isRtl ? `بواسطة: ${q.author}` : `By: ${q.author}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpvote(q.id)}
                  className="px-3 py-2 rounded-2xl bg-muted hover:bg-muted/80 font-black text-xs text-foreground flex items-center gap-1.5 shrink-0"
                >
                  <ThumbsUp size={14} className="text-primary" />
                  <span>{q.upvotes}</span>
                </button>
              </div>

              {q.hasDoctorAnswer && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck size={16} />
                    <span>
                      {isRtl ? "إجابة معتمدة من هيئة التدريس 👑" : "Verified Staff Answer 👑"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
                    {isRtl ? q.doctorAnswerAr : q.doctorAnswerEn}
                  </p>
                </div>
              )}
            </div>
          </ScaleIn>
        ))}
      </StaggerChildren>
    </div>
  );
}
