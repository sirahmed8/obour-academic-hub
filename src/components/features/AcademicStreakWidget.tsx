"use client";

import { useState, useEffect } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { Flame, Calendar, Award, Sparkles, Sun } from "lucide-react";
import { motion } from "framer-motion";

function getSemesterInfo() {
  const now = new Date();
  const y = now.getFullYear();

  // Egypt academic calendar:
  // Spring: Feb 1 – Jun 15
  // Fall:   Sep 1 – Jan 31
  // Summer: Jun 16 – Aug 31

  const springStart = new Date(y, 1, 1); // Feb 1
  const springEnd = new Date(y, 5, 15); // Jun 15
  const fallStart = new Date(y, 8, 1); // Sep 1
  const fallEnd = new Date(y + 1, 0, 31); // Jan 31 next year

  let semesterName = "";
  let semesterNameAr = "";
  let start: Date;
  let end: Date;
  let isSummer = false;
  let nextSemesterStart: Date | null = null;

  if (now >= springStart && now <= springEnd) {
    // Active spring semester
    semesterName = "Spring Semester";
    semesterNameAr = "الفصل الدراسي الثاني";
    start = springStart;
    end = springEnd;
  } else if (now >= fallStart && now <= fallEnd) {
    // Active fall semester
    semesterName = "Fall Semester";
    semesterNameAr = "الفصل الدراسي الأول";
    start = fallStart;
    end = fallEnd;
  } else {
    // Summer break
    isSummer = true;
    semesterName = "Summer Break";
    semesterNameAr = "الإجازة الصيفية";
    start = now;
    end = now;
    nextSemesterStart = new Date(y, 8, 1); // Sep 1
    if (now >= nextSemesterStart) {
      nextSemesterStart = new Date(y + 1, 8, 1);
    }
  }

  if (isSummer) {
    return {
      isSummer: true,
      semesterName,
      semesterNameAr,
      progress: 0,
      currentWeek: 0,
      totalWeeks: 0,
      statusEn: "Summer Break 🌴",
      statusAr: "إجازة صيفية 🌴",
      daysUntilNextSemester: nextSemesterStart
        ? Math.max(0, Math.ceil((nextSemesterStart.getTime() - now.getTime()) / (1000 * 3600 * 24)))
        : 0,
    };
  }

  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = Math.max(0, Math.min(totalMs, now.getTime() - start.getTime()));
  const totalDays = totalMs / (1000 * 3600 * 24);
  const elapsedDays = elapsedMs / (1000 * 3600 * 24);
  const progress = Math.min(100, Math.round((elapsedDays / totalDays) * 100));
  const currentWeek = Math.min(16, Math.max(1, Math.ceil(elapsedDays / 7)));

  const statusEn =
    currentWeek >= 14
      ? "Exams Week 🎯"
      : currentWeek >= 11
        ? "Exams approaching 📝"
        : currentWeek >= 7
          ? "Midterms ahead 📋"
          : "On track 📚";

  const statusAr =
    currentWeek >= 14
      ? "أسبوع الامتحانات 🎯"
      : currentWeek >= 11
        ? "اقتربت الامتحانات 📝"
        : currentWeek >= 7
          ? "امتحانات منتصف الفصل 📋"
          : "على المسار الصحيح 📚";

  return {
    isSummer: false,
    semesterName,
    semesterNameAr,
    progress,
    currentWeek,
    totalWeeks: 16,
    statusEn,
    statusAr,
    daysUntilNextSemester: 0,
  };
}

export function AcademicStreakWidget() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [mounted, setMounted] = useState(false);
  const [streakDays, setStreakDays] = useState(1);

  useEffect(() => {
    setMounted(true);
    if (!user?.uid) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const streakKey = `obour_streak_${user.uid}`;
      const lastVisitKey = `obour_last_visit_${user.uid}`;

      const lastVisit = localStorage.getItem(lastVisitKey);
      const currentStreak = parseInt(localStorage.getItem(streakKey) || "1", 10);

      if (lastVisit === today) {
        setStreakDays(currentStreak);
      } else if (lastVisit) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastVisit === yesterdayStr) {
          const next = currentStreak + 1;
          localStorage.setItem(streakKey, String(next));
          localStorage.setItem(lastVisitKey, today);
          setStreakDays(next);
        } else {
          // Streak broken
          localStorage.setItem(streakKey, "1");
          localStorage.setItem(lastVisitKey, today);
          setStreakDays(1);
        }
      } else {
        // First visit ever
        localStorage.setItem(streakKey, "1");
        localStorage.setItem(lastVisitKey, today);
        setStreakDays(1);
      }
    } catch {
      setStreakDays(1);
    }
  }, [user?.uid]);

  const sem = getSemesterInfo();

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      {/* 1. Study Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="p-5 rounded-3xl bg-card border border-amber-500/25 shadow-sm flex items-center gap-4 hover:border-amber-500/50 transition-all"
      >
        <div className="p-3.5 rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/25 shrink-0">
          <Flame size={26} className="animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black text-foreground">{streakDays}</span>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
              {isAr ? "أيام متتالية 🔥" : "Day Streak 🔥"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {streakDays >= 7
              ? isAr
                ? "أسبوع كامل متتالي! رائع 🏆"
                : "Full week streak! Amazing 🏆"
              : streakDays >= 3
                ? isAr
                  ? "تتابع دراسي ممتاز هذا الأسبوع"
                  : "Great consecutive study habit!"
                : isAr
                  ? "ابدأ سلسلتك اليومية اليوم"
                  : "Start your daily streak today"}
          </p>
        </div>
      </motion.div>

      {/* 2. Semester Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="p-5 rounded-3xl bg-card border border-blue-500/25 shadow-sm flex flex-col justify-between hover:border-blue-500/50 transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/15 text-blue-500 border border-blue-500/25">
              {sem.isSummer ? <Sun size={18} /> : <Calendar size={18} />}
            </div>
            <span className="text-xs font-bold text-foreground">
              {isAr ? sem.semesterNameAr : sem.semesterName}
            </span>
          </div>
          {sem.isSummer ? (
            <span className="text-xs font-black text-orange-400">☀️</span>
          ) : (
            <span className="text-xs font-black text-blue-500">{sem.progress}%</span>
          )}
        </div>

        {sem.isSummer ? (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              {isAr
                ? `${sem.daysUntilNextSemester} يوم حتى بداية الفصل الجديد`
                : `${sem.daysUntilNextSemester} days until next semester`}
            </p>
            <p className="text-xs font-bold text-orange-400">
              {isAr ? "استمتع بإجازتك الصيفية 🌴" : "Enjoy your summer break 🌴"}
            </p>
          </div>
        ) : (
          <>
            <div className="w-full bg-blue-500/10 h-2.5 rounded-full overflow-hidden border border-blue-500/20 my-1">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${sem.progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium mt-1">
              <span>
                {isAr
                  ? `الأسبوع ${sem.currentWeek} من ${sem.totalWeeks}`
                  : `Week ${sem.currentWeek} of ${sem.totalWeeks}`}
              </span>
              <span>{isAr ? sem.statusAr : sem.statusEn}</span>
            </div>
          </>
        )}
      </motion.div>

      {/* 3. Daily Academic Quote Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="p-5 rounded-3xl bg-card border border-purple-500/25 shadow-sm flex items-center gap-4 hover:border-purple-500/50 transition-all"
      >
        <div className="p-3.5 rounded-2xl bg-purple-500/15 text-purple-500 border border-purple-500/25 shrink-0">
          <Sparkles size={24} />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-500 flex items-center gap-1">
            <Award size={12} />
            {isAr ? "حكمة اليوم الأكاديمية" : "Daily Academic Quote"}
          </span>
          <p className="text-xs font-bold text-foreground leading-snug mt-1 line-clamp-2">
            {isAr
              ? "«الاستمرار في المذاكرة اليومية الصغيرة يصنع التميز الكلي مع الأيام.»"
              : "“Small daily study progress yields massive academic excellence.”"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
