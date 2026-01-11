"use client";

import { useState, useEffect } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Subject } from "@/types";
import { SubjectCard } from "@/components/features/SubjectCard";
import { BookOpen, Sparkles } from "lucide-react";
import { StaggerChildren, ScaleIn } from "@/components/ui/Animations";
import { SkeletonCard } from "@/components/ui/Skeleton";

export function Dashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { language, t } = useLanguage();

  useEffect(() => {
    const q = query(collection(db, "subjects"), orderBy("orderIndex"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Subject
      );
      setSubjects(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6 lg:p-10 space-y-8 w-full page-transition">
      {/* Greeting Banner */}
      {/* Greeting Banner */}
      {/* Greeting Banner (Refined: Plain Solid Color - Darker) */}
      <div className="relative rounded-3xl overflow-hidden shadow-none bg-[#1a1b3a] border border-white/5">
        {/* Content */}
        <div className="relative z-10 p-8 lg:p-10 text-white">
          <div className="flex items-center gap-2 text-white/90 mb-3">
            <Sparkles size={20} className="text-yellow-300" />
            <span className="text-sm font-bold tracking-wide uppercase opacity-90">
              {t("dashboard.bannerTitle")}
            </span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2 drop-shadow-sm">
            {(() => {
              const text = t("dashboard.greeting");
              const hasPunctuation = /[!?.؟]$/.test(text);
              const separator = hasPunctuation ? "" : language === "ar" ? "،" : ",";
              return (
                <>
                  {text}
                  {separator} {user?.displayName?.split(" ")[0]} 👋
                </>
              );
            })()}
          </h1>

          <p className="text-white/80 text-lg font-medium max-w-2xl leading-relaxed">
            {t("dashboard.bannerSubtitle")}
          </p>

          {isAdmin && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-bold border border-white/20 backdrop-blur-md shadow-lg hover:bg-white/30 transition-colors">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full shadow-sm" />
              {t("dashboard.adminMode")}
            </div>
          )}
        </div>
      </div>

      {/* Subjects Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <BookOpen className="text-primary" />
            {t("dashboard.subjects")}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
            <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">{t("dashboard.noSubjects")}</p>
          </div>
        ) : (
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <ScaleIn key={subject.id}>
                <SubjectCard subject={subject} />
              </ScaleIn>
            ))}
          </StaggerChildren>
        )}
      </div>
    </div>
  );
}
