"use client";

import { useState, useEffect } from "react";
import { db, rtdb } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { useLanguage } from "@/contexts";
import { AppShell } from "@/components/layout/AppShell";
import { Subject } from "@/types";
import { StaggerChildren, ScaleIn, FadeIn } from "@/components/ui/Animations";
import { BarChart3, Users, BookOpen, Activity, Loader2, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  subjectViews: { name: string; views: number }[];
  liveUsers: number;
  totalUsers: number;
  totalSubjects: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    subjectViews: [],
    liveUsers: 0,
    totalUsers: 0,
    totalSubjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    // Realtime user count
    const presenceRef = ref(rtdb, "presence");
    const unsubPresence = onValue(presenceRef, (snapshot) => {
      let count = 0;
      snapshot.forEach(() => {
        count++;
        return false;
      });
      setData((prev) => ({ ...prev, liveUsers: count }));
    });

    // Users count
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setData((prev) => ({ ...prev, totalUsers: snapshot.size }));
    });

    // Subjects count
    const unsubSubjects = onSnapshot(
      collection(db, "subjects"),
      (snapshot) => {
        setData((prev) => ({ ...prev, totalSubjects: snapshot.size }));

        // Real views data
        const views = snapshot.docs
          .map((d) => {
            const data = d.data() as Subject;
            return {
              name: data.name || "Subject",
              views: data.views || 0,
            };
          })
          .sort((a, b) => b.views - a.views)
          .slice(0, 10); // Show top 10
        setData((prev) => ({ ...prev, subjectViews: views }));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching subjects:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubPresence();
      unsubUsers();
      unsubSubjects();
    };
  }, []);

  const stats = [
    {
      label: language === "ar" ? "المستخدمين المتصلين" : "Live Users",
      value: data.liveUsers,
      icon: Activity,
      color: "bg-green-500",
    },
    {
      label: language === "ar" ? "إجمالي المستخدمين" : "Total Users",
      value: data.totalUsers,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: language === "ar" ? "المواد" : "Subjects",
      value: data.totalSubjects,
      icon: BookOpen,
      color: "bg-purple-500",
    },
  ];

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    // Data refreshes automatically via onSnapshot, this is just visual feedback
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <AppShell>
      <div className="p-6 lg:p-10 w-full space-y-8 page-transition">
        <FadeIn className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-600 flex items-center gap-3">
            <BarChart3 className="text-primary" />
            {t("admin.analytics")}
          </h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-all active:scale-95 disabled:opacity-50"
            title={language === "ar" ? "تحديث" : "Refresh"}
          >
            <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
          </button>
        </FadeIn>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : (
          <StaggerChildren className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <ScaleIn
                    key={idx}
                    className="bg-card rounded-2xl p-6 border border-border bg-linear-to-br from-card to-muted/20"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "p-3 rounded-xl text-white shadow-lg shadow-primary/10",
                          stat.color
                        )}
                      >
                        <Icon size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      </div>
                    </div>
                  </ScaleIn>
                );
              })}
            </div>

            {/* Subject Views Chart */}
            <ScaleIn className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  {language === "ar" ? "مشاهدات المواد" : "Subject Views"}
                </h2>
              </div>
              <div className="h-96 w-full">
                {data.subjectViews.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.subjectViews}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border/50"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        className="text-xs font-medium"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis
                        className="text-xs font-medium"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                        }}
                        labelStyle={{
                          color: "hsl(var(--foreground))",
                          fontWeight: "bold",
                          marginBottom: "4px",
                        }}
                        itemStyle={{ color: "hsl(var(--primary))" }}
                        cursor={{ fill: "hsl(var(--primary) / 0.1)" }}
                      />
                      <Bar
                        dataKey="views"
                        fill="hsl(var(--primary))"
                        radius={[6, 6, 0, 0]}
                        barSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                    <p>
                      {language === "ar" ? "لا توجد بيانات للمواد" : "No subject data available"}
                    </p>
                  </div>
                )}
              </div>
            </ScaleIn>
          </StaggerChildren>
        )}
      </div>
    </AppShell>
  );
}
