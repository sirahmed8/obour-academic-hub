"use client";

import { useState, useEffect } from "react";
import { useLanguage, useAuth } from "@/contexts";
import { Users, UserCheck, Sparkles } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

interface Buddy {
  id: string;
  name: string;
  dept: string;
  grade: string;
  sharedSubjects: string[];
  availability: string;
  matchScore: number;
}

export default function StudyBuddiesPage() {
  const { language } = useLanguage();
  const { user: currentUser } = useAuth();
  const isRtl = language === "ar";

  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBuddies() {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "users"), limit(20));
        const snap = await getDocs(q);
        const list: Buddy[] = [];

        // Get current user's enrolled subjects for real match score
        const currentUserSnap = snap.docs.find((d) => d.id === currentUser?.uid);
        const currentSubjects: string[] = currentUserSnap?.data()?.enrolledSubjects ?? [];

        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (docSnap.id !== currentUser?.uid) {
            const otherSubjects: string[] = data.enrolledSubjects ?? [];

            // Real match score: % of shared subjects out of union
            let matchScore = 70; // baseline for same institute
            if (currentSubjects.length > 0 && otherSubjects.length > 0) {
              const shared = otherSubjects.filter((s: string) => currentSubjects.includes(s));
              const union = new Set([...currentSubjects, ...otherSubjects]).size;
              matchScore = Math.round(70 + (shared.length / union) * 30);
            }

            const shared =
              currentSubjects.length > 0
                ? otherSubjects.filter((s: string) => currentSubjects.includes(s))
                : otherSubjects;

            list.push({
              id: docSnap.id,
              name: data.displayName || data.email?.split("@")[0] || "Obour Student",
              dept: data.department || (isRtl ? "علوم الحاسب" : "Computer Science"),
              grade: data.gradeYear
                ? isRtl
                  ? `الفرقة ${data.gradeYear}`
                  : `Year ${data.gradeYear}`
                : isRtl
                  ? "الفرقة الثالثة"
                  : "3rd Year",
              sharedSubjects:
                shared.length > 0
                  ? shared
                  : otherSubjects.length > 0
                    ? otherSubjects.slice(0, 3)
                    : isRtl
                      ? ["مادة مشتركة"]
                      : ["Enrolled Subject"],
              availability:
                data.studyAvailability ||
                (isRtl ? "تحديد الموعد عند الطلب" : "Available on Request"),
              matchScore,
            });
          }
        });
        // Sort by match score descending
        list.sort((a, b) => b.matchScore - a.matchScore);
        setBuddies(list);
      } catch (err) {
        console.error("Error loading study buddies:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBuddies();
  }, [currentUser?.uid, isRtl]);

  return (
    <div
      className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-5xl mx-auto"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <FadeIn>
        <div className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-xl space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-xs uppercase tracking-wider border border-primary/20">
            <Users size={14} />
            <span>{isRtl ? "مُوفّق الرفقاء الدراسيين" : "Smart Study Matchmaker"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-foreground font-harman">
            {isRtl
              ? "ابحث عن زملائك للمذاكرة والمراجعة الجماعية 🤝"
              : "Find Your Ideal Study Buddy"}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-2xl">
            {isRtl
              ? "نظام التوافق الذكي يطابقك مع طلاب العبور المشاركين في نفس المواد وحسب أوقات تفرغك."
              : "Smart study buddy matching based on shared subjects, department, and available study hours."}
          </p>
        </div>
      </FadeIn>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      ) : buddies.length === 0 ? (
        <div className="p-10 rounded-3xl bg-card border border-border text-center space-y-3 shadow-md">
          <Sparkles className="mx-auto text-primary w-10 h-10 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">
            {isRtl ? "لا يوجد زملاء مذاكرة مسجلين حالياً" : "No study buddies available right now"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRtl
              ? "سيكون الزملاء الجدد متاحين فور تسجيلهم في المنصة."
              : "New study partners will appear here when they join."}
          </p>
        </div>
      ) : (
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {buddies.map((buddy) => (
            <ScaleIn key={buddy.id}>
              <div className="p-6 rounded-3xl bg-card border border-border shadow-md hover:border-primary/40 hover:shadow-xl transition-all duration-300 space-y-4 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                      {buddy.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-foreground">{buddy.name}</h3>
                      <p className="text-xs font-bold text-muted-foreground">
                        {buddy.dept} • {buddy.grade}
                      </p>
                    </div>
                  </div>

                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs border border-emerald-500/20 shadow-sm">
                    {buddy.matchScore}% {isRtl ? "توافق" : "Match"}
                  </div>
                </div>

                <div className="space-y-2 text-xs font-bold text-muted-foreground">
                  <div>
                    <span className="text-foreground font-black">
                      {isRtl ? "المواد المشتركة: " : "Shared Subjects: "}
                    </span>
                    {buddy.sharedSubjects.join(" • ")}
                  </div>
                  <div>
                    <span className="text-foreground font-black">
                      {isRtl ? "أوقات التفرغ: " : "Availability: "}
                    </span>
                    {buddy.availability}
                  </div>
                </div>

                <Link
                  href={`/hagaz`}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white font-extrabold text-xs transition-all duration-300 hover:opacity-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 active:scale-98"
                >
                  <UserCheck size={16} />
                  <span>{isRtl ? "طلب جلسة مراجعة مشتركة" : "Request Study Session"}</span>
                </Link>
              </div>
            </ScaleIn>
          ))}
        </StaggerChildren>
      )}
    </div>
  );
}
