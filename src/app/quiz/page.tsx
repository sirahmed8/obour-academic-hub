"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts";
import { HelpCircle, CheckCircle2, XCircle, Sparkles, Trophy, RefreshCw } from "lucide-react";
import { FadeIn, ScaleIn } from "@/components/ui/Animations";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface Question {
  id: string;
  questionAr: string;
  questionEn: string;
  options: string[];
  correctIndex: number;
  explanationAr: string;
  explanationEn: string;
}

interface Quiz {
  title: string;
  questions: Question[];
}

export default function QuizPage() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [subjectName, setSubjectName] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questionCount, setQuestionCount] = useState(5);

  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  // State during active quiz
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      toast.error(isRtl ? "يرجى كتابة اسم المادة الدراسية" : "Please enter a subject name");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<{ success: boolean; quiz: Quiz }>("/api/ai/generate-quiz", {
        method: "POST",
        body: {
          subjectName,
          topic,
          difficulty,
          questionCount,
        },
      });

      if (res?.quiz && res.quiz.questions?.length > 0) {
        setQuiz(res.quiz);
        setCurrentIndex(0);
        setSelectedAnswers({});
        setIsSubmitted(false);
        toast.success(
          isRtl ? "تمت توليد الاختبار التفاعلي بنجاح! 🎯" : "Quiz generated successfully! 🎯"
        );
      }
    } catch {
      toast.error(isRtl ? "حدث خطأ أثناء توليد الاختبار" : "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({ ...selectedAnswers, [currentIndex]: optIndex });
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header Banner */}
      <FadeIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl space-y-3 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider">
            <HelpCircle size={14} />
            <span>{isRtl ? "مولد الاختبارات الذكي" : "AI Quiz Generator"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground font-harman">
            {isRtl
              ? "اختبر معلوماتك الأكاديمية بالذكاء الاصطناعي 🎯"
              : "Practice & Master Subject Exams"}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-2xl">
            {isRtl
              ? "أنشئ اختبارات تفاعلية فورية لأي مادة دراسية مع التقييم والشرح التفصيلي للإجابات."
              : "Generate instant AI practice quizzes tailored to your institute subjects with step-by-step solutions."}
          </p>
        </div>
      </FadeIn>

      {!quiz ? (
        /* Quiz Generation Form */
        <ScaleIn>
          <form
            onSubmit={handleGenerateQuiz}
            className="p-6 sm:p-8 rounded-3xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-lg space-y-6"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  {isRtl ? "اسم المادة الدراسية *" : "Subject Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder={isRtl ? "مثال: برمجة هيكلية / قواعد بيانات" : "e.g. OOP / Databases"}
                  className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border/80 outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 focus:bg-background/80 hover:border-primary/40 transition-all duration-300 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  {isRtl ? "الموضوع المحدد (اختياري)" : "Specific Topic (Optional)"}
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={
                    isRtl
                      ? "مثال: المصفوفات / العلاقات في قواعد البيانات"
                      : "e.g. Arrays / SQL Joins"
                  }
                  className="w-full px-4 py-3 rounded-2xl bg-muted/50 border border-border/80 outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 focus:bg-background/80 hover:border-primary/40 transition-all duration-300 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    {isRtl ? "مستوى الصعوبة" : "Difficulty Level"}
                  </label>
                  <CustomSelect
                    value={difficulty}
                    onChange={(val) => setDifficulty(val as "easy" | "medium" | "hard")}
                    options={[
                      { value: "easy", label: isRtl ? "سهل 🟢" : "Easy 🟢" },
                      { value: "medium", label: isRtl ? "متوسط 🟡" : "Medium 🟡" },
                      { value: "hard", label: isRtl ? "متقدم 🔴" : "Hard 🔴" },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    {isRtl ? "عدد الأسئلة" : "Question Count"}
                  </label>
                  <CustomSelect
                    value={String(questionCount)}
                    onChange={(val) => setQuestionCount(parseInt(val, 10))}
                    options={[
                      { value: "3", label: isRtl ? "3 أسئلة" : "3 Questions" },
                      { value: "5", label: isRtl ? "5 أسئلة" : "5 Questions" },
                      { value: "10", label: isRtl ? "10 أسئلة" : "10 Questions" },
                    ]}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-extrabold text-sm hover:opacity-95 transition shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  <span>
                    {isRtl ? "جاري إنشاء الأسئلة بالذكاء الاصطناعي..." : "Generating Quiz..."}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{isRtl ? "إنشاء الاختبار الآن 🎯" : "Generate Quiz Now 🎯"}</span>
                </>
              )}
            </button>
          </form>
        </ScaleIn>
      ) : (
        /* Active Interactive Quiz Interface */
        <ScaleIn>
          <div className="p-6 sm:p-10 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <span className="text-xs font-black uppercase text-primary tracking-wider">
                {isRtl
                  ? `السؤال ${currentIndex + 1} من ${quiz.questions.length}`
                  : `Question ${currentIndex + 1} of ${quiz.questions.length}`}
              </span>

              {isSubmitted && (
                <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 font-black text-sm border border-emerald-500/20 flex items-center gap-1.5">
                  <Trophy size={16} />
                  <span>
                    {calculateScore()} / {quiz.questions.length}
                  </span>
                </div>
              )}
            </div>

            {/* Current Question Body */}
            {(() => {
              const q = quiz.questions[currentIndex];

              return (
                <div className="space-y-6">
                  {/* Progress Line */}
                  <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                      className="h-full bg-gradient-to-r from-primary via-indigo-500 to-purple-600 rounded-full"
                    />
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-foreground">
                    {isRtl ? q.questionAr : q.questionEn}
                  </h2>

                  <div className="space-y-3">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedAnswers[currentIndex] === optIdx;
                      const isCorrect = q.correctIndex === optIdx;

                      let btnStyle = "bg-muted/50 border-border hover:bg-muted text-foreground";
                      if (isSubmitted) {
                        if (isCorrect) {
                          btnStyle =
                            "bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-lg shadow-emerald-500/10";
                        } else if (isChosen) {
                          btnStyle =
                            "bg-destructive/20 border-destructive text-destructive font-extrabold shadow-lg shadow-destructive/10";
                        }
                      } else if (isChosen) {
                        btnStyle =
                          "bg-primary/20 border-primary text-primary font-extrabold ring-2 ring-primary/30 shadow-lg shadow-primary/10";
                      }

                      return (
                        <motion.button
                          key={optIdx}
                          type="button"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`w-full p-4 rounded-2xl border text-right sm:text-left transition-all duration-300 font-bold text-sm flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isSubmitted && isCorrect && (
                            <CheckCircle2
                              className="text-emerald-500 shrink-0 animate-bounce"
                              size={20}
                            />
                          )}
                          {isSubmitted && isChosen && !isCorrect && (
                            <XCircle className="text-destructive shrink-0" size={20} />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Answer Explanation Box when Submitted */}
                  {isSubmitted && (
                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-1">
                      <div className="text-xs font-black text-primary uppercase">
                        {isRtl ? "💡 التوضيح الشامل:" : "💡 Solution Explanation:"}
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
                        {isRtl ? q.explanationAr : q.explanationEn}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Navigation & Submit Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((c) => c - 1)}
                className="px-5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs disabled:opacity-40 transition"
              >
                {isRtl ? "السؤال السابق" : "Previous"}
              </button>

              {!isSubmitted ? (
                currentIndex === quiz.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(true)}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={16} />
                    <span>{isRtl ? "إنهاء وتسليم الاختبار" : "Submit Quiz"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((c) => c + 1)}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-xs transition"
                  >
                    {isRtl ? "السؤال التالي" : "Next"}
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => setQuiz(null)}
                  className="px-6 py-3 rounded-xl bg-primary text-white font-black text-xs transition flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  <span>{isRtl ? "إنشاء اختبار جديد" : "Create New Quiz"}</span>
                </button>
              )}
            </div>
          </div>
        </ScaleIn>
      )}
    </div>
  );
}
