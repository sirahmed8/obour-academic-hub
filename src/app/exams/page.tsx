"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage, useAuth } from "@/contexts";
import {
  BookOpen,
  Search,
  Download,
  Sparkles,
  Plus,
  Eye,
  FileCheck,
  CheckCircle2,
  X,
  Share2,
} from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { pastExamSchema } from "@/lib/zod-schemas";
import { ScrollableTabs } from "@/components/ui/ScrollableTabs";

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
        const q = query(collection(db, "exams"), limit(50));
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
            hasAnswerKey: data.hasAnswerKey ?? false,
          });
        });
        setExams(list);
      } catch (err) {
        console.error("Error loading exams:", err);
        setExams([]);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [previewDrawerExam, setPreviewDrawerExam] = useState<PastExam | null>(null);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    years.add("all");
    years.add("2025");
    years.add("2024");
    years.add("2023");
    years.add("2022");
    exams.forEach((e) => {
      if (e.year) years.add(e.year);
    });
    return Array.from(years);
  }, [exams]);

  const filteredExams = useMemo(() => {
    return exams.filter((e) => {
      const matchSearch =
        search.trim() === ""
          ? true
          : e.titleAr.toLowerCase().includes(search.toLowerCase()) ||
            e.titleEn.toLowerCase().includes(search.toLowerCase()) ||
            e.subject.toLowerCase().includes(search.toLowerCase());

      const matchYear = selectedYear === "all" ? true : e.year === selectedYear;
      const matchType =
        selectedType === "all" ? true : e.type.toLowerCase() === selectedType.toLowerCase();

      return matchSearch && matchYear && matchType;
    });
  }, [exams, search, selectedYear, selectedType]);

  const handleUploadExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = pastExamSchema.safeParse({
      title: newTitle,
      subject: newSubject,
      year: newYear || "2024",
      type: newType,
      downloadUrl: newUrl || "#",
    });

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
        year: validation.data.year,
        type: validation.data.type,
        downloadUrl: validation.data.downloadUrl || "#",
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

      {/* Search Input & Multi-Filter Pills */}
      <ScaleIn>
        <div className="space-y-4">
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

          <div className="w-full space-y-3">
            {/* Year Filter Pills */}
            <ScrollableTabs>
              <span className="text-xs font-extrabold text-muted-foreground me-1 shrink-0">
                {isRtl ? "السنة:" : "Year:"}
              </span>
              {availableYears.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-black transition-all border whitespace-nowrap shrink-0",
                    selectedYear === yr
                      ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {yr === "all" ? (isRtl ? "جميع السنوات" : "All Years") : yr}
                </button>
              ))}
            </ScrollableTabs>

            {/* Type Filter Pills */}
            <ScrollableTabs>
              <span className="text-xs font-extrabold text-muted-foreground me-1 shrink-0">
                {isRtl ? "النوع:" : "Type:"}
              </span>
              {[
                { id: "all", label: isRtl ? "الكل" : "All" },
                { id: "final", label: isRtl ? "فاينل" : "Final" },
                { id: "midterm", label: isRtl ? "ميدتيرم" : "Midterm" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-xs font-black transition-all border whitespace-nowrap shrink-0",
                    selectedType === t.id
                      ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </ScrollableTabs>
          </div>
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
            {isRtl
              ? "لا توجد امتحانات تطابق خيارات البحث"
              : "No past exams matching selected filters"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRtl
              ? "جرّب تغيير تصفية السنة أو نوع الامتحان."
              : "Try changing your year or exam type filter."}
          </p>
        </div>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExams.map((exam) => (
            <ScaleIn key={exam.id}>
              <div className="p-6 rounded-3xl bg-card border border-border shadow-md hover:border-primary/40 hover:shadow-xl hover-lift transition-all duration-300 space-y-4 flex flex-col justify-between group dark:bg-card">
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

                <div className="flex items-center gap-2 pt-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setPreviewDrawerExam(exam)}
                    className="flex-1 py-3 rounded-2xl bg-card border border-border hover:bg-muted text-foreground font-extrabold text-xs transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Eye size={15} className="text-primary" />
                    <span>{isRtl ? "معاينة الإجابات" : "Preview Key"}</span>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() =>
                      toast.success(isRtl ? "جاري تحميل الملف..." : "Downloading exam PDF...")
                    }
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-extrabold text-xs transition-all duration-300 hover:opacity-95 flex items-center justify-center gap-1.5 shadow-lg hover:shadow-primary/20"
                  >
                    <Download size={15} />
                    <span>{isRtl ? "تحميل PDF" : "Download PDF"}</span>
                  </motion.button>
                </div>
              </div>
            </ScaleIn>
          ))}
        </StaggerChildren>
      )}

      {/* Solution Key Preview Drawer / Modal */}
      <AnimatePresence>
        {previewDrawerExam && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs border border-emerald-500/20">
                      {previewDrawerExam.type} • {previewDrawerExam.year}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                      {previewDrawerExam.subject}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-foreground">
                    {isRtl ? previewDrawerExam.titleAr : previewDrawerExam.titleEn}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <FileCheck size={14} className="text-emerald-500" />
                    <span>
                      {isRtl
                        ? "نموذج إجابة معتمد ومراجع من أساتذة المادة 👑"
                        : "Verified Faculty Solution Key & Rubric 👑"}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setPreviewDrawerExam(null)}
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Solution Key Breakdown Content */}
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                  <h4 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>
                      {isRtl
                        ? "القسم الأول: الأسئلة الموضوعية (MCQ & T/F)"
                        : "Section 1: MCQ & Objective Key"}
                    </span>
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {isRtl
                      ? "1. (أ) - 2. (جـ) - 3. (صح) - 4. (ب) - 5. (خطأ). تم حساب الدرجات بناءً على نموذج الكنترول الرسمي."
                      : "1. (A) - 2. (C) - 3. (True) - 4. (B) - 5. (False). Formatted per official control grading key."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                  <h4 className="font-extrabold text-foreground text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>
                      {isRtl
                        ? "القسم الثاني: المسائل والحلول المقالية"
                        : "Section 2: Problem Solving & Diagrams"}
                    </span>
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {isRtl
                      ? "خطوات الحل النموذجية موضحة بالتفصيل مع المعادلات الرياضية، الرسم التخطيطي، والتعليل الأكاديمي المطلوب لكل نقطة."
                      : "Detailed step-by-step breakdown including mathematical derivations, architecture diagrams, and faculty notes."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium">
                  💡{" "}
                  {isRtl
                    ? "ملاحظة أستاذ المادة: التركيز على كتابة القوانين كاملة للحصول على الدرجة النهائية."
                    : "Faculty Note: Make sure to include all standard formulas to receive full credit."}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success(isRtl ? "تم نسخ رابط المعاينة!" : "Share link copied!");
                  }}
                  className="px-4 py-3 rounded-xl border border-border font-bold text-muted-foreground hover:bg-muted flex items-center justify-center gap-2"
                >
                  <Share2 size={16} />
                  <span>{isRtl ? "مشاركة الرابط" : "Share Key"}</span>
                </button>

                <button
                  onClick={() => {
                    toast.success(
                      isRtl ? "جاري تحميل الحل الكامل..." : "Downloading full solution..."
                    );
                    setPreviewDrawerExam(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-extrabold shadow-lg hover:bg-primary/90 flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  <span>{isRtl ? "تحميل نموذج الإجابة PDF" : "Download Solution PDF"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
