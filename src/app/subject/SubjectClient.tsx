"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Subject, Resource } from "@/types";
import { useLanguage } from "@/contexts";
import { subjectService } from "@/services/subject.service";
import { AppShell } from "@/components/layout/AppShell";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";

interface SubjectClientProps {
  subjectName?: string;
}

export function SubjectClient({ subjectName }: SubjectClientProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { language } = useLanguage();

  // Get ID from query param
  const subjectIdParam = searchParams.get("id");

  // Fallback: Try to get name from URL path if not provided prop
  // /subject/Computer%20Science -> Computer Science
  const pathName = pathname?.split("/subject/")[1];
  const decodedPathName = pathName ? decodeURIComponent(pathName) : undefined;

  const finalSubjectName = subjectName || decodedPathName;
  const isPlaceholder = !subjectIdParam && !finalSubjectName;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(() => !isPlaceholder);
  const [fetchError, setFetchError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "name" | "type">("default");

  // Highlight from notification
  const highlightId = searchParams.get("highlight");
  const [highlightedId, setHighlightedId] = useState<string | null>(highlightId);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Clear highlight after 3 seconds
  useEffect(() => {
    if (highlightedId) {
      const timer = setTimeout(() => setHighlightedId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedId]);

  // Scroll to highlighted element
  useEffect(() => {
    if (highlightedId && highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightedId, resources]);

  useEffect(() => {
    if (isPlaceholder) return;

    let cancelled = false;

    const fetchSubject = async () => {
      try {
        let data: Subject | null = null;
        let id = subjectIdParam;

        if (finalSubjectName) {
          data = await subjectService.getByName(finalSubjectName);
          if (data) id = data.id;
        } else if (subjectIdParam) {
          data = await subjectService.getById(subjectIdParam);
        }

        if (cancelled) return;

        if (data) {
          setSubject(data);

          if (id) {
            // Increment views
            subjectService
              .incrementViews(id)
              .catch((err) => console.error("Error incrementing views:", err));
          }
        } else {
          setFetchError(true);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setFetchError(true);
      }
      if (!cancelled) setLoading(false);
    };

    fetchSubject();

    return () => {
      cancelled = true;
    };
  }, [subjectIdParam, finalSubjectName, isPlaceholder]);

  // Separate effect for resources to handle the ID derived from name
  useEffect(() => {
    if (!subject?.id) return;

    const unsubscribe = subjectService.subscribeToResources(subject.id, (newResources) => {
      setResources(newResources);
    });

    return () => unsubscribe();
  }, [subject?.id]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      </AppShell>
    );
  }

  if (fetchError || !subject) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground animate-in fade-in zoom-in duration-500">
          <div className="bg-muted p-6 rounded-full mb-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-full" />
            <Icons.SearchX size={64} className="relative z-10" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {language === "ar" ? "المادة غير موجودة" : "Subject Not Found"}
          </h2>
          <p className="mb-6 max-w-md text-center">
            {language === "ar"
              ? "عذراً، لم نتمكن من العثور على المادة المطلوبة. ربما تم حذفها أو أن الرابط غير صحيح."
              : "Sorry, we couldn't find the page you're looking for."}
          </p>
          <p className="text-xs text-muted-foreground mb-4 font-mono bg-muted px-2 py-1 rounded">
            ID: {subjectIdParam || finalSubjectName}
          </p>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:scale-105 active:scale-95 transition-all font-medium shadow-lg shadow-primary/25"
            >
              {language === "ar" ? "الرئيسية" : "Go Home"}
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl transition-all font-medium"
            >
              {language === "ar" ? "رجوع" : "Go Back"}
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const IconComponent =
    (Icons as unknown as Record<string, React.ElementType>)[subject.icon] || Icons.BookOpen;
  const bgColorClass = subject.color || "bg-blue-500";

  return (
    <AppShell>
      <div className="p-6 lg:p-10 w-full space-y-8 page-transition">
        {/* Back Button */}
        <FadeIn>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            {language === "ar" ? "العودة" : "Back"}
          </Link>
        </FadeIn>

        {/* Header */}
        <ScaleIn
          className={cn(
            "rounded-3xl p-8 text-white relative overflow-hidden shadow-xl",
            bgColorClass
          )}
        >
          {/* Dark Overlay for Text Contrast */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />

          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex items-start gap-6">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
              <AnimatedIcon icon={IconComponent} iconName={subject.icon} size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black drop-shadow-md">
                {language === "ar" && subject.nameAr ? subject.nameAr : subject.name}
              </h1>
              <p className="text-white/90 mt-2 font-bold drop-shadow-sm">
                {language === "ar" ? "د." : "Dr."}{" "}
                {language === "ar" && subject.profNameAr ? subject.profNameAr : subject.profName}
              </p>
              {subject.description && (
                <p className="text-white/80 mt-4 max-w-xl font-medium drop-shadow-sm">
                  {subject.description}
                </p>
              )}
            </div>
          </div>
        </ScaleIn>

        {/* Resources -> Sources */}
        <div>
          <FadeIn delay={0.2} className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="text-primary" />
              {language === "ar" ? "المصادر" : "Sources"} ({resources.length})
            </h2>
          </FadeIn>

          {/* Search & Sort Controls */}
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1 group">
                {/* Search Container - Unified Border Logic */}
                <div className="flex items-center w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-transparent focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
                  <Search className="text-muted-foreground mr-2" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={language === "ar" ? "بحث في المصادر..." : "Search sources..."}
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div className="w-48">
                <CustomSelect
                  options={[
                    {
                      value: "default",
                      label: language === "ar" ? "الترتيب الافتراضي" : "Default Order",
                    },
                    {
                      value: "name",
                      label: language === "ar" ? "الاسم" : "Name",
                    },
                    {
                      value: "type",
                      label: language === "ar" ? "النوع" : "Type",
                    },
                  ]}
                  value={sortBy}
                  onChange={(val) => setSortBy(val as "default" | "name" | "type")}
                  placeholder={language === "ar" ? "الترتيب" : "Sort by"}
                />
              </div>
            </div>
          </FadeIn>

          {(() => {
            // Filter and sort resources
            let filtered = resources.filter(
              (r) =>
                (r.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (r.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
            );

            if (sortBy === "name") {
              filtered = [...filtered].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
            } else if (sortBy === "type") {
              filtered = [...filtered].sort((a, b) => (a.type || "").localeCompare(b.type || ""));
            }

            if (filtered.length === 0) {
              return (
                <FadeIn delay={0.4}>
                  <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icons.FileQuestion className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">
                      {searchTerm
                        ? language === "ar"
                          ? "لا توجد نتائج بحث"
                          : "No search results"
                        : language === "ar"
                          ? "لا توجد موارد بعد"
                          : "No resources found"}
                    </h3>
                    <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                      {searchTerm
                        ? language === "ar"
                          ? "جرب البحث بكلمات مختلفة أو تحقق من الكتابة."
                          : "Try different keywords or check your spelling."
                        : language === "ar"
                          ? "لم يتم إضافة أي موارد لهذه المادة حتى الآن. عد لاحقاً."
                          : "This subject has no resources yet. Check back later."}
                    </p>
                  </div>
                </FadeIn>
              );
            }

            return (
              <StaggerChildren className="space-y-4">
                {filtered.map((resource) => (
                  <ScaleIn
                    key={resource.id}
                    className={cn(
                      "group bg-card p-4 rounded-xl border border-border hover:shadow-lg transition-all flex items-center justify-between",
                      resource.id === highlightedId &&
                        "ring-2 ring-primary ring-offset-2 animate-pulse"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-xl",
                          resource.type === "pdf"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        )}
                      >
                        {resource.type === "pdf" ? <FileText size={24} /> : <LinkIcon size={24} />}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{resource.title}</h3>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        )}
                      </div>
                    </div>

                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {resource.type === "pdf" ? (
                        <Download size={20} />
                      ) : (
                        <ExternalLink size={20} />
                      )}
                    </a>
                  </ScaleIn>
                ))}
              </StaggerChildren>
            );
          })()}
        </div>
      </div>
    </AppShell>
  );
}
