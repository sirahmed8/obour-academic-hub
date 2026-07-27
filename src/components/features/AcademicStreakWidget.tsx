"use client";

import { useState, useEffect } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { Flame, Calendar, Award, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function AcademicStreakWidget() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [streakDays, setStreakDays] = useState(5); // Default study streak for Obour students

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
          const nextStreak = currentStreak + 1;
          localStorage.setItem(streakKey, String(nextStreak));
          localStorage.setItem(lastVisitKey, today);
          setStreakDays(nextStreak);
        } else {
          localStorage.setItem(streakKey, "1");
          localStorage.setItem(lastVisitKey, today);
          setStreakDays(1);
        }
      } else {
        localStorage.setItem(streakKey, "1");
        localStorage.setItem(lastVisitKey, today);
        setStreakDays(1);
      }
    } catch {
      setStreakDays(3);
    }
  }, [user?.uid]);

  // Real Academic Semester Progress calculation from calendar
  const now = new Date();
  const currentYear = now.getFullYear();
  let start = new Date(currentYear, 1, 1);
  let end = new Date(currentYear, 5, 15);
  if (now.getMonth() >= 8) {
    start = new Date(currentYear, 8, 1);
    end = new Date(currentYear, 11, 31);
  }
  const totalDays = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 3600 * 24));
  const elapsedDays = Math.min(
    totalDays,
    Math.max(0, (now.getTime() - start.getTime()) / (1000 * 3600 * 24))
  );
  const semesterProgress = Math.min(100, Math.round((elapsedDays / totalDays) * 100));
  const currentWeek = Math.min(16, Math.max(1, Math.ceil(elapsedDays / 7)));
  const semesterWeeksTotal = 16;

  if (!mounted) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      {/* 1. Study Streak Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 backdrop-blur-xl relative overflow-hidden flex items-center gap-4 shadow-sm group hover:border-amber-500/40 transition-all"
      >
        <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 group-hover:scale-110 transition-transform">
          <Flame size={26} className="animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black text-foreground">{streakDays}</span>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
              {language === "ar" ? "أيام متتالية 🔥" : "Day Streak 🔥"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            {language === "ar" ? "تتابع دراسي ممتاز هذا الأسبوع" : "Great consecutive study habit!"}
          </p>
        </div>
      </motion.div>

      {/* 2. Semester Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="p-5 rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between shadow-sm group hover:border-blue-500/40 transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-500 border border-blue-500/30">
              <Calendar size={18} />
            </div>
            <span className="text-xs font-bold text-foreground">
              {language === "ar" ? "تقدم الفصل الدراسي" : "Semester Progress"}
            </span>
          </div>
          <span className="text-xs font-black text-blue-500">{semesterProgress}%</span>
        </div>

        <div className="w-full bg-blue-500/10 h-2.5 rounded-full overflow-hidden border border-blue-500/20 my-1">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
            style={{ width: `${semesterProgress}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-medium mt-1">
          <span>
            {language === "ar"
              ? `الأسبوع ${currentWeek} من ${semesterWeeksTotal}`
              : `Week ${currentWeek} of ${semesterWeeksTotal}`}
          </span>
          <span>{language === "ar" ? "اقتربت الامتحانات 🎯" : "Exams approaching 🎯"}</span>
        </div>
      </motion.div>

      {/* 3. Daily Academic Quote Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="p-5 rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent border border-purple-500/20 backdrop-blur-xl relative overflow-hidden flex items-center gap-4 shadow-sm group hover:border-purple-500/40 transition-all"
      >
        <div className="p-3.5 rounded-2xl bg-purple-500/20 text-purple-500 border border-purple-500/30 group-hover:scale-110 transition-transform">
          <Sparkles size={24} />
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-500 flex items-center gap-1">
            <Award size={12} />
            {language === "ar" ? "حكمة اليوم الأكاديمية" : "Daily Academic Quote"}
          </span>
          <p className="text-xs font-bold text-foreground leading-snug mt-1 line-clamp-2">
            {language === "ar"
              ? "«الاستمرار في المذاكرة اليومية الصغيرة يصنع التميز الكلي مع الأيام.»"
              : "“Small daily study progress yields massive academic excellence.”"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
