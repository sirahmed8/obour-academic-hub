"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SubjectService } from "@/services/subject.service";
import { Subject } from "@/types";
import { SubjectCard } from "@/components/features/SubjectCard";
import { BookOpen, Search, Filter, X, Sparkles, FolderCheck } from "lucide-react";
import { StaggerChildren, ScaleIn, FadeIn } from "@/components/ui/Animations";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useLanguage } from "@/contexts";
import { SubjectClient as SubjectDetail } from "./SubjectClient";
import { OnboardingHint } from "@/components/ui/OnboardingHints";

export default function SubjectHub() {
  const searchParams = useSearchParams();

  // If there's an id or name param, show the detail view
  const subjectId = searchParams.get("id");
  if (subjectId) {
    return <SubjectDetail />;
  }

  // Otherwise show browse view
  return <SubjectBrowser />;
}

function SubjectBrowser() {
  const { language, t } = useLanguage();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const subjectService = SubjectService.getInstance();

  useEffect(() => {
    const unsubscribe = subjectService.getSubjects((data: Subject[]) => {
      setSubjects(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [subjectService]);

  const categories = useMemo(
    () => [
      { id: "all", label: language === "ar" ? "جميع المواد" : "All Subjects" },
      { id: "year1", label: language === "ar" ? "الفرقة الأولى" : "Year 1" },
      { id: "year2", label: language === "ar" ? "الفرقة الثانية" : "Year 2" },
      { id: "year3", label: language === "ar" ? "الفرقة الثالثة" : "Year 3" },
      { id: "year4", label: language === "ar" ? "الفرقة الرابعة" : "Year 4" },
    ],
    [language]
  );

  const filtered = useMemo(() => {
    return subjects.filter((s) => {
      const name = (language === "ar" && s.nameAr ? s.nameAr : s.name) || "";
      const profName = (language === "ar" && s.profNameAr ? s.profNameAr : s.profName) || "";
      const query = searchTerm.toLowerCase().trim();

      const matchesSearch =
        name.toLowerCase().includes(query) || profName.toLowerCase().includes(query);

      if (selectedCategory === "all") return matchesSearch;
      const subjectWithYear = s as unknown as { year?: number; level?: number };
      if (selectedCategory === "year1")
        return matchesSearch && (subjectWithYear.year === 1 || subjectWithYear.level === 1);
      if (selectedCategory === "year2")
        return matchesSearch && (subjectWithYear.year === 2 || subjectWithYear.level === 2);
      if (selectedCategory === "year3")
        return matchesSearch && (subjectWithYear.year === 3 || subjectWithYear.level === 3);
      if (selectedCategory === "year4")
        return matchesSearch && (subjectWithYear.year === 4 || subjectWithYear.level === 4);

      return matchesSearch;
    });
  }, [subjects, searchTerm, selectedCategory, language]);

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition aurora-bg min-h-screen max-w-7xl mx-auto">
      {/* Header */}
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-card border border-border dark:bg-card shadow-md backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <BookOpen size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                  {t("nav.subjects")}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-primary/10 text-primary border border-primary/20">
                  {subjects.length} {language === "ar" ? "مادة" : "Courses"}
                </span>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-1">
                {language === "ar"
                  ? "تصفح جميع المواد الدراسية واستكشف المحاضرات والملخصات المتاحة"
                  : "Explore courses, lecture notes, and study resources"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-background/50 border border-border/50 text-xs font-bold text-muted-foreground">
              <FolderCheck size={16} className="text-emerald-500" />
              <span>{language === "ar" ? "محدث بالكامل" : "Fully Verified"}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-background/50 border border-border/50 text-xs font-bold text-muted-foreground">
              <Sparkles size={16} className="text-amber-500" />
              <span>{language === "ar" ? "ملخصات AI" : "AI Summaries"}</span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Search & Category Filter Bar */}
      <FadeIn delay={0.15}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1" id="search-container">
            <div className="flex items-center w-full px-4 py-3.5 rounded-2xl bg-card border border-border dark:bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
              <Search className="text-muted-foreground me-3 shrink-0" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  language === "ar"
                    ? "ابحث بأسماء المواد أو الدكاترة..."
                    : "Search by subject or professor..."
                }
                className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base placeholder:text-muted-foreground"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <div className="p-2 text-muted-foreground shrink-0">
              <Filter size={18} />
            </div>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-97 ${
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border dark:bg-card"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-card/30 backdrop-blur-xl rounded-4xl border-2 border-dashed border-border/50">
          <div className="bg-primary/10 p-6 rounded-full w-fit mx-auto mb-4 text-primary">
            <BookOpen size={48} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">
            {searchTerm
              ? language === "ar"
                ? "لا توجد نتائج بحث مطابقة"
                : "No matching subjects found"
              : t("dashboard.noSubjects")}
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            {searchTerm
              ? language === "ar"
                ? "جرب إدخال اسم مادة مختلف أو تغيير الفلتر المحدد"
                : "Try different keywords or reset your category filter."
              : language === "ar"
                ? "لم يتم إضافة مواد دراسية بعد."
                : "No courses have been added yet."}
          </p>

          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="px-5 py-2.5 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold transition-all shadow-sm"
            >
              {language === "ar" ? "إعادة ضبط البحث" : "Reset Search & Filters"}
            </button>
          )}
        </div>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((subject: Subject) => (
            <ScaleIn key={subject.id}>
              <SubjectCard subject={subject} />
            </ScaleIn>
          ))}
        </StaggerChildren>
      )}

      {/* Onboarding Hint */}
      <OnboardingHint
        id="subject-search-hint"
        title={language === "ar" ? "ابحث بسهولة" : "Search Made Easy"}
        description={
          language === "ar"
            ? "استخدم شريط البحث والفلاتر للعثور على موادك الدراسية بسرعة."
            : "Use the search bar and filters to find your courses in seconds."
        }
        targetId="search-container"
        delay={2000}
      />
    </div>
  );
}
