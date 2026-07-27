"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  FileText,
  FileQuestion,
  Link as LinkIcon,
  Download,
  ExternalLink,
  Search,
  SearchX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { LoadingPage } from "@/components/ui/Loading";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { Subject, Resource } from "@/types";
import { subjectService } from "@/services/subject.service";
import { analyticsService } from "@/services/analytics.service";
import { userService } from "@/services/user.service";
import { useAuth, useLanguage } from "@/contexts";
import { errorLogger } from "@/lib/errorLogger";

import { getSubjectAnimation } from "@/lib/subjectIcons";

interface SubjectClientProps {
  subjectName?: string;
}

export function SubjectClient({ subjectName }: SubjectClientProps) {
  // ... existing hooks
  const { language } = useLanguage();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // ...

  // ...

  const handleResourceClick = (resource: Resource) => {
    if (user && subject) {
      analyticsService.logFileOpen(user.uid, resource.title, resource.url, subject.id);
    }
  };

  const handleMarkAsDone = async (resource: Resource) => {
    if (!user) return;
    const isCompleted = user.completedResources?.includes(resource.id);
    if (!isCompleted) {
      try {
        await userService.completeResource(user.uid, resource.id);
      } catch (err) {
        errorLogger.capture(err, { context: "Mark Resource Done" });
      }
    }
  };

  // ... in return JSX loop

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
  const [isHovered, setIsHovered] = useState(false);

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

          if (user) {
            analyticsService.logSubjectOpen(user.uid, data.id, data.name);
          }

          if (id) {
            // Increment views
            subjectService
              .incrementViews(id)
              .catch((err) => errorLogger.capture(err, { context: "Increment Views", id }));
          }
        } else {
          setFetchError(true);
        }
      } catch (err) {
        errorLogger.capture(err, { context: "Fetch Subject", subjectIdParam, finalSubjectName });
        if (!cancelled) setFetchError(true);
      }
      if (!cancelled) setLoading(false);
    };

    fetchSubject();

    return () => {
      cancelled = true;
    };
  }, [subjectIdParam, finalSubjectName, isPlaceholder, user]);

  // Separate effect for resources to handle the ID derived from name
  useEffect(() => {
    if (!subject?.id) return;

    const unsubscribe = subjectService.subscribeToResources(subject.id, (newResources) => {
      setResources(newResources);
    });

    return () => unsubscribe();
  }, [subject?.id]);

  if (loading) {
    return <LoadingPage />;
  }

  if (fetchError || !subject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground animate-in fade-in zoom-in duration-500">
        <div className="bg-muted p-6 rounded-full mb-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-full" />
          <SearchX size={64} className="relative z-10" />
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
            href="/main"
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
    );
  }

  // Resolve Lottie animation
  const IconComp = getSubjectAnimation(subject.icon || "BookOpen");

  // Check if subject.icon is a URL (image)
  const isImageIcon = subject.icon?.startsWith("http");

  const bgColorClass = subject.color || "bg-blue-500";

  return (
    <div className="p-6 lg:p-10 w-full space-y-8 page-transition">
      {/* Back Button */}
      <FadeIn>
        <Link
          href="/main"
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

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-6">
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="p-4 bg-white/20 rounded-2xl shadow-inner text-white cursor-pointer transition-transform hover:scale-105 duration-300 shrink-0"
            >
              {isImageIcon ? (
                <div className="relative w-10 h-10">
                  <Image
                    src={subject.icon!}
                    alt={subject.name}
                    fill
                    className="object-contain drop-shadow-md"
                  />
                </div>
              ) : (
                <AnimatedIcon
                  icon={IconComp}
                  iconName={subject.icon}
                  size={40}
                  active={isHovered}
                  useAnimation={true}
                />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black drop-shadow-md">
                {language === "ar" && subject.nameAr ? subject.nameAr : subject.name}
              </h1>
              <p className="text-white/90 mt-1 font-bold drop-shadow-sm">
                {language === "ar" ? "د." : "Dr."}{" "}
                {language === "ar" && subject.profNameAr ? subject.profNameAr : subject.profName}
              </p>
              {subject.description && (
                <p className="text-white/80 mt-3 max-w-xl font-medium drop-shadow-sm text-sm">
                  {subject.description}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              href={`/community?room=${subject.id}`}
              className="px-5 py-3 rounded-2xl bg-white text-black font-extrabold text-xs sm:text-sm hover:bg-white/90 transition shadow-lg inline-flex items-center gap-2"
            >
              <span>{language === "ar" ? "غرفة محادثة المادة" : "Subject Room Chat"}</span>
            </Link>
          </div>
        </div>

        {user && resources.length > 0 && (
          <div className="relative z-10 mt-6 max-w-sm">
            <div className="flex justify-between items-center mb-1 drop-shadow-sm">
              <span className="text-sm font-semibold text-white/90">
                {language === "ar" ? "نسبة الإنجاز" : "Completion Progress"}
              </span>
              <span className="text-sm font-bold text-white">
                {Math.round(
                  (resources.filter((r) => user.completedResources?.includes(r.id)).length /
                    resources.length) *
                    100
                )}
                %
              </span>
            </div>
            <div className="h-2.5 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
              <div
                className="h-full bg-white transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.round((resources.filter((r) => user.completedResources?.includes(r.id)).length / resources.length) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
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
                    <FileQuestion className="w-8 h-8 text-muted-foreground" />
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
                    "group bg-card p-5 rounded-2xl border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300",
                    resource.id === highlightedId &&
                      "ring-2 ring-primary ring-offset-2 animate-pulse",
                    user?.completedResources?.includes(resource.id) &&
                      "border-green-500/30 bg-green-500/5 dark:bg-green-500/10"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div
                        className={cn(
                          "p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110 duration-300",
                          resource.type === "pdf"
                            ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                            : resource.type === "video"
                              ? "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
                              : resource.type === "image"
                                ? "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                                : resource.type === "document"
                                  ? "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                                  : "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                        )}
                      >
                        {resource.type === "pdf" || resource.displayAsFile ? (
                          <FileText size={24} />
                        ) : (
                          <LinkIcon size={24} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {language === "ar" && resource.titleAr
                            ? resource.titleAr
                            : resource.title}
                        </h3>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground mt-0.5 truncate">
                            {language === "ar" && resource.descriptionAr
                              ? resource.descriptionAr
                              : resource.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {resource.type}
                          </span>
                          {resource.displayAsFile && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium">
                              {language === "ar" ? "ملف" : "File"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                      {/* Mark as Done Checkbox / Button */}
                      {user && (
                        <button
                          onClick={() => handleMarkAsDone(resource)}
                          disabled={user.completedResources?.includes(resource.id)}
                          className={cn(
                            "inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 shadow-sm border",
                            user.completedResources?.includes(resource.id)
                              ? "bg-green-500 text-white border-green-500 cursor-default"
                              : "bg-background text-muted-foreground border-border hover:border-green-500 hover:text-green-500 hover:bg-green-50 active:scale-95 dark:hover:bg-green-500/10"
                          )}
                          title={
                            user.completedResources?.includes(resource.id)
                              ? language === "ar"
                                ? "مكتمل"
                                : "Completed"
                              : language === "ar"
                                ? "تحديد كمكتمل"
                                : "Mark as Done"
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={cn(
                              "w-5 h-5",
                              user.completedResources?.includes(resource.id)
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100"
                            )}
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                      )}

                      {/* Prominent "Open" button */}
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleResourceClick(resource)}
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-semibold text-sm shadow-sm hover:shadow-lg hover:shadow-primary/20 active:scale-95"
                      >
                        {resource.type === "pdf" ? (
                          <>
                            <Download size={18} />
                            <span className="hidden sm:inline">
                              {language === "ar" ? "تحميل" : "Download"}
                            </span>
                          </>
                        ) : (
                          <>
                            <ExternalLink size={18} />
                            <span className="hidden sm:inline">
                              {language === "ar" ? "افتح" : "Open"}
                            </span>
                          </>
                        )}
                      </a>
                    </div>
                  </div>
                </ScaleIn>
              ))}
            </StaggerChildren>
          );
        })()}
      </div>
    </div>
  );
}
