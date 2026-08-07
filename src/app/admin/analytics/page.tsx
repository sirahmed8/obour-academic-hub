"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { db, rtdb } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  writeBatch,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { useLanguage } from "@/contexts";

import { Subject, ActivityLog, Resource, User } from "@/types";
import { StaggerChildren, ScaleIn, FadeIn } from "@/components/ui/Animations";
import { LoadingAnalyticsPage } from "@/components/ui/Loading";
import {
  BarChart3,
  Users,
  BookOpen,
  Activity,
  RefreshCw,
  Trash2,
  LogIn,
  PlusCircle,
  CheckCircle,
  Database,
  ShieldCheck,
  PieChart as PieChartIcon,
  Crown,
  Trophy,
  UserCheck,
  CalendarDays,
  Coins,
  Sparkles,
  BrainCircuit,
  Zap,
  CreditCard,
  Gift,
  Cpu,
  Bot,
  Search,
  UserX,
  Receipt,
  ListFilter,
  ChevronDown,
} from "lucide-react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

const UserGrowthChart = dynamic(() => import("./_components/UserGrowthChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl" />,
});

const SubjectViewsChart = dynamic(() => import("./_components/SubjectViewsChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl" />,
});

const UserRolesChart = dynamic(() => import("./_components/UserRolesChart"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted/20 animate-pulse rounded-xl" />,
});

import { cn, toDate, normalizeDate } from "@/lib/utils";
import { toast } from "sonner";

interface TopStudent {
  uid: string;
  name: string;
  email: string;
  points: number;
  avatar?: string;
  isVip: boolean;
  role: string;
}

interface GiftedVipUser {
  uid: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  grantedAt?: string;
  grantedBy?: string;
  vipType: "paid" | "gifted";
  waivedMonthlyCost: number;
}

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
  vipUsers: number;
  freeUsers: number;
  paidVipUsers: number;
  giftedVipUsers: number;
  giftedVipList: GiftedVipUser[];
  topPlayers: TopStudent[];
  todayLogins: number;
  newUsersThisWeek: number;
  // Real AI Tokens & Requests from Firestore
  quizAiCount: number;
  quizAiTokens: number;
  transcribeAiCount: number;
  transcribeAiTokens: number;
  mindmapAiCount: number;
  mindmapAiTokens: number;
  qaAiCount: number;
  qaAiTokens: number;
  realTokensSum: number;
  realAiRequestsCount: number;
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
    vipUsers: 0,
    freeUsers: 0,
    paidVipUsers: 0,
    giftedVipUsers: 0,
    giftedVipList: [],
    topPlayers: [],
    todayLogins: 0,
    newUsersThisWeek: 0,
    quizAiCount: 0,
    quizAiTokens: 0,
    transcribeAiCount: 0,
    transcribeAiTokens: 0,
    mindmapAiCount: 0,
    mindmapAiTokens: 0,
    qaAiCount: 0,
    qaAiTokens: 0,
    realTokensSum: 0,
    realAiRequestsCount: 0,
  });

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [giftedSearchTerm, setGiftedSearchTerm] = useState("");

  // Custom Dropdown Menu State & Outside Click Ref
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [activeTab, setActiveTab] = useState<
    "overview" | "subscriptions" | "ai_analytics" | "students" | "subjects" | "users" | "audit"
  >("overview");
  const { language } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
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
        q = query(collection(firestore, colName), orderBy("timestamp", "desc"), limit(200));
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

            let vipCount = 0;
            let freeCount = 0;
            let paidCount = 0;
            let giftedCount = 0;
            let todayLogins = 0;
            let newThisWeek = 0;
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const topPlayersArr: TopStudent[] = [];
            const giftedVipArr: GiftedVipUser[] = [];

            snapshot.docs.forEach((d) => {
              const u = d.data() as User;
              const roleName = u.role
                ? u.role.charAt(0).toUpperCase() + u.role.slice(1)
                : "Student";
              roles[roleName] = (roles[roleName] || 0) + 1;

              const isVipUser = Boolean(
                u.isVip === true ||
                (u.isVip as unknown) === "true" ||
                u.subscriptionTier === "vip" ||
                u.vipType === "gifted" ||
                u.vipType === "paid" ||
                u.role === "owner" ||
                u.role === "admin"
              );
              if (isVipUser) {
                vipCount++;
                if (u.vipType === "paid") {
                  paidCount++;
                } else {
                  giftedCount++;
                  giftedVipArr.push({
                    uid: d.id || u.uid || "",
                    name: u.displayName || u.email || "Student",
                    email: u.email || "",
                    role: u.role || "student",
                    avatar: u.photoURL || undefined,
                    grantedAt:
                      u.vipGrantedAt || (u.createdAt ? normalizeDate(u.createdAt) : undefined),
                    grantedBy:
                      u.vipGrantedBy ||
                      (u.role === "owner" || u.role === "admin"
                        ? "Owner / System Exemption"
                        : "Owner / Admin"),
                    vipType: u.vipType || "gifted",
                    waivedMonthlyCost: 49,
                  });
                }
              } else {
                freeCount++;
              }

              // Today logins
              if (u.lastLogin) {
                try {
                  const loginDate = toDate(u.lastLogin);
                  if (!isNaN(loginDate.getTime()) && loginDate >= todayStart) todayLogins++;
                } catch {}
              }

              // New this week
              if (u.createdAt) {
                try {
                  const date = toDate(u.createdAt);
                  if (!isNaN(date.getTime()) && date >= weekAgo) newThisWeek++;
                } catch {}
              }

              // Top students by points
              if ((u.points ?? 0) > 0) {
                topPlayersArr.push({
                  uid: d.id,
                  name: u.displayName || u.email || "Student",
                  email: u.email || "",
                  points: u.points ?? 0,
                  avatar: u.photoURL || undefined,
                  isVip: isVipUser,
                  role: u.role || "student",
                });
              }
            });

            newState.vipUsers = vipCount;
            newState.freeUsers = freeCount;
            newState.paidVipUsers = paidCount;
            newState.giftedVipUsers = giftedCount;
            newState.giftedVipList = giftedVipArr;
            newState.todayLogins = todayLogins;
            newState.newUsersThisWeek = newThisWeek;
            newState.topPlayers = topPlayersArr.sort((a, b) => b.points - a.points).slice(0, 10);

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
                try {
                  const date = toDate(u.createdAt);
                  if (!isNaN(date.getTime())) {
                    const month = date.toLocaleString("default", { month: "short" });
                    monthCounts[month] = (monthCounts[month] || 0) + 1;
                  }
                } catch {}
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
            let qCount = 0,
              qTokens = 0;
            let tCount = 0,
              tTokens = 0;
            let mCount = 0,
              mTokens = 0;
            let qaCount = 0,
              qaTokens = 0;
            let realTokensAccumulated = 0;
            let realAiReqs = 0;

            const logs = snapshot.docs.map((d) => {
              const logData = d.data();
              const actionUpper = (logData.action || "").toUpperCase();
              const detailsUpper = (logData.details || "").toUpperCase();
              const typeLower = (logData.type || "").toLowerCase();
              const tokens =
                typeof logData.totalTokens === "number" && logData.totalTokens > 0
                  ? logData.totalTokens
                  : 0;

              if (
                actionUpper.includes("AI") ||
                actionUpper.includes("QUIZ") ||
                actionUpper.includes("TRANSCRIBE") ||
                actionUpper.includes("MINDMAP") ||
                typeLower ||
                tokens > 0
              ) {
                if (tokens > 0) {
                  realTokensAccumulated += tokens;
                  realAiReqs++;
                }

                if (
                  typeLower === "quiz" ||
                  actionUpper.includes("QUIZ") ||
                  detailsUpper.includes("QUIZ")
                ) {
                  qCount++;
                  qTokens += tokens;
                } else if (
                  typeLower === "transcribe" ||
                  actionUpper.includes("TRANSCRIBE") ||
                  detailsUpper.includes("AUDIO") ||
                  detailsUpper.includes("TRANSCRI")
                ) {
                  tCount++;
                  tTokens += tokens;
                } else if (
                  typeLower === "mindmap" ||
                  actionUpper.includes("MINDMAP") ||
                  detailsUpper.includes("MINDMAP") ||
                  detailsUpper.includes("SUMMARY")
                ) {
                  mCount++;
                  mTokens += tokens;
                } else {
                  qaCount++;
                  qaTokens += tokens;
                }
              }

              return {
                id: d.id,
                ...logData,
                timestamp: normalizeDate(logData.timestamp),
              } as ActivityLog;
            });

            newState.recentLogs = logs.slice(0, 8);
            newState.realTokensSum = realTokensAccumulated;
            newState.realAiRequestsCount = realAiReqs;

            newState.quizAiCount = qCount;
            newState.quizAiTokens = qTokens;
            newState.transcribeAiCount = tCount;
            newState.transcribeAiTokens = tTokens;
            newState.mindmapAiCount = mCount;
            newState.mindmapAiTokens = mTokens;
            newState.qaAiCount = qaCount;
            newState.qaAiTokens = qaTokens;
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

  const handleRevokeGiftedVip = async (targetUid: string) => {
    try {
      const { userService } = await import("@/services/user.service");
      await userService.update(targetUid, {
        isVip: false,
        subscriptionTier: "free",
        vipType: undefined,
        vipGrantedBy: undefined,
        vipGrantedAt: undefined,
      });
      toast.success(
        language === "ar"
          ? "تم إلغاء الاشتراك المجاني للمستخدم بنجاح"
          : "Complimentary VIP revoked successfully"
      );
    } catch (err) {
      console.error(err);
      toast.error(language === "ar" ? "حدث خطأ أثناء إلغاء VIP" : "Failed to revoke VIP");
    }
  };

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
      AI_GENERATION: { en: "AI Generation", ar: "توليد بالذكاء الاصطناعي" },
    };

    if (map[action]) return map[action][lang === "ar" ? "ar" : "en"];

    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // AI Token & Cost Metrics (Direct Real Firestore Aggregation - 100% Empirical)
  const aiCalculatedMetrics = useMemo(() => {
    const totalTokens = data.realTokensSum;
    const totalRequests = data.realAiRequestsCount;

    const quizTokens = data.quizAiTokens || 0;
    const transcribeTokens = data.transcribeAiTokens || 0;
    const mindmapTokens = data.mindmapAiTokens || 0;
    const qaTokens = data.qaAiTokens || 0;

    const costUsd = (totalTokens / 1000) * 0.000075;
    const costEgp = costUsd * 50;

    return {
      quizTokens,
      transcribeTokens,
      mindmapTokens,
      qaTokens,
      totalTokens,
      totalRequests,
      costUsd,
      costEgp,
    };
  }, [data]);

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
        label: language === "ar" ? "مستخدمو VIP" : "VIP Users",
        value: data.vipUsers,
        icon: Crown,
        color: "bg-amber-500",
        description: language === "ar" ? "مشتركون في الباقة المميزة" : "Active VIP subscribers",
      },
      {
        label: language === "ar" ? "إهداءات VIP المجانية" : "Gifted VIP Value",
        value: `${(data.giftedVipUsers * 199).toLocaleString()} EGP`,
        icon: Gift,
        color: "bg-rose-500",
        description:
          language === "ar"
            ? "قيمة ترم واحد لكل اشتراك مجاني"
            : "Waived semester value (199 EGP × gifted)",
      },
      {
        label: language === "ar" ? "استهلاك الذكاء الاصطناعي" : "AI Tokens Used",
        value: aiCalculatedMetrics.totalTokens.toLocaleString(),
        icon: Cpu,
        color: "bg-purple-500",
        description:
          language === "ar" ? "إجمالي التوكينز لمعالجة Gemini" : "Total Gemini API tokens",
      },
      {
        label: language === "ar" ? "تسجيلات اليوم" : "Today's Logins",
        value: data.todayLogins,
        icon: UserCheck,
        color: "bg-teal-500",
        description: language === "ar" ? "دخلوا المنصة اليوم" : "Logged in today",
      },
      {
        label: language === "ar" ? "مستخدمون جدد (7 أيام)" : "New Users (7d)",
        value: data.newUsersThisWeek,
        icon: CalendarDays,
        color: "bg-sky-500",
        description: language === "ar" ? "تسجيلات الأسبوع الأخير" : "Registered last 7 days",
      },
      {
        label: language === "ar" ? "المواد الدراسية" : "Academic Subjects",
        value: data.totalSubjects,
        icon: BookOpen,
        color: "bg-indigo-500",
        description: language === "ar" ? "إجمالي المواد المتاحة" : "Total course modules",
      },
      {
        label: language === "ar" ? "المصادر التعليمية" : "Learning Resources",
        value: data.totalResources,
        icon: Database,
        color: "bg-orange-500",
        description: language === "ar" ? "ملفات وروابط دراسية" : "Total available assets",
      },
    ],
    [data, aiCalculatedMetrics, language]
  );

  const analyticsSections = useMemo(
    () => [
      {
        id: "overview",
        label: language === "ar" ? "نظرة عامة شاملة" : "Executive Overview",
        desc: language === "ar" ? "الملخص العام ومؤشرات التفاعل" : "Executive dashboard & KPIs",
        icon: BarChart3,
      },
      {
        id: "subscriptions",
        label: language === "ar" ? "الاشتراكات والإهداءات" : "Subscriptions & Gifted VIPs",
        desc: language === "ar" ? "سجل المستفيدين والقيمة المحيدة" : "Financial waived roster",
        icon: Gift,
      },
      {
        id: "ai_analytics",
        label: language === "ar" ? "استهلاك الذكاء الاصطناعي" : "AI Tokens & API Costs",
        desc: language === "ar" ? "التوكينز الحقيقية وتكاليف Gemini" : "Real tokens & API costs",
        icon: Cpu,
      },
      {
        id: "students",
        label: language === "ar" ? "أوائل الطلاب المتصدرين" : "Top Students Leaderboard",
        desc: language === "ar" ? "لوحة المتصدرين والنقاط" : "XP Leaderboard & points",
        icon: Trophy,
      },
      {
        id: "subjects",
        label: language === "ar" ? "المواد الأكاديمية" : "Academic Subjects",
        desc: language === "ar" ? "مشاهدات المواد والتفاعل" : "Course engagement & views",
        icon: BookOpen,
      },
      {
        id: "users",
        label: language === "ar" ? "المستفيدين والنمو" : "User Segments & Growth",
        desc: language === "ar" ? "توزيع الأدوار ونمو الأعضاء" : "Roles distribution & growth",
        icon: Users,
      },
      {
        id: "audit",
        label: language === "ar" ? "سجل الأمان الإداري" : "Security Audit Trail",
        desc: language === "ar" ? "سجل العمليات والتأمين" : "Administrative audit log",
        icon: ShieldCheck,
      },
    ],
    [language]
  );

  const selectedSection = useMemo(
    () => analyticsSections.find((s) => s.id === activeTab),
    [analyticsSections, activeTab]
  );

  const filteredGiftedVipList = useMemo(() => {
    if (!giftedSearchTerm.trim()) return data.giftedVipList;
    const term = giftedSearchTerm.toLowerCase();
    return data.giftedVipList.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.grantedBy || "").toLowerCase().includes(term)
    );
  }, [data.giftedVipList, giftedSearchTerm]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.info(language === "ar" ? "تم تحديث البيانات" : "Data synchronized");
    }, 800);
  };

  const handleDeleteLog = async (logId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "logs", logId));
      toast.success(language === "ar" ? "تم حذف السجل بنجاح" : "Audit log deleted");
    } catch (error) {
      console.error("Error deleting log:", error);
      toast.error(language === "ar" ? "فشل حذف السجل" : "Failed to delete log");
    }
  };

  const handleClearAllLogs = async () => {
    if (!db) return;
    if (
      !confirm(
        language === "ar"
          ? "هل أنت متأكد من مسح جميع السجلات؟ هذا الإجراء لا يمكن التراجع عنه."
          : "Are you sure you want to clear all audit logs? This action cannot be undone."
      )
    )
      return;
    try {
      const logsSnapshot = await getDocs(collection(db, "logs"));
      const batch = writeBatch(db);
      logsSnapshot.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
      toast.success(language === "ar" ? "تم مسح جميع السجلات" : "All audit logs cleared");
    } catch (error) {
      console.error("Error clearing logs:", error);
      toast.error(language === "ar" ? "فشل مسح السجلات" : "Failed to clear audit logs");
    }
  };

  const handleResetStats = async () => {
    const firestore = db;
    if (!firestore) return;

    setLoading(true);
    setShowResetModal(false);
    try {
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

      logsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

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
      <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-primary/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <BarChart3 className="w-7 h-7" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              <span>
                {language === "ar"
                  ? "لوحة تحليلات الإدارة والمالية"
                  : "Owner Command & Financial Analytics"}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                Live 🟢
              </span>
            </h1>
          </div>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm font-medium opacity-80 ps-1">
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all active:scale-95 font-bold text-xs border border-destructive/20 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>{language === "ar" ? "تصفير الإحصائيات" : "Reset All Stats"}</span>
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 disabled:opacity-50 text-xs font-bold border border-primary/20 shadow-sm"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            <span>{language === "ar" ? "تحديث التزامن" : "Sync Data"}</span>
          </button>
        </div>
      </FadeIn>

      {loading ? (
        <LoadingAnalyticsPage />
      ) : (
        <StaggerChildren className="space-y-8">
          {/* Global UI Custom Analytics Section Select Dropdown List */}
          <div className="bg-card border border-border rounded-3xl p-5 shadow-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                  <ListFilter size={22} />
                </span>
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
                    {language === "ar"
                      ? "قائمة أقسام التحليلات والمالية"
                      : "Analytics Section Select List"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {language === "ar"
                      ? "افتح القائمة وافحص الأقسام التحليلية المتاحة للتنقل"
                      : "Click to open the list menu and select any analytical section"}
                  </p>
                </div>
              </div>

              {/* Custom Animated Popup Menu Dropdown */}
              <div className="relative w-full sm:w-96" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-muted/40 hover:bg-muted/70 border border-border hover:border-primary/50 text-foreground font-black text-sm shadow-md transition-all active:scale-[0.99] group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="p-2 rounded-xl bg-primary/15 text-primary border border-primary/20 shrink-0">
                      {selectedSection ? (
                        <selectedSection.icon size={18} />
                      ) : (
                        <ListFilter size={18} />
                      )}
                    </span>
                    <div className="text-left rtl:text-right min-w-0">
                      <p className="font-black text-xs sm:text-sm text-foreground truncate">
                        {selectedSection?.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate font-medium">
                        {selectedSection?.desc}
                      </p>
                    </div>
                  </div>
                  <div className="p-1 rounded-lg bg-background text-muted-foreground group-hover:text-primary transition-colors shrink-0 shadow-sm">
                    <motion.div
                      animate={{ rotate: dropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </div>
                </button>

                {/* Custom Glassmorphism Animated Dropdown List */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 right-0 top-full mt-2 z-50 rounded-3xl bg-card/95 border border-border shadow-2xl backdrop-blur-2xl p-2"
                    >
                      <div className="max-h-96 overflow-y-auto pe-1 space-y-1.5 custom-scrollbar">
                        {analyticsSections.map((sec) => {
                          const SecIcon = sec.icon;
                          const isSelected = activeTab === sec.id;
                          return (
                            <button
                              key={sec.id}
                              type="button"
                              onClick={() => {
                                setActiveTab(sec.id as typeof activeTab);
                                setDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between gap-3 p-3 rounded-2xl text-left rtl:text-right transition-all duration-200 group cursor-pointer",
                                isSelected
                                  ? "bg-primary text-primary-foreground font-black shadow-lg shadow-primary/25"
                                  : "hover:bg-muted/70 text-foreground font-bold"
                              )}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span
                                  className={cn(
                                    "p-2 rounded-xl border transition-colors shrink-0",
                                    isSelected
                                      ? "bg-white/20 text-white border-white/30"
                                      : "bg-muted text-muted-foreground border-border group-hover:text-primary group-hover:bg-primary/10"
                                  )}
                                >
                                  <SecIcon size={18} />
                                </span>
                                <div className="min-w-0">
                                  <p
                                    className={cn(
                                      "text-xs sm:text-sm font-black truncate",
                                      isSelected ? "text-white" : "text-foreground"
                                    )}
                                  >
                                    {sec.label}
                                  </p>
                                  <p
                                    className={cn(
                                      "text-[10px] truncate font-medium",
                                      isSelected ? "text-white/80" : "text-muted-foreground"
                                    )}
                                  >
                                    {sec.desc}
                                  </p>
                                </div>
                              </div>
                              {isSelected && (
                                <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0 shadow-sm animate-pulse" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Active Selected Section Banner */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-foreground font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{language === "ar" ? "القسم المختار حالياً:" : "Current Section:"}</span>
                <span className="px-3 py-1 rounded-xl bg-primary/15 text-primary border border-primary/20 font-black">
                  {selectedSection?.label}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
                {selectedSection?.desc}
              </span>
            </div>
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              {/* Main Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <ScaleIn
                      key={idx}
                      className="group relative overflow-hidden bg-card rounded-4xl p-7 border border-border/50 hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-primary/5"
                    >
                      <div
                        className={cn(
                          "absolute -right-4 -top-4 w-32 h-32 opacity-10 rounded-full blur-3xl transition-all duration-500 group-hover:opacity-20",
                          stat.color
                        )}
                      />

                      <div className="relative flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                          <div
                            className={cn(
                              "p-3.5 rounded-2xl text-white shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                              stat.color
                            )}
                          >
                            <Icon size={26} />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors duration-500">
                              {stat.value}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-foreground">{stat.label}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 font-medium italic">
                            {stat.description}
                          </p>
                        </div>
                      </div>
                    </ScaleIn>
                  );
                })}
              </div>

              {/* Financial & AI Quick Banners */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScaleIn className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Gift className="text-amber-500" size={28} />
                      <div>
                        <h2 className="text-lg font-black text-foreground">
                          {language === "ar"
                            ? "ملخص الاشتراكات والإهداءات"
                            : "Subscriptions & Waived Value"}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar"
                            ? "قيمة الاشتراكات المحيدة مجاناً للطلاب والمشرفين"
                            : "Complimentary VIP value granted without payment"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("subscriptions")}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30 transition-all"
                    >
                      {language === "ar" ? "عرض التفاصيل ←" : "View Roster →"}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                    <div className="bg-card/80 p-3 rounded-2xl border border-border">
                      <p className="text-xs text-muted-foreground font-semibold">
                        {language === "ar" ? "VIP مجاني" : "Gifted VIPs"}
                      </p>
                      <p className="text-xl font-black text-amber-500">{data.giftedVipUsers}</p>
                    </div>
                    <div className="bg-card/80 p-3 rounded-2xl border border-border">
                      <p className="text-xs text-muted-foreground font-semibold">
                        {language === "ar"
                          ? "قيمة الترم (199 EGP × عدد)"
                          : "Semester Value (199 EGP × gifted)"}
                      </p>
                      <p className="text-xl font-black text-foreground">
                        {(data.giftedVipUsers * 199).toLocaleString()} EGP
                      </p>
                    </div>
                    <div className="bg-card/80 p-3 rounded-2xl border border-border">
                      <p className="text-xs text-muted-foreground font-semibold">
                        {language === "ar"
                          ? "قيمة شهرية (49 EGP × عدد)"
                          : "Monthly Value (49 EGP × gifted)"}
                      </p>
                      <p className="text-xl font-black text-emerald-500">
                        {(data.giftedVipUsers * 49).toLocaleString()} EGP
                      </p>
                    </div>
                  </div>
                </ScaleIn>

                <ScaleIn className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/30 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Cpu className="text-purple-500" size={28} />
                      <div>
                        <h2 className="text-lg font-black text-foreground">
                          {language === "ar" ? "تكاليف الذكاء الاصطناعي" : "AI API Costs & Tokens"}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {language === "ar"
                            ? "استهلاك محرك Google Gemini الفعلي للمنصة"
                            : "Real Google Gemini API usage & tokens"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("ai_analytics")}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/30 transition-all"
                    >
                      {language === "ar" ? "الحاسبة والاستهلاك ←" : "AI Calculator →"}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                    <div className="bg-card/80 p-3 rounded-2xl border border-border">
                      <p className="text-xs text-muted-foreground font-semibold">
                        {language === "ar" ? "الطلبات" : "AI Requests"}
                      </p>
                      <p className="text-xl font-black text-purple-500">
                        {aiCalculatedMetrics.totalRequests.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-card/80 p-3 rounded-2xl border border-border">
                      <p className="text-xs text-muted-foreground font-semibold">
                        {language === "ar" ? "التوكينز" : "Total Tokens"}
                      </p>
                      <p className="text-xl font-black text-foreground">
                        {(aiCalculatedMetrics.totalTokens / 1000).toFixed(0)}k
                      </p>
                    </div>
                    <div className="bg-card/80 p-3 rounded-2xl border border-border">
                      <p className="text-xs text-muted-foreground font-semibold">
                        {language === "ar" ? "التقدير بالجنية" : "Cost (EGP)"}
                      </p>
                      <p className="text-xl font-black text-rose-500">
                        {aiCalculatedMetrics.costEgp.toFixed(2)} EGP
                      </p>
                    </div>
                  </div>
                </ScaleIn>
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
            </div>
          )}

          {/* SUBSCRIPTIONS & GIFTED VIPS TAB */}
          {activeTab === "subscriptions" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              {/* Financial Headline Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ScaleIn className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 shadow-md space-y-2">
                  <Crown className="text-amber-500" size={28} />
                  <p className="text-3xl font-black text-foreground">{data.vipUsers}</p>
                  <p className="text-sm font-bold text-foreground">
                    {language === "ar" ? "إجمالي مشتركين VIP" : "Total VIP Holders"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "ar" ? "مدفوعين ومجانيين" : "Paid + Complimentary"}
                  </p>
                </ScaleIn>

                <ScaleIn className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-2">
                  <CreditCard className="text-emerald-500" size={28} />
                  <p className="text-3xl font-black text-foreground">{data.paidVipUsers}</p>
                  <p className="text-sm font-bold text-foreground">
                    {language === "ar" ? "المشتركين المدفوعين" : "Active Paid Subscribers"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "ar" ? "عبر بوابات الدفع" : "Via live payment gateways"}
                  </p>
                </ScaleIn>

                <ScaleIn className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-2">
                  <Gift className="text-rose-500" size={28} />
                  <p className="text-3xl font-black text-foreground">{data.giftedVipUsers}</p>
                  <p className="text-sm font-bold text-foreground">
                    {language === "ar" ? "إهداءات VIP (مجاني)" : "Complimentary Gifted VIPs"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "ar" ? "ممنوحة من الإدارة/المالك" : "Granted by Owner / Admin"}
                  </p>
                </ScaleIn>

                <ScaleIn className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-2">
                  <Receipt className="text-amber-600" size={28} />
                  <p className="text-3xl font-black text-foreground">
                    {(data.giftedVipUsers * 49).toLocaleString()}{" "}
                    <span className="text-xs font-bold text-muted-foreground">EGP / mo</span>
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {language === "ar" ? "قيمة الفائدة المحيدة" : "Monthly Waived Benefit"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ${((data.giftedVipUsers * 49) / 50).toFixed(1)} USD / mo{" "}
                    {language === "ar" ? "تكلفة مجانية" : "waived cost"}
                  </p>
                </ScaleIn>
              </div>

              {/* Complimentary / Gifted VIP Roster Table */}
              <ScaleIn className="rounded-3xl bg-card border border-border shadow-md overflow-hidden space-y-4">
                <div className="px-6 py-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Gift className="text-amber-500" size={24} />
                    <div>
                      <h2 className="text-lg font-black text-foreground">
                        {language === "ar"
                          ? "سجل مستفيدي VIP المجاني (الإهداءات)"
                          : "Complimentary VIP Beneficiaries Roster"}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {language === "ar"
                          ? "قائمة الطلاب والأعضاء الذين تم منحهم اشتراك VIP مجاناً دون دفع، وحساب قيمتها"
                          : "Roster of members granted free VIP access without payment, including waived cost analysis"}
                      </p>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full md:w-72">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder={
                        language === "ar" ? "بحث بالاسم أو البريد..." : "Search name or email..."
                      }
                      value={giftedSearchTerm}
                      onChange={(e) => setGiftedSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-muted/50 border border-border focus:outline-none focus:border-primary text-foreground"
                    />
                  </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                      <tr>
                        <th className="px-6 py-3">
                          {language === "ar" ? "المستفيد" : "Beneficiary"}
                        </th>
                        <th className="px-6 py-3">{language === "ar" ? "الدور" : "Role"}</th>
                        <th className="px-6 py-3">{language === "ar" ? "نوع VIP" : "VIP Type"}</th>
                        <th className="px-6 py-3">
                          {language === "ar" ? "تاريخ التفعيل" : "Granted Date"}
                        </th>
                        <th className="px-6 py-3">
                          {language === "ar" ? "منحت بواسطة" : "Granted By"}
                        </th>
                        <th className="px-6 py-3">
                          {language === "ar" ? "الفائدة الشهري" : "Monthly Value"}
                        </th>
                        <th className="px-6 py-3 text-right">
                          {language === "ar" ? "الإجراء" : "Action"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredGiftedVipList.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-12 text-center text-muted-foreground italic"
                          >
                            {giftedSearchTerm
                              ? language === "ar"
                                ? "لا توجد نتائج مطابقة للبحث"
                                : "No matching beneficiaries found"
                              : language === "ar"
                                ? "لا يوجد مستفيدون من VIP المجاني حالياً"
                                : "No complimentary VIP beneficiaries currently"}
                          </td>
                        </tr>
                      ) : (
                        filteredGiftedVipList.map((user) => (
                          <tr key={user.uid} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-muted-foreground">
                                  {user.avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={user.avatar}
                                      alt={user.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    user.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-foreground truncate">{user.name}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit">
                                <Gift size={10} />
                                {language === "ar" ? "إهداء مجاني" : "Complimentary"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground font-mono text-[11px]">
                              {user.grantedAt
                                ? new Date(normalizeDate(user.grantedAt)).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="px-6 py-4 text-foreground font-medium">
                              {user.grantedBy}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded-md font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                49 EGP / mo
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleRevokeGiftedVip(user.uid)}
                                className="px-3 py-1.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all text-[11px] font-bold flex items-center gap-1 ml-auto"
                              >
                                <UserX size={12} />
                                {language === "ar" ? "إلغاء VIP" : "Revoke VIP"}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </ScaleIn>
            </div>
          )}

          {/* AI TOKENS & API COSTS TAB */}
          {activeTab === "ai_analytics" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              {/* AI Headline Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ScaleIn className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/15 via-purple-500/5 to-transparent border border-purple-500/30 shadow-md space-y-2">
                  <Zap className="text-purple-500" size={28} />
                  <p className="text-3xl font-black text-foreground">
                    {aiCalculatedMetrics.totalRequests.toLocaleString()}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {language === "ar" ? "إجمالي طلبات AI الحقيقية" : "Real AI Generation Requests"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "ar"
                      ? "محدثة فورياً عند المحادثة"
                      : "Updated live from Firestore logs"}
                  </p>
                </ScaleIn>

                <ScaleIn className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-2">
                  <BrainCircuit className="text-indigo-500" size={28} />
                  <p className="text-3xl font-black text-foreground">
                    {aiCalculatedMetrics.totalTokens.toLocaleString()}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {language === "ar" ? "إجمالي التوكينز الحقيقية" : "Real Tokens Processed"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "ar"
                      ? "مدخلات ومخرجات Google Gemini"
                      : "Real Gemini Input & Output Tokens"}
                  </p>
                </ScaleIn>

                <ScaleIn className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-2">
                  <Coins className="text-emerald-500" size={28} />
                  <p className="text-3xl font-black text-foreground">
                    ${aiCalculatedMetrics.costUsd.toFixed(4)}
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {language === "ar"
                      ? "تكلفة السيرفر الفعلية (USD)"
                      : "Real Gemini API Cost (USD)"}
                  </p>
                  <p className="text-xs text-muted-foreground">$0.000075 / 1k tokens (Flash)</p>
                </ScaleIn>

                <ScaleIn className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-2">
                  <Receipt className="text-rose-500" size={28} />
                  <p className="text-3xl font-black text-foreground">
                    {aiCalculatedMetrics.costEgp.toFixed(2)}{" "}
                    <span className="text-xs font-bold text-muted-foreground">EGP</span>
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {language === "ar"
                      ? "تكلفة السيرفر الفعلية (بالجنية)"
                      : "Real Gemini API Cost (EGP)"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "ar" ? "بسعر 50 جنيه للدولار" : "@ 50 EGP per USD"}
                  </p>
                </ScaleIn>
              </div>

              {/* Service Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                      <Sparkles size={20} />
                    </span>
                    <div>
                      <h4 className="font-bold text-sm">
                        {language === "ar" ? "مولد الاختبارات AI" : "AI Quiz Generator"}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">~2,500 tokens / quiz</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "الطلبات:" : "Requests:"}
                      </span>
                      <span className="font-bold">{data.quizAiCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "التوكينز:" : "Tokens:"}
                      </span>
                      <span className="font-bold">
                        {aiCalculatedMetrics.quizTokens.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "التكلفة:" : "Cost:"}
                      </span>
                      <span className="font-bold text-rose-500">
                        {((aiCalculatedMetrics.quizTokens / 1000) * 0.000075 * 50).toFixed(2)} EGP
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                      <Bot size={20} />
                    </span>
                    <div>
                      <h4 className="font-bold text-sm">
                        {language === "ar" ? "التفريغ والتلخيص الصوتي" : "Audio Transcriber"}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">~3,500 tokens / audio</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "الطلبات:" : "Requests:"}
                      </span>
                      <span className="font-bold">{data.transcribeAiCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "التوكينز:" : "Tokens:"}
                      </span>
                      <span className="font-bold">
                        {aiCalculatedMetrics.transcribeTokens.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "التكلفة:" : "Cost:"}
                      </span>
                      <span className="font-bold text-rose-500">
                        {((aiCalculatedMetrics.transcribeTokens / 1000) * 0.000075 * 50).toFixed(2)}{" "}
                        EGP
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                      <BrainCircuit size={20} />
                    </span>
                    <div>
                      <h4 className="font-bold text-sm">
                        {language === "ar" ? "الخرائط الذهنية الذكية" : "AI Mindmap Generator"}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">~2,000 tokens / map</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "الطلبات:" : "Requests:"}
                      </span>
                      <span className="font-bold">{data.mindmapAiCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "التوكينز:" : "Tokens:"}
                      </span>
                      <span className="font-bold">
                        {aiCalculatedMetrics.mindmapTokens.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "التكلفة:" : "Cost:"}
                      </span>
                      <span className="font-bold text-rose-500">
                        {((aiCalculatedMetrics.mindmapTokens / 1000) * 0.000075 * 50).toFixed(2)}{" "}
                        EGP
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <Zap size={20} />
                    </span>
                    <div>
                      <h4 className="font-bold text-sm">
                        {language === "ar" ? "مساعد الأسئلة والأجوبة" : "Q&A AI Assistant"}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">~1,500 tokens / msg</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "الطلبات:" : "Requests:"}
                      </span>
                      <span className="font-bold">{data.qaAiCount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "التوكينز:" : "Tokens:"}
                      </span>
                      <span className="font-bold">
                        {aiCalculatedMetrics.qaTokens.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "التكلفة:" : "Cost:"}
                      </span>
                      <span className="font-bold text-rose-500">
                        {((aiCalculatedMetrics.qaTokens / 1000) * 0.000075 * 50).toFixed(2)} EGP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complimentary Gifted VIP Valuation Summary Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-500/30 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
                      <Crown size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-foreground">
                        {language === "ar"
                          ? "حاسبة القيمة الإجمالية لاشتراكات VIP الممنوحة مجاناً"
                          : "Granted Complimentary VIP Subscriptions Valuation"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {language === "ar"
                          ? "إحصائية حقيقية بقيمة الاشتراكات المعفاة الممنوحة للطلاب بدون دفع"
                          : "Empirical calculation of waived VIP subscription costs granted to students by admin"}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-black border border-amber-500/30">
                    {data.giftedVipUsers || data.vipUsers}{" "}
                    {language === "ar" ? "مستخدم VIP" : "VIP Users"}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-card border border-border space-y-1">
                    <p className="text-xs text-muted-foreground font-bold">
                      {language === "ar"
                        ? "عدد الاشتراكات المجانية الممنوحة"
                        : "Total Gifted VIP Beneficiaries"}
                    </p>
                    <p className="text-3xl font-black text-amber-500">
                      {data.giftedVipUsers} {language === "ar" ? "طلاب" : "students"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {language === "ar" ? "حسابات نشطة مجانية 👑" : "Active gifted VIP accounts"}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      {language === "ar"
                        ? "القيمة الإجمالية المعفاة (اشتراك الترم)"
                        : "Waived Semester Subscription Value"}
                    </p>
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                      {(data.giftedVipUsers * 199).toLocaleString()} EGP
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      @ 199 EGP /{" "}
                      {language === "ar" ? "ترم كامل لكل مستخدم" : "full semester per user"}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold">
                      {language === "ar"
                        ? "القيمة الشهرية المعفاة الإجمالية"
                        : "Waived Monthly Value"}
                    </p>
                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                      {(data.giftedVipUsers * 49).toLocaleString()} EGP
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      @ 49 EGP / {language === "ar" ? "شهرياً لكل مستخدم" : "month per user"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TOP STUDENTS TAB */}
          {activeTab === "students" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Header row: VIP vs Free */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ScaleIn className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 to-yellow-500/5 border border-amber-500/30 shadow-md space-y-2">
                  <Crown className="text-amber-500" size={28} />
                  <p className="text-3xl font-black text-foreground">{data.vipUsers}</p>
                  <p className="text-sm font-bold text-foreground">
                    {language === "ar" ? "مستخدمو VIP" : "VIP Users"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "ar" ? "يستمتعون بجميع مميزات بلس" : "Enjoying all VIP perks"}
                  </p>
                </ScaleIn>
                <ScaleIn className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-2">
                  <Users className="text-blue-500" size={28} />
                  <p className="text-3xl font-black text-foreground">{data.freeUsers}</p>
                  <p className="text-sm font-bold text-foreground">
                    {language === "ar" ? "مستخدمو الباقة المجانية" : "Free Plan Users"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "ar" ? "على الباقة الأساسية" : "On the basic free plan"}
                  </p>
                </ScaleIn>
                <ScaleIn className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-2">
                  <Activity className="text-emerald-500" size={28} />
                  <p className="text-3xl font-black text-foreground">
                    {data.totalUsers > 0 ? Math.round((data.vipUsers / data.totalUsers) * 100) : 0}%
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {language === "ar" ? "نسبة VIP" : "VIP Rate"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "ar" ? "من إجمالي المستخدمين" : "Of total users"}
                  </p>
                </ScaleIn>
              </div>

              {/* Top 10 Students Leaderboard */}
              <ScaleIn className="rounded-3xl bg-card border border-border shadow-md overflow-hidden">
                <div className="px-6 py-5 border-b border-border flex items-center gap-3">
                  <Trophy className="text-amber-500" size={22} />
                  <div>
                    <h2 className="text-lg font-black text-foreground">
                      {language === "ar" ? "أوائل 10 طلاب على المنصة" : "Top 10 Students"}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {language === "ar" ? "مرتبون حسب إجمالي النقاط" : "Ranked by total XP points"}
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-border">
                  {data.topPlayers.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground flex flex-col items-center gap-3">
                      <Trophy size={40} className="opacity-20" />
                      <p className="font-semibold italic text-sm">
                        {language === "ar"
                          ? "لا يوجد طلاب بنقاط بعد"
                          : "No students with points yet"}
                      </p>
                    </div>
                  ) : (
                    data.topPlayers.map((student, idx) => (
                      <div
                        key={student.uid}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                      >
                        {/* Rank badge */}
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0",
                            idx === 0
                              ? "bg-amber-400 text-black shadow-lg shadow-amber-400/30"
                              : idx === 1
                                ? "bg-slate-300 text-black"
                                : idx === 2
                                  ? "bg-amber-700 text-white"
                                  : "bg-muted text-muted-foreground"
                          )}
                        >
                          {idx + 1}
                        </div>
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-xl bg-muted border border-border overflow-hidden shrink-0">
                          {student.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-black text-muted-foreground">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        {/* Name & email */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm text-foreground truncate">
                              {student.name}
                            </p>
                            {student.isVip && (
                              <Crown size={12} className="text-amber-500 shrink-0" />
                            )}
                            {student.role === "owner" && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                                OWNER
                              </span>
                            )}
                            {student.role === "admin" && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-bold border border-purple-500/20">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {student.email}
                          </p>
                        </div>
                        {/* Points */}
                        <div className="text-right shrink-0">
                          <p className="font-black text-lg text-foreground">
                            {student.points.toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            {language === "ar" ? "نقطة" : "pts"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScaleIn>
            </div>
          )}

          {/* SUBJECTS TAB */}
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

          {/* USERS TAB */}
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

          {/* AUDIT TAB */}
          {activeTab === "audit" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <ScaleIn className="bg-card rounded-[2.5rem] p-8 border border-border/50 shadow-sm flex flex-col gap-6 group">
                <div className="border-b border-border pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-indigo-500 group-hover:scale-110 transition-transform" />
                      {language === "ar"
                        ? "سجل العمليات الإدارية والأمان"
                        : "Administrative Audit Trail"}
                    </h2>
                  </div>
                  {data.recentLogs.length > 0 && (
                    <button
                      onClick={handleClearAllLogs}
                      className="px-3 py-1.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all active:scale-95 text-xs font-bold border border-destructive/20 shadow-sm flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      {language === "ar" ? "مسح الكل" : "Clear All"}
                    </button>
                  )}
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
                            log.action.includes("CREATE") || log.action.includes("GENERATED")
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
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0">
                          <div className="text-xs font-mono font-black text-primary/40 whitespace-nowrap">
                            {log.timestamp
                              ? new Date(normalizeDate(log.timestamp)).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </div>
                          <button
                            onClick={() => handleDeleteLog(log.id)}
                            className="p-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover/log:opacity-100"
                            title={language === "ar" ? "حذف" : "Delete"}
                          >
                            <Trash2 size={16} />
                          </button>
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
