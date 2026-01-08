"use client";

import { useState, useEffect } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Subject } from "@/types";
import { SubjectCard } from "@/components/features/SubjectCard";
import { getGreeting } from "@/lib/utils";
import { BookOpen, Sparkles } from "lucide-react";
import { StaggerChildren, ScaleIn } from "@/components/ui/Animations";

export function Dashboard() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { language, t } = useLanguage();
  const [greeting] = useState(() => getGreeting());

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
      <div className="relative rounded-3xl overflow-hidden isolation-auto transform-gpu will-change-transform shadow-2xl">
        {/* Ambient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-blue-500/10 dark:from-primary/10 dark:via-transparent dark:to-blue-900/10" />
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-primary/20 dark:bg-primary/10 rounded-full blur-[80px] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

        {/* Glass Content (Live Blur Applied) */}
        <div className="relative z-10 p-8 bg-white/10 dark:bg-black/10 backdrop-blur-xl backdrop-saturate-150 border border-white/20 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sparkles size={20} className="animate-pulse" />
            <span className="text-sm font-medium">
              {language === "ar" ? "معاهد العبور" : "Obour Academic Hub"}
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-foreground drop-shadow-sm">
            {language === "ar" ? greeting.ar : greeting.en}, {user?.displayName?.split(" ")[0]} 👋
          </h1>

          <p className="text-muted-foreground mt-2 text-lg font-medium">
            {language === "ar"
              ? "خليك متابع دروسك ومتفوتش أي حاجة جديدة!"
              : "Stay on top of your studies and don't miss anything new!"}
          </p>

          {isAdmin && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20 backdrop-blur-md shadow-sm">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              {language === "ar" ? "وضع المسؤول" : "Admin Mode"}
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
              <div key={i} className="bg-card rounded-2xl p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="skeleton w-16 h-16 rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                    <div className="skeleton h-3 w-full" />
                  </div>
                </div>
              </div>
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
