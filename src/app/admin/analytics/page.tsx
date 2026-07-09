"use client";

import { useState, useEffect, useMemo } from "react";
import { db, rtdb } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  writeBatch,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { useLanguage } from "@/contexts";

import { Subject, ActivityLog, Resource, User } from "@/types";
import { StaggerChildren, ScaleIn, FadeIn } from "@/components/ui/Animations";
import {
  BarChart3,
  Users,
  BookOpen,
  Activity,
  Loader2,
  RefreshCw,
  Trash2,
  LogIn,
  PlusCircle,
  CheckCircle,
  Download,
  Bell,
  Database,
  ShieldCheck,
  PieChart as PieChartIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

const UserGrowthChart = dynamic(() => import("./_components/UserGrowthChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl" />,
});

const ResourceTypeChart = dynamic(() => import("./_components/ResourceTypeChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl" />,
});

const SubjectViewsChart = dynamic(() => import("./_components/SubjectViewsChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl" />,
});

const ResourceDownloadsChart = dynamic(() => import("./_components/ResourceDownloadsChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl" />,
});

const UserRolesChart = dynamic(() => import("./_components/UserRolesChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl" />,
});

import { cn, toDate } from "@/lib/utils";
import { toast } from "sonner";

interface AnalyticsData {
  subjectViews: { name: string; views: number }[];
  resourceDownloads: { name: string; downloads: number }[];
  userRolesDistribution: { name: string; value: number }[];
  liveUsers: number;
  totalUsers: number;
  totalSubjects: number;
  totalResources: number;
  totalDownloads: number;
  totalNotifications: number;
  recentLogs: ActivityLog[];
  resourceTypeDistribution: { name: string; value: number }[];
  userGrowth: { name: string; users: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    subjectViews: [],
    resourceDownloads: [],
    userRolesDistribution: [],
    liveUsers: 0,
    totalUsers: 0,
    totalSubjects: 0,
    totalResources: 0,
    totalDownloads: 0,
    totalNotifications: 0,
    recentLogs: [],
    resourceTypeDistribution: [],
    userGrowth: [],
  });
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "subjects" | "users" | "audit">(
    "overview"
  );
  const { language } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Create local constants for narrowing
    const firestore = db;
    const realtime = rtdb;
    if (!firestore || !realtime) {
      console.warn("[Analytics] Firebase services not initialized");
      setLoading(false);
      return;
    }

    // 1. Realtime user count (RTDB)
    const presenceRef = ref(realtime, "presence");
    const unsubPresence = onValue(presenceRef, (snapshot) => {
      let count = 0;
      if (snapshot.exists()) {
        snapshot.forEach(() => {
          count++;
        });
      }
      setData((prev) => ({ ...prev, liveUsers: count }));
    });

    // 2. Comprehensive Data Fetch (Firestore)
    const collections = ["users", "subjects", "resources", "notifications", "logs"];
    const unsubs = collections.map((colName) => {
      let q = query(collection(firestore, colName));

      if (colName === "logs") {
        q = query(collection(firestore, colName), orderBy("timestamp", "desc"), limit(8));
      }

      return onSnapshot(q, (snapshot) => {
        setData((prev) => {
          const newState = { ...prev };

          if (colName === "users") {
            newState.totalUsers = snapshot.size;
            const roles: Record<string, number> = {
              Student: 0,
              Admin: 0,
              Owner: 0,
            };
            snapshot.docs.forEach((d) => {
              const u = d.data() as User;
              const roleName = u.role
                ? u.role.charAt(0).toUpperCase() + u.role.slice(1)
                : "Student";
              roles[roleName] = (roles[roleName] || 0) + 1;
            });
            newState.userRolesDistribution = Object.entries(roles).map(([name, value]) => ({
              name:
                language === "ar"
                  ? name === "Student"
                    ? "طلاب"
                    : name === "Admin"
                      ? "مشرفين"
                      : "مالك"
                  : name,
              value,
            }));

            // Group users by month for growth chart
            const monthCounts: Record<string, number> = {};
            snapshot.docs.forEach((d) => {
              const u = d.data() as User;
              if (u.createdAt) {
                const date = toDate(u.createdAt);
                const month = date.toLocaleString("default", { month: "short" });
                monthCounts[month] = (monthCounts[month] || 0) + 1;
              }
            });
            const monthsArr = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
            const currentMonth = new Date().getMonth();
            newState.userGrowth = monthsArr
              .map((m) => ({ name: m, users: monthCounts[m] || 0 }))
              .filter((m) => m.users > 0 || monthsArr.indexOf(m.name) <= currentMonth);
          }

          if (colName === "subjects") {
            newState.totalSubjects = snapshot.size;
            newState.subjectViews = snapshot.docs
              .map((d) => {
                const s = d.data() as Subject;
                return {
                  name: (language === "ar" ? s.nameAr || s.name : s.name) || "Subject",
                  views: s.views || 0,
                };
              })
              .sort((a, b) => b.views - a.views)
              .slice(0, 10);
          }

          if (colName === "resources") {
            newState.totalResources = snapshot.size;
            let downloadCount = 0;
            const typeCounts: Record<string, number> = {};

            const resDownloads = snapshot.docs
              .map((d) => {
                const r = d.data() as Resource;
                downloadCount += r.downloads || 0;
                typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
                return {
                  name: (language === "ar" ? r.titleAr || r.title : r.title) || "Resource",
                  downloads: r.downloads || 0,
                };
              })
              .sort((a, b) => b.downloads - a.downloads)
              .slice(0, 5);

            newState.totalDownloads = downloadCount;
            newState.resourceDownloads = resDownloads;
            newState.resourceTypeDistribution = Object.entries(typeCounts).map(([name, value]) => ({
              name: name.toUpperCase(),
              value,
            }));
          }

          if (colName === "notifications") {
            newState.totalNotifications = snapshot.size;
          }

          if (colName === "logs") {
            newState.recentLogs = snapshot.docs.map((d) => {
              const logData = d.data();
              return {
                id: d.id,
                ...logData,
                // Normalize timestamp to ISO string to prevent serialization errors
                timestamp: logData.timestamp
                  ? logData.timestamp.toDate
                    ? logData.timestamp.toDate().toISOString()
                    : new Date(logData.timestamp.seconds * 1000).toISOString()
                  : "1970-01-01T00:00:00.000Z", // Deterministic fallback
              } as ActivityLog;
            });
          }

          return newState;
        });
        setLoading(false);
      });
    });

    return () => {
      unsubPresence();
      unsubs.forEach((unsub) => unsub());
    };
  }, [language]);

  const formatAction = (action: string, lang: string) => {
    const map: Record<string, Record<string, string>> = {
      USER_CREATE: { en: "User Created", ar: "تم إنشاء مستخدم" },
      USER_DELETE: { en: "User Deleted", ar: "تم حذف مستخدم" },
      USER_UPDATE: { en: "User Updated", ar: "تم تعديل مستخدم" },
      ROLE_UPDATE: { en: "Role Updated", ar: "تحديث الدور" },
      PERMISSION_UPDATE: { en: "Permissions Updated", ar: "تحديث الصلاحيات" },
      SUBJECT_CREATE: { en: "Subject Added", ar: "تم إضافة مادة" },
      SUBJECT_UPDATE: { en: "Subject Updated", ar: "تم تعديل مادة" },
      SUBJECT_DELETE: { en: "Subject Deleted", ar: "تم حذف مادة" },
      RESOURCE_CREATE: { en: "Resource Added", ar: "تم إضافة مصدر" },
      RESOURCE_UPDATE: { en: "Resource Updated", ar: "تم تعديل مصدر" },
      RESOURCE_DELETE: { en: "Resource Deleted", ar: "تم حذف مصدر" },
      LOGIN: { en: "User Login", ar: "تسجيل دخول" },
      LOGOUT: { en: "User Logout", ar: "تسجيل خروج" },
      SETTINGS_UPDATE: { en: "Settings Updated", ar: "تحديث الإعدادات" },
      RESET_STATS: { en: "Statistics Reset", ar: "تصفير الإحصائيات" },
      CHAT_DELETE: { en: "Chat Deleted", ar: "تم حذف المحادثة" },
      CHAT_MESSAGE_DELETE: { en: "Message Deleted", ar: "تم حذف رسالة" },
      ADMIN_INVITE: { en: "Admin Invited", ar: "دعوة مشرف" },
      SYSTEM_NOTICE: { en: "System Notice", ar: "تنبيه النظام" },
      LOGS_DELETE: { en: "Audit Logs Cleared", ar: "تصفير سجل العمليات" },
    };

    if (map[action]) return map[action][lang === "ar" ? "ar" : "en"];

    // Fallback: convert SNAKE_CASE to Title Case
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const stats = useMemo(
    () => [
      {
        label: language === "ar" ? "المستخدمين النشطين" : "Active Users",
        value: data.liveUsers,
        icon: Activity,
        color: "bg-emerald-500",
        description: language === "ar" ? "متصلون الآن بالموقع" : "Currently online",
      },
      {
        label: language === "ar" ? "إجمالي المستخدمين" : "Total Users",
        value: data.totalUsers,
        icon: Users,
        color: "bg-blue-500",
        description: language === "ar" ? "مسجلين في المنصة" : "Registered accounts",
      },
      {
        label: language === "ar" ? "المواد الدراسية" : "Academic Subjects",
        value: data.totalSubjects,
        icon: BookOpen,
        color: "bg-purple-500",
        description: language === "ar" ? "إجمالي المواد المتاحة" : "Total course modules",
      },
      {
        label: language === "ar" ? "المصادر التعليمية" : "Learning Resources",
        value: data.totalResources,
        icon: Database,
        color: "bg-orange-500",
        description: language === "ar" ? "ملفات وروابط دراسية" : "Total available assets",
      },
      {
        label: language === "ar" ? "عمليات التحميل" : "Resource Downloads",
        value: data.totalDownloads,
        icon: Download,
        color: "bg-rose-500",
        description: language === "ar" ? "إجمالي التفاعل مع الملفات" : "Total asset interactions",
      },
      {
        label: language === "ar" ? "التنبيهات المرسلة" : "Broadcasts Sent",
        value: data.totalNotifications,
        icon: Bell,
        color: "bg-indigo-500",
        description: language === "ar" ? "إجمالي الإشعارات الموقع" : "Platform-wide messages",
      },
    ],
    [data, language]
  );

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.info(language === "ar" ? "تم تحديث البيانات" : "Data synchronized");
    }, 800);
  };

  const handleResetStats = async () => {
    const firestore = db;
    if (!firestore) return;

    setLoading(true);
    setShowResetModal(false);
    try {
      // 1. Reset Firestore Stats in batches
      const subjectsSnapshot = await getDocs(collection(firestore, "subjects"));
      const resourcesSnapshot = await getDocs(collection(firestore, "resources"));
      const logsSnapshot = await getDocs(collection(firestore, "logs"));

      const batch = writeBatch(firestore);

      subjectsSnapshot.forEach((doc) => {
        batch.update(doc.ref, { views: 0 });
      });

      resourcesSnapshot.forEach((doc) => {
        batch.update(doc.ref, { downloads: 0 });
      });

      // Also clear recent logs to truly reset the UI reach/activity
      logsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      // 2. Add a new log entry for the reset itself
      const { addDoc } = await import("firebase/firestore");
      await addDoc(collection(firestore, "logs"), {
        action: "RESET_STATS",
        details: "Administrator performed a full platform statistics reset.",
        timestamp: new Date().toISOString(),
        userId: "system",
        userEmail: "admin@obour.edu.eg",
      });

      toast.success(
        language === "ar"
          ? "تم تصفير جميع الإحصائيات بنجاح"
          : "All platform statistics have been reset successfully"
      );
      handleRefresh();
    } catch (error) {
      console.error("Error resetting stats:", error);
      toast.error(language === "ar" ? "فشل تصفير الإحصائيات" : "Failed to reset statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/50 backdrop-blur-md p-6 rounded-3xl border border-border/50 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-primary/10 text-primary shadow-inner">
              <BarChart3 className="w-6 h-6" />
            </span>
            {language === "ar" ? "لوحة التحليلات" : "Platform Analytics"}
          </h1>
          <p className="text-muted-foreground mt-1 ml-14 md:ml-0 md:mt-2 text-sm font-medium">
            {loading || !mounted ? (
              <span className="w-32 h-4 bg-muted animate-pulse inline-block rounded" />
            ) : (
              new Date().toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all active:scale-95 font-semibold text-sm"
          >
            <Trash2 className="w-4 h-4" />
            {language === "ar" ? "تصفير الإحصائيات" : "Reset All Stats"}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-muted hover:bg-muted/80 transition-all active:scale-95 disabled:opacity-50 text-sm font-semibold"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            {language === "ar" ? "تحديث" : "Refresh"}
          </button>
        </div>
      </FadeIn>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-muted-foreground font-medium animate-pulse">
            {language === "ar" ? "جاري جلب التحليلات..." : "GATHERING INTELLIGENCE..."}
          </p>
        </div>
      ) : (
        <StaggerChildren className="space-y-8">
          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 p-1.5 bg-muted/30 rounded-2xl w-full md:w-fit max-w-full overflow-x-auto border border-border/50 hide-scrollbar">
            {[
              {
                id: "overview",
                label: language === "ar" ? "نظرة عامة" : "Overview",
                icon: BarChart3,
              },
              { id: "subjects", label: language === "ar" ? "المواد" : "Subjects", icon: BookOpen },
              { id: "users", label: language === "ar" ? "المستفيدين" : "Users", icon: Users },
              {
                id: "audit",
                label: language === "ar" ? "السجل النظيف" : "Audit",
                icon: ShieldCheck,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-bold text-sm select-none whitespace-nowrap shrink-0",
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "overview" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              {/* Main Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <ScaleIn
                      key={idx}
                      className="group relative overflow-hidden bg-card rounded-4xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary/5"
                    >
                      {/* Background Decorative Blob */}
                      <div
                        className={cn(
                          "absolute -right-4 -top-4 w-32 h-32 opacity-10 rounded-full blur-3xl transition-all duration-500 group-hover:opacity-20",
                          stat.color
                        )}
                      />

                      <div className="relative flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                          <div
                            className={cn(
                              "p-4 rounded-[1.25rem] text-white shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                              stat.color
                            )}
                          >
                            <Icon size={28} />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors duration-500">
                              {stat.value.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground underline decoration-primary/20 underline-offset-4 decoration-2">
                            {stat.label}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 font-medium italic">
                            {stat.description}
                          </p>
                        </div>
                      </div>
                    </ScaleIn>
                  );
                })}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <ScaleIn className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm flex flex-col gap-8 group">
                  <div className="flex items-center justify-between border-b border-border pb-6">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-3">
                        <Users className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                        {language === "ar" ? "نمو المستخدمين" : "Growth Acquisition"}
                      </h2>
                    </div>
                  </div>
                  <div className="h-[300px] min-h-[300px] w-full mt-4">
                    <UserGrowthChart data={data.userGrowth} />
                  </div>
                </ScaleIn>

                <ScaleIn className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm flex flex-col gap-6 group">
                  <div className="border-b border-border pb-6">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      <PieChartIcon className="w-6 h-6 text-purple-500 group-hover:rotate-12 transition-transform" />
                      {language === "ar" ? "توزيع الأدوار" : "Member Segments"}
                    </h2>
                  </div>
                  <div className="h-[300px] min-h-[300px] w-full mt-4">
                    <UserRolesChart data={data.userRolesDistribution} />
                  </div>
                </ScaleIn>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ScaleIn className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm flex flex-col gap-6 group">
                  <div className="border-b border-border pb-6">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      <Download className="w-6 h-6 text-rose-500 group-hover:-translate-y-1 transition-transform" />
                      {language === "ar" ? "تحميلات المصادر" : "Popular Resources"}
                    </h2>
                  </div>
                  <div className="h-[250px] min-h-[250px] w-full mt-4">
                    {data.resourceDownloads.length > 0 ? (
                      <ResourceDownloadsChart data={data.resourceDownloads} />
                    ) : (
                      <div className="h-full flex items-center justify-center opacity-30 italic">
                        No Downloads Yet
                      </div>
                    )}
                  </div>
                </ScaleIn>

                <ScaleIn className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm flex flex-col gap-6 group">
                  <div className="border-b border-border pb-6">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      <Database className="w-6 h-6 text-orange-500 group-hover:rotate-6 transition-transform" />
                      {language === "ar" ? "أنواع المصادر" : "Resource Inventory"}
                    </h2>
                  </div>
                  <div className="h-[250px] min-h-[250px] w-full mt-4">
                    <ResourceTypeChart data={data.resourceTypeDistribution} />
                  </div>
                </ScaleIn>
              </div>
            </div>
          )}

          {activeTab === "subjects" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <ScaleIn className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm flex flex-col gap-8 group">
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <div>
                    <h2 className="text-2xl font-black flex items-center gap-3">
                      <BarChart3 className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                      {language === "ar" ? "المواد الأكثر تفاعلاً" : "High Engagement Subjects"}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">
                      {language === "ar"
                        ? "بناءً على إجمالي عدد المشاهدات الفريدة"
                        : "Calculated by cumulative unique views"}
                    </p>
                  </div>
                </div>

                <div className="h-[450px] w-full mt-4">
                  {data.subjectViews.length > 0 ? (
                    <SubjectViewsChart data={data.subjectViews} />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                      <Database className="w-16 h-16 mb-4 opacity-10" />
                      <p className="font-semibold italic">
                        {language === "ar" ? "لا توجد بيانات كافية" : "Awaiting data stream..."}
                      </p>
                    </div>
                  )}
                </div>
              </ScaleIn>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 text-center">
                  <p className="text-xs font-bold text-primary uppercase mb-2">
                    {language === "ar" ? "معدل المشاهدات لكل مادة" : "Avg Views / Subject"}
                  </p>
                  <p className="text-3xl font-black">
                    {(
                      data.subjectViews.reduce((acc, curr) => acc + curr.views, 0) /
                      (data.totalSubjects || 1)
                    ).toFixed(1)}
                  </p>
                </div>
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-3xl p-6 text-center">
                  <p className="text-xs font-bold text-purple-600 uppercase mb-2">
                    {language === "ar" ? "المواد النشطة" : "Active Modules"}
                  </p>
                  <p className="text-3xl font-black">
                    {data.subjectViews.filter((s) => s.views > 0).length}
                  </p>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 text-center">
                  <p className="text-xs font-bold text-rose-600 uppercase mb-2">
                    {language === "ar" ? "المواد الصفرية" : "Cold Modules"}
                  </p>
                  <p className="text-3xl font-black">
                    {Math.max(
                      0,
                      data.totalSubjects - data.subjectViews.filter((s) => s.views > 0).length
                    )}
                  </p>
                </div>
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 text-center">
                  <p className="text-xs font-bold text-emerald-600 uppercase mb-2">
                    {language === "ar" ? "إجمالي التفاعل" : "Gross Reach"}
                  </p>
                  <p className="text-3xl font-black">
                    {data.subjectViews.reduce((acc, curr) => acc + curr.views, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <ScaleIn className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm">
                  <h2 className="text-xl font-bold mb-6">
                    {language === "ar" ? "توزيع المستخدمين" : "User Distribution"}
                  </h2>
                  <div className="h-[300px]">
                    <UserRolesChart data={data.userRolesDistribution} />
                  </div>
                </ScaleIn>
                <ScaleIn className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm">
                  <h2 className="text-xl font-bold mb-6">
                    {language === "ar" ? "نشاط المستخدمين" : "User Activity Trend"}
                  </h2>
                  <div className="h-[300px]">
                    <UserGrowthChart data={data.userGrowth} />
                  </div>
                </ScaleIn>
              </div>
            </div>
          )}

          {activeTab === "audit" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <ScaleIn className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm flex flex-col gap-6 group">
                <div className="border-b border-border pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform" />
                      {language === "ar" ? "سجل العمليات الإدارية" : "Administrative Audit Trail"}
                    </h2>
                  </div>
                </div>

                <div className="space-y-3">
                  {data.recentLogs.length > 0 ? (
                    data.recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center gap-5 p-4 rounded-3xl hover:bg-muted/50 transition-all border border-border/10 hover:border-primary/20 group/log shadow-sm"
                      >
                        <div
                          className={cn(
                            "p-3 rounded-2xl transition-all group-hover/log:scale-110 shadow-inner",
                            log.action.includes("CREATE")
                              ? "bg-emerald-500 text-white"
                              : log.action.includes("DELETE")
                                ? "bg-rose-500 text-white"
                                : log.action.includes("UPDATE")
                                  ? "bg-amber-500 text-white"
                                  : "bg-blue-500 text-white"
                          )}
                        >
                          {log.action.includes("CREATE") ? (
                            <PlusCircle size={20} />
                          ) : log.action.includes("DELETE") ? (
                            <Trash2 size={20} />
                          ) : log.action.includes("LOGIN") ? (
                            <LogIn size={20} />
                          ) : (
                            <CheckCircle size={20} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-black truncate text-foreground group-hover/log:text-primary transition-colors">
                              {formatAction(log.action, language)}
                            </p>
                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-md font-mono text-muted-foreground">
                              {log.action}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-muted-foreground/80">
                            {log.details}
                          </p>
                          <p className="text-[10px] text-muted-foreground/50 font-medium mt-1 uppercase tracking-tighter">
                            {log.userEmail}
                          </p>
                        </div>
                        <div className="text-xs font-mono font-black text-primary/40 whitespace-nowrap hidden sm:block">
                          {log.timestamp
                            ? toDate(log.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center opacity-30 flex flex-col items-center">
                      <Activity className="w-12 h-12 mb-4 animate-pulse" />
                      <p className="font-bold italic">
                        {language === "ar" ? "لا توجد سجلات" : "The audit trail is empty"}
                      </p>
                    </div>
                  )}
                </div>
              </ScaleIn>
            </div>
          )}
        </StaggerChildren>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetStats}
        title={language === "ar" ? "تصفير جميع الإحصائيات" : "Factory Reset Stats"}
        message={
          language === "ar"
            ? "سيتم إعادة تعيين جميع أرقام المشاهدات والتحميلات إلى الصفر. هل أنت متأكد؟ هذا الإجراء سيؤثر على الرؤية العامة للتفاعل الحالي."
            : "This will purge all engagement data, including unique views and file downloads, returning them to zero. This action is destructive and permanent. Proceed?"
        }
        confirmText={language === "ar" ? "تصفير الآن" : "Purge Data"}
        cancelText={language === "ar" ? "إلغاء" : "Abort"}
        type="danger"
      />
    </div>
  );
}
