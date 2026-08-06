"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage, useAuth } from "@/contexts";
import { MessageSquare, ThumbsUp, ShieldCheck, Sparkles, Plus, Search } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ScrollableTabs } from "@/components/ui/ScrollableTabs";
import {
  collection,
  getDocs,
  query,
  limit,
  addDoc,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { qaQuestionSchema } from "@/lib/zod-schemas";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [upvotedIds, setUpvotedIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`upvoted_questions_${user?.uid || "guest"}`);
      if (saved) {
        try {
          setUpvotedIds(JSON.parse(saved));
        } catch {
          // ignore
        }
      }
    }
  }, [user?.uid]);

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

  const handleUpvote = async (id: string) => {
    const isUpvoted = upvotedIds.includes(id);
    const diff = isUpvoted ? -1 : 1;

    // Optimistic UI update
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, upvotes: Math.max(0, q.upvotes + diff) } : q))
    );

    const newUpvoted = isUpvoted ? upvotedIds.filter((item) => item !== id) : [...upvotedIds, id];
    setUpvotedIds(newUpvoted);

    if (typeof window !== "undefined") {
      localStorage.setItem(`upvoted_questions_${user?.uid || "guest"}`, JSON.stringify(newUpvoted));
    }

    if (isUpvoted) {
      toast.info(isRtl ? "تم إلغاء التصويت" : "Upvote removed");
    } else {
      toast.success(isRtl ? "تم تسجيل التصويت! 👍" : "Upvoted! 👍");
    }

    // Persist to Firestore if available
    if (db && !id.startsWith("q-")) {
      try {
        await updateDoc(doc(db, "questions", id), {
          upvotes: increment(diff),
        });
      } catch (err) {
        console.error("Failed to update upvote doc in Firestore:", err);
      }
    }
  };

  // Dynamic Subject list
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    set.add("all");
    questions.forEach((q) => {
      if (q.subject) set.add(q.subject);
    });
    // add defaults if empty
    set.add("General");
    set.add("Databases");
    set.add("Networks");
    return Array.from(set);
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSub =
        selectedSubject === "all"
          ? true
          : q.subject.toLowerCase() === selectedSubject.toLowerCase();
      const matchSearch =
        searchQuery.trim() === ""
          ? true
          : q.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSub && matchSearch;
    });
  }, [questions, selectedSubject, searchQuery]);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = qaQuestionSchema.safeParse({ title: newTitle, subject: newSubject });
    if (!validation.success) {
      toast.error(
        validation.error.issues[0]?.message || (isRtl ? "بيانات غير صالحة" : "Invalid input")
      );
      return;
    }
    const sanitizedTitle = validation.data.title;
    const sanitizedSubject = validation.data.subject;

    setIsSubmitting(true);
    try {
      const payload = {
        titleAr: sanitizedTitle,
        titleEn: sanitizedTitle,
        subject: sanitizedSubject,
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

      {/* Search & Subject Tag Filter Bar */}
      <ScaleIn>
        <div className="space-y-4">
          <div className="flex items-center px-4 py-3 rounded-2xl bg-card border border-border shadow-md focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all duration-300">
            <Search className="text-muted-foreground shrink-0 me-3" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isRtl ? "ابحث بداخل الأسئلة والمواد..." : "Search questions or subjects..."
              }
              className="w-full bg-transparent outline-none text-sm font-bold text-foreground"
            />
          </div>

          <ScrollableTabs>
            {availableSubjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-black transition-all border whitespace-nowrap shrink-0",
                  selectedSubject.toLowerCase() === sub.toLowerCase()
                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {sub === "all" ? (isRtl ? "جميع المواد" : "All Subjects") : sub}
              </button>
            ))}
          </ScrollableTabs>
        </div>
      </ScaleIn>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="p-10 rounded-3xl bg-card border border-border text-center space-y-3 shadow-md">
          <Sparkles className="mx-auto text-primary w-10 h-10 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">
            {isRtl ? "لا توجد أسئلة تطابق البحث" : "No academic questions matching search"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRtl
              ? "جرّب البحث بكلمات أخرى أو اختر مادة مختلفة."
              : "Try searching with different keywords or select another subject."}
          </p>
        </div>
      ) : (
        <StaggerChildren className="space-y-4">
          {filteredQuestions.map((q) => (
            <ScaleIn key={q.id}>
              <div className="p-6 rounded-3xl bg-card border border-border shadow-md hover:border-primary/40 hover:shadow-xl hover-lift transition-all duration-300 space-y-4 dark:bg-card">
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
                    className={cn(
                      "px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all border",
                      upvotedIds.includes(q.id)
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/25"
                        : "bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary"
                    )}
                  >
                    <ThumbsUp
                      size={14}
                      className={
                        upvotedIds.includes(q.id) ? "fill-current text-white" : "text-primary"
                      }
                    />
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
