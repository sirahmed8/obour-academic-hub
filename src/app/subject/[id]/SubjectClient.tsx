"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
} from "lucide-react";
import Link from "next/link";

export function SubjectClient() {
  const params = useParams();
  const { language } = useLanguage();

  // Compute placeholder check inline (stable across renders)
  const subjectId = params.id as string | undefined;
  const isPlaceholder = !subjectId || subjectId === "placeholder";

  const [subject, setSubject] = useState<Subject | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  // If placeholder, start with loading = false
  const [loading, setLoading] = useState(() => !isPlaceholder);
  const [fetchError, setFetchError] = useState(false);

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

  if (isPlaceholder || fetchError) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
          <div className="text-8xl mb-4">📚</div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {language === "ar" ? "المادة غير موجودة" : "Subject Not Found"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === "ar"
              ? "عذراً، المادة التي تبحث عنها غير متوفرة."
              : "Sorry, the subject you are looking for does not exist."}
          </p>
          <Link
            href="/main"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            {language === "ar" ? "العودة للصفحة الرئيسية" : "Back to Home"}
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!subject) return null;

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
              <h1 className="text-3xl font-black">{subject.name}</h1>
              <p className="text-white/80 mt-2">
                {language === "ar" ? "د." : "Dr."} {subject.profName}
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
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <FileText className="text-primary" />
            {language === "ar" ? "الموارد" : "Resources"} ({resources.length})
          </h2>

          {resources.length === 0 ? (
            <div className="text-center py-16 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
              <FileText
                size={48}
                className="mx-auto text-muted-foreground mb-4"
              />
              <p className="text-muted-foreground">
                {language === "ar"
                  ? "لا توجد موارد حالياً"
                  : "No resources available yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resources.map((resource) => (
                <div
                  key={resource.id}
                  className="group bg-card p-4 rounded-xl border border-border hover:shadow-lg transition-all flex items-center justify-between"
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
          )}
        </div>
      </div>
    </AppShell>
  );
}
