"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { SubjectService } from "@/services/subject.service";
import { Subject } from "@/types";
import { SubjectCard } from "@/components/features/SubjectCard";
import { BookOpen, Search } from "lucide-react";
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
  const subjectService = SubjectService.getInstance();

  useEffect(() => {
    const unsubscribe = subjectService.getSubjects((data: Subject[]) => {
      setSubjects(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [subjectService]);

  const filtered = useMemo(() => {
    return subjects.filter((s) => {
      const name = language === "ar" && s.nameAr ? s.nameAr : s.name;
      return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [subjects, searchTerm, language]);

  return (
    <div className="p-6 lg:p-10 space-y-10 w-full page-transition aurora-bg min-h-screen">
      {/* Header */}
      <FadeIn>
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
            <BookOpen className="text-primary" size={36} />
            {t("nav.subjects")}
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-xl">
            {language === "ar"
              ? "تصفح جميع المواد الدراسية واستكشف المصادر المتاحة"
              : "Browse all your courses and explore available resources"}
          </p>
        </div>
      </FadeIn>

      {/* Search */}
      <FadeIn delay={0.15}>
        <div className="relative max-w-md" id="search-container">
          <div className="flex items-center w-full px-4 py-3 rounded-2xl bg-muted/50 border border-transparent focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
            <Search className="text-muted-foreground mr-3" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === "ar" ? "ابحث عن مادة..." : "Search subjects..."}
              className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </FadeIn>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-muted/20 rounded-4xl border-2 border-dashed border-border/50">
          <div className="bg-muted p-6 rounded-full w-fit mx-auto mb-6">
            <BookOpen size={64} className="text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">
            {searchTerm
              ? language === "ar"
                ? "لا توجد نتائج"
                : "No results found"
              : t("dashboard.noSubjects")}
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {searchTerm
              ? language === "ar"
                ? "جرب كلمات مختلفة"
                : "Try different keywords"
              : language === "ar"
                ? "لم يتم إضافة مواد بعد"
                : "No courses have been added yet."}
          </p>
        </div>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            ? "استخدم شريط البحث للعثور على موادك الدراسية بسرعة."
            : "Use the search bar to find your courses in seconds."
        }
        targetId="search-container"
        delay={2000}
      />
    </div>
  );
}
