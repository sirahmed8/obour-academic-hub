"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  increment,
} from "firebase/firestore";
import { Subject, Resource } from "@/types";
import { useLanguage } from "@/contexts";
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
  SortAsc,
} from "lucide-react";
import Link from "next/link";

export function SubjectClient() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  // Get ID from query param
  const subjectId = searchParams.get("id");
  const isPlaceholder = !subjectId;

  const [subject, setSubject] = useState<Subject | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(() => !isPlaceholder);
  const [fetchError, setFetchError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "name" | "type">("default");

  // Highlight from notification
  const highlightId = searchParams.get("highlight");
  const [highlightedId, setHighlightedId] = useState<string | null>(
    highlightId
  );
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
    // Skip effect entirely for placeholder
    if (isPlaceholder) return;

    let cancelled = false;

    const fetchSubject = async () => {
      try {
        const docRef = doc(db, "subjects", subjectId);
        const docSnap = await getDoc(docRef);
        if (cancelled) return;
        if (docSnap.exists()) {
          setSubject({ id: docSnap.id, ...docSnap.data() } as Subject);
        } else {
          setFetchError(true);
        }
      } catch {
        if (!cancelled) setFetchError(true);
      }
      if (!cancelled) setLoading(false);
    };

    fetchSubject();

    // Increment views
    updateDoc(doc(db, "subjects", subjectId), {
      views: increment(1),
    }).catch((err) => console.error("Error incrementing views:", err));

    // Resources subscription
    const q = query(
      collection(db, "subjects", subjectId, "resources"),
      orderBy("orderIndex")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setResources(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Resource))
      );
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [subjectId, isPlaceholder]);

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
            ID: {subjectId}
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
    (Icons as unknown as Record<string, React.ElementType>)[subject.icon] ||
    Icons.BookOpen;
  const bgColorClass = subject.color || "bg-blue-500";

  return (
    <AppShell>
      <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          {language === "ar" ? "العودة" : "Back"}
        </Link>

        {/* Header */}
        <div
          className={cn(
            "rounded-3xl p-8 text-white relative overflow-hidden",
            bgColorClass
          )}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex items-start gap-6">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <IconComponent size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-black">
                {language === "ar" && subject.nameAr
                  ? subject.nameAr
                  : subject.name}
              </h1>
              <p className="text-white/80 mt-2">
                {language === "ar" ? "د." : "Dr."}{" "}
                {language === "ar" && subject.profNameAr
                  ? subject.profNameAr
                  : subject.profName}
              </p>
              {subject.description && (
                <p className="text-white/70 mt-4 max-w-xl">
                  {subject.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="text-primary" />
            {language === "ar" ? "الموارد" : "Resources"} ({resources.length})
          </h2>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  language === "ar"
                    ? "بحث في الموارد..."
                    : "Search resources..."
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>
            <div className="relative">
              <SortAsc
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "default" | "name" | "type")
                }
                className="pl-10 pr-8 py-2.5 rounded-xl bg-muted/50 border border-border appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              >
                <option value="default">
                  {language === "ar" ? "الترتيب الافتراضي" : "Default Order"}
                </option>
                <option value="name">
                  {language === "ar" ? "الاسم" : "Name"}
                </option>
                <option value="type">
                  {language === "ar" ? "النوع" : "Type"}
                </option>
              </select>
            </div>
          </div>

          {(() => {
            // Filter and sort resources
            let filtered = resources.filter(
              (r) =>
                (r.title?.toLowerCase() || "").includes(
                  searchTerm.toLowerCase()
                ) ||
                (r.description?.toLowerCase() || "").includes(
                  searchTerm.toLowerCase()
                )
            );

            if (sortBy === "name") {
              filtered = [...filtered].sort((a, b) =>
                (a.title || "").localeCompare(b.title || "")
              );
            } else if (sortBy === "type") {
              filtered = [...filtered].sort((a, b) =>
                (a.type || "").localeCompare(b.type || "")
              );
            }

            if (filtered.length === 0) {
              return (
                <div className="text-center py-16 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
                  <FileText
                    size={48}
                    className="mx-auto text-muted-foreground mb-4"
                  />
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? language === "ar"
                        ? "لا توجد نتائج"
                        : "No results found"
                      : language === "ar"
                      ? "لا توجد موارد حالياً"
                      : "No resources available yet"}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {filtered.map((resource) => (
                  <div
                    key={resource.id}
                    ref={
                      resource.id === highlightedId ? highlightRef : undefined
                    }
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
                        {resource.type === "pdf" ? (
                          <FileText size={24} />
                        ) : (
                          <LinkIcon size={24} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {resource.title}
                        </h3>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground">
                            {resource.description}
                          </p>
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
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </AppShell>
  );
}
