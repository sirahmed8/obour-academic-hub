"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { analyticsService } from "@/services/analytics.service";
import { Trophy, TrendingUp, BookOpen, Clock, Zap, Target, Flame, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

import { StatSmallCard } from "./StudentStats/StatSmallCard";
import { AchievementsModal, Achievement } from "./StudentStats/AchievementsModal";
import { LearningAnalyticsCharts } from "./StudentStats/LearningAnalyticsCharts";

export function StudentStats() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [stats, setStats] = useState<{
    pageViews: number;
    fileOpens: number;
    subjectOpens: number;
    totalActions: number;
    logins?: number;
    gradesAdded?: number;
    examOpens?: number;
    qaOpens?: number;
  } | null>(null);
  const [dailyData, setDailyData] = useState<{ name: string; value: number }[]>([]);
  const [topSubjects, setTopSubjects] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!user?.uid) return;

    const fetchData = async () => {
      try {
        const [userStats, activityData, subjects] = (await Promise.all([
          analyticsService.getUserActivityStats(user.uid),
          analyticsService.getDailyActivityData(user.uid),
          analyticsService.getTopSubjects(user.uid),
        ])) as [NonNullable<typeof stats>, typeof dailyData, typeof topSubjects];

        setStats(userStats);
        setDailyData(activityData);
        setTopSubjects(subjects);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.uid]);

  // Compute derived stats
  const { mostActiveDay, dailyAvg } = useMemo(() => {
    const mostActive =
      dailyData.length > 0
        ? dailyData.reduce((max, d) => (d.value > max.value ? d : max), dailyData[0])
        : null;
    const weeklyTotal = dailyData.reduce((sum, d) => sum + d.value, 0);
    const avg = dailyData.length > 0 ? Math.round(weeklyTotal / dailyData.length) : 0;
    return { mostActiveDay: mostActive, dailyAvg: avg };
  }, [dailyData]);

  // All achievements
  const achievements: Achievement[] = useMemo(
    () => [
      {
        title: language === "ar" ? "بطل الملفات" : "File Master",
        desc: language === "ar" ? "تحميل أكثر من 10 ملفات" : "Downloaded 10+ files",
        unlocked: (stats?.fileOpens ?? 0) >= 10,
        icon: "📁",
      },
      {
        title: language === "ar" ? "مستكشف المواد" : "Explorer",
        desc: language === "ar" ? "زيارة 5 مواد مختلفة" : "Visited 5+ subjects",
        unlocked: (stats?.subjectOpens ?? 0) >= 5,
        icon: "🧭",
      },
      {
        title: language === "ar" ? "شعلة النشاط" : "Active Learner",
        desc: language === "ar" ? "تسجيل دخول أكثر من 20 مرة" : "Logged in 20+ times",
        unlocked: (stats?.logins ?? 0) >= 20,
        icon: "🔥",
      },
      {
        title: language === "ar" ? "أول خطوة" : "First Steps",
        desc: language === "ar" ? "إضافة أول درجات" : "Added first grades",
        unlocked: (stats?.gradesAdded ?? 0) >= 1,
        icon: "🎯",
      },
      {
        title: language === "ar" ? "ملك الامتحانات" : "Exam King",
        desc: language === "ar" ? "فتح 5 امتحانات سابقة" : "Opened 5+ past exams",
        unlocked: (stats?.examOpens ?? 0) >= 5,
        icon: "👑",
      },
      {
        title: language === "ar" ? "عاشق الأسئلة" : "Q&A Enthusiast",
        desc: language === "ar" ? "فتح قسم الأسئلة 3 مرات" : "Opened Q&A 3+ times",
        unlocked: (stats?.qaOpens ?? 0) >= 3,
        icon: "🤔",
      },
    ],
    [stats, language]
  );

  if (loading || !stats) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 mb-8"
      >
        {/* Extended Learning Analytics - Full Width */}
        <Card className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-xl">
          <CardHeader className="border-b border-border/30 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <TrendingUp size={20} className="text-primary" />
                {language === "ar" ? "تحليلات التعلم" : "Learning Analytics"}
              </CardTitle>

              {/* Achievements Button */}
              <button
                onClick={() => setShowAchievements(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all text-sm font-bold border border-primary/20 hover:scale-105 active:scale-95"
              >
                <Trophy size={16} />
                {language === "ar" ? "الإنجازات" : "Achievements"}
                <span className="bg-primary text-primary-foreground text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {unlockedCount}/{achievements.length}
                </span>
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Stats Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              <StatSmallCard
                icon={<BookOpen size={16} />}
                label={language === "ar" ? "المواد" : "Subjects"}
                value={stats.subjectOpens}
                color="bg-blue-500/10 text-blue-500 border-blue-500/20"
              />
              <StatSmallCard
                icon={<Clock size={16} />}
                label={language === "ar" ? "النشاط" : "Actions"}
                value={stats.totalActions}
                color="bg-purple-500/10 text-purple-500 border-purple-500/20"
              />
              <StatSmallCard
                icon={<Zap size={16} />}
                label={language === "ar" ? "الملفات" : "Files"}
                value={stats.fileOpens}
                color="bg-amber-500/10 text-amber-500 border-amber-500/20"
              />
              <StatSmallCard
                icon={<Target size={16} />}
                label={language === "ar" ? "المشاهدات" : "Views"}
                value={stats.pageViews}
                color="bg-green-500/10 text-green-500 border-green-500/20"
              />
              <StatSmallCard
                icon={<Flame size={16} />}
                label={language === "ar" ? "اليوم الأنشط" : "Peak Day"}
                value={mostActiveDay?.value ?? 0}
                color="bg-red-500/10 text-red-500 border-red-500/20"
              />
              <StatSmallCard
                icon={<Calendar size={16} />}
                label={language === "ar" ? "المتوسط اليومي" : "Daily Avg"}
                value={dailyAvg}
                color="bg-teal-500/10 text-teal-500 border-teal-500/20"
              />
            </div>

            {/* Charts - Side by Side on Desktop */}
            <LearningAnalyticsCharts
              dailyData={dailyData}
              topSubjects={topSubjects}
              isMounted={isMounted}
              language={language}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements Modal */}
      <AchievementsModal
        show={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={achievements}
        unlockedCount={unlockedCount}
        language={language}
      />
    </>
  );
}
