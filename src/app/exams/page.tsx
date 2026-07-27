"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts";
import { BookOpen, Search, Download } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { motion } from "framer-motion";
import { toast } from "sonner";

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

const MOCK_EXAMS: PastExam[] = [
  {
    id: "1",
    titleAr: "امتحان منتصف الفصل الدراسي 2024 - البرمجة الهيكلية",
    titleEn: "Midterm Exam 2024 - OOP Programming",
    subject: "OOP Programming",
    year: "2024",
    type: "Midterm",
    downloadUrl: "#",
    hasAnswerKey: true,
  },
  {
    id: "2",
    titleAr: "امتحان نهاية الفصل الدراسي 2023 - قواعد البيانات",
    titleEn: "Final Exam 2023 - Databases",
    subject: "Databases",
    year: "2023",
    type: "Final",
    downloadUrl: "#",
    hasAnswerKey: true,
  },
];

export default function PastExamsPage() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [exams] = useState<PastExam[]>(MOCK_EXAMS);
  const [search, setSearch] = useState("");

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
        <div className="p-6 sm:p-10 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider">
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
        <div className="flex items-center px-4 py-3 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-md focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all duration-300">
          <Search className="text-muted-foreground shrink-0 mr-3" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isRtl ? "بحث اسم المادة أو السنة..." : "Search subject or year..."}
            className="w-full bg-transparent outline-none text-sm font-bold text-foreground"
          />
        </div>
      </ScaleIn>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredExams.map((exam) => (
          <ScaleIn key={exam.id}>
            <div className="p-6 rounded-3xl bg-card/60 border border-border/80 backdrop-blur-xl shadow-lg hover:border-primary/40 hover:shadow-primary/10 transition-all duration-500 space-y-4 flex flex-col justify-between group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-extrabold text-xs border border-primary/20">
                    {exam.type} • {exam.year}
                  </span>
                  {exam.hasAnswerKey && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[11px] border border-emerald-500/20 shadow-sm">
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
    </div>
  );
}
