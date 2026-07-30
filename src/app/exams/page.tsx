"use client";

import { useState, useEffect } from "react";
import { useLanguage, useAuth } from "@/contexts";
import { BookOpen, Search, Download, Sparkles, Plus } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PastExam {
  id: string;
  titleAr: string;
  titleEn: string;
  subject: string;
  year: string;
  type: "Midterm" | "Final";
  downloadUrl: string;
  hasAnswerKey: boolean;
}

export default function PastExamsPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";

  const [exams, setExams] = useState<PastExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newYear, setNewYear] = useState("2024");
  const [newType, setNewType] = useState<"Midterm" | "Final">("Final");
  const [newUrl, setNewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadExams() {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "exams"), limit(20));
        const snap = await getDocs(q);
        const list: PastExam[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            titleAr: data.titleAr || data.title || "امتحان سابق",
            titleEn: data.titleEn || data.title || "Past Exam Paper",
            subject: data.subject || "General",
            year: data.year || "2024",
            type: data.type || "Final",
            downloadUrl: data.fileUrl || data.downloadUrl || "#",
            hasAnswerKey: data.hasAnswerKey ?? true,
          });
        });
        setExams(list);
      } catch (err) {
        console.error("Error loading past exams:", err);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  const handleUploadExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSubject.trim()) {
      toast.error(isRtl ? "يرجى كتابة عنوان الامتحان والمادة" : "Please fill title and subject");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        titleAr: newTitle,
        titleEn: newTitle,
        subject: newSubject,
        year: newYear || "2024",
        type: newType,
        downloadUrl: newUrl || "#",
        hasAnswerKey: true,
        createdBy: user?.uid || "guest",
        createdAt: serverTimestamp(),
      };

      if (db) {
        const docRef = await addDoc(collection(db, "exams"), payload);
        setExams([
          {
            id: docRef.id,
            ...payload,
          },
          ...exams,
        ]);
      } else {
        setExams([
          {
            id: "ex-" + Date.now(),
            ...payload,
          },
          ...exams,
        ]);
      }

      toast.success(isRtl ? "🎉 تم إضافة الامتحان بنجاح!" : "🎉 Exam added successfully!");
      setIsModalOpen(false);
      setNewTitle("");
      setNewSubject("");
      setNewUrl("");
    } catch (err) {
      console.error("Error adding exam:", err);
      toast.error(isRtl ? "فشل إضافة الامتحان" : "Failed to add exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExams = exams.filter(
    (e) =>
      e.titleAr.toLowerCase().includes(search.toLowerCase()) ||
      e.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider border border-primary/20">
              <BookOpen size={14} />
              <span>{isRtl ? "بنك امتحانات سنوات العبور السابقة" : "Past Exams Repository"}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-foreground font-harman">
              {isRtl
                ? "أرشيف امتحانات الميدتيرم والفاينل السابقة 📚"
                : "Obour Past Midterms & Finals Bank"}
            </h1>

            <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-2xl">
              {isRtl
                ? "ابحث عن امتحانات الاعوام السابقة لمعهد العبور مجهزة بالإجابات النموذجية."
                : "Searchable database of past exam papers with step-by-step solution guides."}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3.5 rounded-2xl bg-primary text-white font-extrabold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 shrink-0 hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            <span>{isRtl ? "إضافة نموذج امتحان" : "Upload Exam"}</span>
          </button>
        </div>
      </FadeIn>

      {/* Search Input */}
      <ScaleIn>
        <div className="flex items-center px-4 py-3 rounded-2xl bg-card border border-border shadow-md focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all duration-300">
          <Search className="text-muted-foreground shrink-0 me-3" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRtl ? "بحث اسم المادة أو السنة..." : "Search subject or year..."}
            className="w-full bg-transparent outline-none text-sm font-bold text-foreground"
          />
        </div>
      </ScaleIn>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="p-10 rounded-3xl bg-card border border-border text-center space-y-3 shadow-md">
          <Sparkles className="mx-auto text-primary w-10 h-10 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">
            {isRtl ? "لا توجد امتحانات سابقة حالياً" : "No past exams added yet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRtl
              ? "سيتم رفع ملفات امتحانات السنوات السابقة قريباً من الإدارة الأكاديمية."
              : "Past midterm and final exam papers will be uploaded soon by faculty."}
          </p>
        </div>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExams.map((exam) => (
            <ScaleIn key={exam.id}>
              <div className="p-6 rounded-3xl bg-card border border-border shadow-md hover:border-primary/40 hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between group">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-extrabold text-xs border border-primary/20">
                      {exam.type} • {exam.year}
                    </span>
                    {exam.hasAnswerKey && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/20 shadow-sm">
                        {isRtl ? "يتضمن الإجابات النموذجية ✅" : "Answer Key Included ✅"}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-lg text-foreground group-hover:text-primary transition-colors">
                    {isRtl ? exam.titleAr : exam.titleEn}
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground">{exam.subject}</p>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    toast.success(isRtl ? "جاري تحميل الملف..." : "Downloading exam PDF...")
                  }
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-extrabold text-xs transition-all duration-300 hover:opacity-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20"
                >
                  <Download size={16} />
                  <span>{isRtl ? "تحميل امتحان الـ PDF" : "Download Exam PDF"}</span>
                </motion.button>
              </div>
            </ScaleIn>
          ))}
        </StaggerChildren>
      )}

      {/* Upload Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-foreground">
                {isRtl ? "رفع نموذج امتحان جديد" : "Upload Past Exam"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadExam} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "عنوان الامتحان" : "Exam Title"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? "مثال: فاينل شبكات 2024" : "e.g. Final Networks 2024"}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl ? "المادة الدراسية" : "Subject"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isRtl ? "مثال: Computer Networks" : "e.g. Computer Networks"}
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    {isRtl ? "السنة الدراسية" : "Year"}
                  </label>
                  <input
                    type="text"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="2024"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">
                    {isRtl ? "نوع الامتحان" : "Exam Type"}
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as "Midterm" | "Final")}
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
                  >
                    <option value="Final">{isRtl ? "فاينل (Final)" : "Final Exam"}</option>
                    <option value="Midterm">{isRtl ? "ميدتيرم (Midterm)" : "Midterm Exam"}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  {isRtl
                    ? "رابط ملف الـ PDF (أو Drive / Cloudinary)"
                    : "PDF File URL (Drive / Cloudinary)"}
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground font-medium focus:ring-2 focus:ring-primary/40 outline-none"
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
                      ? "جاري الإضافة..."
                      : "Uploading..."
                    : isRtl
                      ? "حفظ الامتحان"
                      : "Save Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
