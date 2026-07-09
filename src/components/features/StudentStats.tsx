"use client";

import { useState, useEffect } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { analyticsService } from "@/services/analytics.service";
import dynamic from "next/dynamic";

const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), {
  ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });
import {
  Trophy,
  TrendingUp,
  BookOpen,
  Clock,
  Award,
  Zap,
  Target,
  X,
  Flame,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

export function StudentStats() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [stats, setStats] = useState<{
    pageViews: number;
    fileOpens: number;
    subjectOpens: number;
    totalActions: number;
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
        const [userStats, activityData, subjects] = await Promise.all([
          analyticsService.getUserActivityStats(user.uid),
          analyticsService.getDailyActivityData(user.uid),
          analyticsService.getTopSubjects(user.uid),
        ]);
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

  if (loading || !stats) return null;

  // Compute derived stats
  const mostActiveDay =
    dailyData.length > 0
      ? dailyData.reduce((max, d) => (d.value > max.value ? d : max), dailyData[0])
      : null;

  const weeklyTotal = dailyData.reduce((sum, d) => sum + d.value, 0);
  const dailyAvg = dailyData.length > 0 ? Math.round(weeklyTotal / dailyData.length) : 0;

  // All achievements
  const achievements = [
    {
      title: language === "ar" ? "بطل الملفات" : "File Master",
      desc: language === "ar" ? "تحميل أكثر من 10 ملفات" : "Downloaded 10+ files",
      unlocked: stats.fileOpens >= 10,
      icon: "📁",
    },
    {
      title: language === "ar" ? "مستكشف المواد" : "Explorer",
      desc: language === "ar" ? "زيارة 5 مواد مختلفة" : "Visited 5+ subjects",
      unlocked: stats.subjectOpens >= 5,
      icon: "🧭",
    },
    {
      title: language === "ar" ? "مثابر" : "Consistent",
      desc: language === "ar" ? "أكثر من 50 نشاط" : "50+ total actions",
      unlocked: stats.totalActions >= 50,
      icon: "⚡",
    },
    {
      title: language === "ar" ? "القارئ النهم" : "Bookworm",
      desc: language === "ar" ? "أكثر من 100 مشاهدة" : "100+ page views",
      unlocked: stats.pageViews >= 100,
      icon: "📚",
    },
    {
      title: language === "ar" ? "بداية قوية" : "Quick Start",
      desc: language === "ar" ? "أكثر من 3 ملفات في أول يوم" : "3+ files on first day",
      unlocked: stats.fileOpens >= 3,
      icon: "🚀",
    },
    {
      title: language === "ar" ? "متعدد المواد" : "Multi-Subject",
      desc: language === "ar" ? "زيارة 10 مواد" : "Visited 10+ subjects",
      unlocked: stats.subjectOpens >= 10,
      icon: "🎯",
    },
  ];

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Trend */}
              <div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp size={14} />
                  {language === "ar" ? "نشاط الأسبوع" : "Weekly Activity"}
                </h4>
                <div className="h-[220px] w-full relative min-h-[220px]">
                  {isMounted && (
                    <ResponsiveContainer
                      width="99%"
                      height="100%"
                      minWidth={0}
                      minHeight={0}
                      debounce={100}
                    >
                      <AreaChart data={dailyData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="hsl(var(--border))"
                        />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px",
                            color: "hsl(var(--foreground))",
                          }}
                          itemStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorValue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Subject Breakdown Bar Chart */}
              <div>
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen size={14} />
                  {language === "ar" ? "المواد الأكثر نشاطاً" : "Subject Breakdown"}
                </h4>
                <div className="h-[220px] w-full relative min-h-[220px]">
                  {isMounted && topSubjects.length > 0 ? (
                    <ResponsiveContainer
                      width="99%"
                      height="100%"
                      minWidth={0}
                      minHeight={0}
                      debounce={100}
                    >
                      <BarChart data={topSubjects} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                          stroke="hsl(var(--border))"
                        />
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={100}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                          {topSubjects.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                      {language === "ar" ? "لا توجد بيانات بعد" : "No data yet"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievements && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAchievements(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 md:w-[500px] md:max-h-[80vh] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="shrink-0 flex items-center justify-between p-6 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl">
                    <Trophy size={22} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-foreground">
                      {language === "ar" ? "الإنجازات" : "Achievements"}
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium">
                      {unlockedCount}/{achievements.length}{" "}
                      {language === "ar" ? "مفتوح" : "unlocked"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAchievements(false)}
                  className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {achievements.map((achievement, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      achievement.unlocked
                        ? "bg-primary/5 border-primary/20"
                        : "bg-muted/20 border-border/30 opacity-60"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                        achievement.unlocked ? "bg-primary/10 shadow-lg" : "bg-muted/30 grayscale"
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-bold ${
                          achievement.unlocked ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {achievement.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{achievement.desc}</p>
                    </div>
                    {achievement.unlocked && (
                      <div className="shrink-0 p-1.5 bg-primary rounded-lg">
                        <Award size={14} className="text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function StatSmallCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`p-3 rounded-2xl ${color} flex flex-col gap-1 border`}>
      <span className="opacity-80">{icon}</span>
      <span className="text-xl font-black">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </div>
  );
}
