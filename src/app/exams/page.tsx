"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts";
import { BookOpen, Search, Download, Sparkles } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { collection, getDocs, query, limit } from "firebase/firestore";
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
  const isRtl = language === "ar";

  const [exams, setExams] = useState<PastExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
        <div className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xl space-y-3">
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
    </div>
  );
}
