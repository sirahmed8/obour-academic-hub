"use client";

import { useState, useEffect } from "react";
import { useLanguage, useAuth } from "@/contexts";
import { MessageSquare, ThumbsUp, ShieldCheck, Sparkles, Plus } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

export default function QAForumPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";

  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "questions"), limit(20));
        const snap = await getDocs(q);
        const list: QAQuestion[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            titleAr: data.titleAr || data.title || "استفسار أكاديمي",
            titleEn: data.titleEn || data.title || "Academic Question",
            subject: data.subject || "General",
            author: data.authorName || data.author || "Obour Student",
            upvotes: data.upvotes || 0,
            hasDoctorAnswer: !!data.doctorAnswer,
            doctorAnswerAr: data.doctorAnswerAr || data.doctorAnswer,
            doctorAnswerEn: data.doctorAnswerEn || data.doctorAnswer,
          });
        });
        setQuestions(list);
      } catch (err) {
        console.error("Error loading Q&A questions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  const handleUpvote = (id: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q)));
    toast.success(isRtl ? "تم تسجيل التصويت! 👍" : "Upvoted! 👍");
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSubject.trim()) {
      toast.error(isRtl ? "يرجى كتابة السؤال واختيار المادة" : "Please fill title and subject");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        titleAr: newTitle,
        titleEn: newTitle,
        subject: newSubject,
        authorName: user?.displayName || user?.email?.split("@")[0] || "Obour Student",
        authorId: user?.uid || "guest",
        upvotes: 0,
        createdAt: serverTimestamp(),
      };

      if (db) {
        const docRef = await addDoc(collection(db, "questions"), payload);
        setQuestions([
          {
            id: docRef.id,
            ...payload,
            author: payload.authorName,
            hasDoctorAnswer: false,
          },
          ...questions,
        ]);
      } else {
        setQuestions([
          {
            id: "q-" + Date.now(),
            ...payload,
            author: payload.authorName,
            hasDoctorAnswer: false,
          },
          ...questions,
        ]);
      }

      toast.success(isRtl ? "🎉 تم نشر السؤال بنجاح!" : "🎉 Question posted successfully!");
      setIsModalOpen(false);
      setNewTitle("");
      setNewSubject("");
    } catch (err) {
      console.error("Error posting question:", err);
      toast.error(isRtl ? "فشل نشر السؤال" : "Failed to post question");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider border border-primary/20">
              <MessageSquare size={14} />
              <span>{isRtl ? "منتدى الأسئلة الأكاديمية" : "Academic Q&A Forum"}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-foreground font-harman">
              {isRtl ? "منتدى الاستفسارات والإجابات المعتمدة 💬" : "Q&A & Faculty Discussion"}
            </h1>

            <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-2xl">
              {isRtl
                ? "طرح استفساراتك الأكاديمية ومراجعة إجابات أعضاء هيئة التدريس المعتمدة."
                : "Post academic questions, upvote discussions, and review answers from professors."}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-primary text-white font-extrabold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 shrink-0 hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            <span>{isRtl ? "طرح سؤال جديد" : "Ask Question"}</span>
          </button>
        </div>
      </FadeIn>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="p-10 rounded-3xl bg-card border border-border text-center space-y-3 shadow-md">
          <Sparkles className="mx-auto text-primary w-10 h-10 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">
            {isRtl ? "لا توجد أسئلة منشورة حالياً" : "No academic questions posted yet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRtl
              ? "كن أول من يطرح استفساراً أكاديمياً ليتلقى الإجابة من الأساتذة والطلاب."
              : "Be the first student to ask an academic question and get answered."}
          </p>
        </div>
      ) : (
        <StaggerChildren className="space-y-4">
          {questions.map((q) => (
            <ScaleIn key={q.id}>
              <div className="p-6 rounded-3xl bg-card border border-border shadow-md hover:border-primary/40 hover:shadow-xl transition-all duration-300 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-extrabold text-xs border border-primary/20">
                      {q.subject}
                    </span>
                    <h3 className="font-extrabold text-lg text-foreground mt-2">
                      {isRtl ? q.titleAr : q.titleEn}
                    </h3>
                    <p className="text-xs font-bold text-muted-foreground mt-1">
                      {isRtl ? `بواسطة: ${q.author}` : `By: ${q.author}`}
                    </p>
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleUpvote(q.id)}
                    className="px-4 py-2.5 rounded-2xl bg-primary/10 hover:bg-primary/20 border border-primary/20 font-black text-xs text-primary flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
                  >
                    <ThumbsUp size={14} className="text-primary" />
                    <span>{q.upvotes}</span>
                  </motion.button>
                </div>

                {q.hasDoctorAnswer && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 shadow-sm">
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
      )}

      {/* Ask Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-foreground">
                {isRtl ? "طرح سؤال أكاديمي جديد" : "Ask Academic Question"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAskQuestion} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "المادة الدراسية" : "Subject Name"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    isRtl ? "مثال: قواعد بيانات / شبكات" : "e.g. Databases / Computer Networks"
                  }
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "سؤالك الأكاديمي أو التفاصيل" : "Your Question / Inquiry Details"}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={
                    isRtl
                      ? "اكتب سؤالك بالتفصيل ليتسنى للأساتذة والزملاء الإجابة..."
                      : "Describe your inquiry in detail for faculty and peers..."
                  }
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-border font-bold text-muted-foreground hover:bg-muted"
                >
                  {isRtl ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-extrabold shadow-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting
                    ? isRtl
                      ? "جاري النشر..."
                      : "Posting..."
                    : isRtl
                      ? "نشر السؤال"
                      : "Post Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
