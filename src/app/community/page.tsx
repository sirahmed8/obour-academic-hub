"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth, useLanguage } from "@/contexts";
import { FadeIn } from "@/components/ui/Animations";
import { WhoIsOnline } from "@/components/features/WhoIsOnline";
import {
  Trophy,
  Crown,
  Flame,
  BookOpen,
  Swords,
  Zap,
  Users,
  Award,
  BarChart2,
  Target,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { UserProfileModal } from "@/components/ui/UserProfileModal";
import { ScaleIn, StaggerChildren } from "@/components/ui/Animations";

// ─── Types ────────────────────────────────────────────────────────────────────
interface LeaderEntry {
  uid: string;
  name: string;
  avatar?: string;
  department?: string;
  academicYear?: string;
  points: number;
  streakDays: number;
  resourceCount: number;
  battleWins: number;
  rank: number;
}

interface HallOfFameUser {
  rank: number;
  name: string;
  uid: string;
  dept: string;
  xp: number;
  badge: string;
}

// ─── Category Tabs ────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "xp",
    label: "XP Points",
    labelAr: "نقاط الخبرة",
    icon: Zap,
    color: "from-purple-600 to-indigo-600",
    accent: "purple",
  },
  {
    id: "streak",
    label: "Streaks 🔥",
    labelAr: "السلاسل 🔥",
    icon: Flame,
    color: "from-orange-600 to-red-600",
    accent: "orange",
  },
  {
    id: "resources",
    label: "Resources",
    labelAr: "الموارد",
    icon: BookOpen,
    color: "from-emerald-600 to-teal-600",
    accent: "emerald",
  },
  {
    id: "battles",
    label: "Battles ⚔️",
    labelAr: "المعارك ⚔️",
    icon: Swords,
    color: "from-blue-600 to-cyan-600",
    accent: "blue",
  },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

// ─── League Divisions ─────────────────────────────────────────────────────────
const LEAGUES = [
  {
    name: "Diamond",
    nameAr: "الماس",
    color: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    min: 5000,
    emoji: "💎",
  },
  {
    name: "Gold",
    nameAr: "ذهب",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    min: 2000,
    emoji: "🥇",
  },
  {
    name: "Silver",
    nameAr: "فضة",
    color: "text-slate-300",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    min: 1000,
    emoji: "🥈",
  },
  {
    name: "Bronze",
    nameAr: "برونز",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    min: 0,
    emoji: "🥉",
  },
];

function getLeague(points: number) {
  return LEAGUES.find((l) => points >= l.min) ?? LEAGUES[LEAGUES.length - 1];
}

// ─── Podium Component ─────────────────────────────────────────────────────────
function Podium({
  entries,
  onSelectUser,
}: {
  entries: LeaderEntry[];
  onSelectUser?: (uid: string) => void;
}) {
  const top3 = entries.slice(0, 3);
  // podium order: 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const heights = [top3[1] ? "h-20" : "h-0", "h-28", top3[2] ? "h-14" : "h-0"];
  const positions = [2, 1, 3];
  const rankColors = [
    "from-slate-400 to-slate-300",
    "from-amber-500 to-yellow-400",
    "from-orange-600 to-amber-500",
  ];
  const crowns = ["🥈", "🥇", "🥉"];

  return (
    <div className="flex items-end justify-center gap-3 pt-4 pb-2 px-2">
      {podiumOrder.map((entry, idx) => (
        <motion.div
          key={entry?.uid ?? idx}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.12, type: "spring", stiffness: 300, damping: 22 }}
          onClick={() => entry?.uid && onSelectUser?.(entry.uid)}
          className="flex flex-col items-center gap-2 cursor-pointer group"
        >
          {/* Avatar */}
          <div className="relative">
            <div
              className={cn(
                "rounded-full flex items-center justify-center bg-gradient-to-br text-white font-black text-sm border-2 shadow-lg group-hover:scale-110 transition-transform duration-300",
                idx === 1
                  ? "w-16 h-16 border-amber-400 shadow-amber-400/30"
                  : idx === 0
                    ? "w-14 h-14 border-slate-400 shadow-slate-400/20"
                    : "w-12 h-12 border-orange-500 shadow-orange-500/20",
                rankColors[idx]
              )}
            >
              {entry?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="absolute -top-2 -right-1 text-base">{crowns[idx]}</span>
          </div>
          {/* Name */}
          <div className="text-center">
            <p className="text-xs font-bold text-foreground truncate max-w-[72px] group-hover:text-primary transition-colors">
              {entry?.name?.split(" ")[0] ?? "—"}
            </p>
            <p className="text-[10px] text-muted-foreground font-semibold">
              {(entry?.points ?? 0).toLocaleString()} XP
            </p>
          </div>
          {/* Podium block */}
          <div
            className={cn(
              "w-16 rounded-t-xl flex items-center justify-center transition-all duration-500",
              heights[idx],
              idx === 1
                ? "bg-gradient-to-b from-amber-500/80 to-amber-700/60 border-t-2 border-amber-400"
                : idx === 0
                  ? "bg-gradient-to-b from-slate-400/60 to-slate-600/40 border-t-2 border-slate-400"
                  : "bg-gradient-to-b from-orange-600/60 to-orange-800/40 border-t-2 border-orange-600"
            )}
          >
            <span className="text-white font-black text-xl">#{positions[idx]}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Leaderboard Row ──────────────────────────────────────────────────────────
function LeaderRow({
  entry,
  category,
  currentUid,
  delay = 0,
  onSelectUser,
}: {
  entry: LeaderEntry;
  category: CategoryId;
  currentUid?: string;
  delay?: number;
  onSelectUser?: (uid: string) => void;
}) {
  const isSelf = entry.uid === currentUid;
  const league = getLeague(entry.points);
  const value =
    category === "xp"
      ? `${entry.points.toLocaleString()} XP`
      : category === "streak"
        ? `${entry.streakDays} days`
        : category === "resources"
          ? `${entry.resourceCount} files`
          : `${entry.battleWins} wins`;

  const medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35, type: "spring", stiffness: 280, damping: 25 }}
      onClick={() => onSelectUser?.(entry.uid)}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all cursor-pointer",
        isSelf
          ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20 shadow-lg shadow-primary/10"
          : "bg-card/40 border-border/30 hover:bg-card/60 hover:border-border/50"
      )}
    >
      {/* Rank */}
      <div className="w-8 text-center flex-shrink-0">
        {medal ? (
          <span className="text-xl">{medal}</span>
        ) : (
          <span className="text-sm font-black text-muted-foreground">#{entry.rank}</span>
        )}
      </div>

      {/* Avatar */}
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0",
          `bg-gradient-to-br ${CATEGORIES.find((c) => c.id === category)?.color ?? "from-purple-600 to-indigo-600"}`
        )}
      >
        {entry.name?.[0]?.toUpperCase() ?? "?"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={cn("text-sm font-bold truncate", isSelf ? "text-primary" : "text-foreground")}
        >
          {entry.name}
          {isSelf && <span className="ml-1 text-[10px] font-black text-primary/70">(You)</span>}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {entry.department ?? ""}
          {entry.academicYear ? ` • ${entry.academicYear}` : ""}
        </p>
      </div>

      {/* League badge */}
      <div
        className={cn(
          "hidden sm:flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-black border",
          league.bg,
          league.border,
          league.color
        )}
      >
        <span>{league.emoji}</span>
        <span>{league.name}</span>
      </div>

      {/* Value */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-black text-foreground">{value}</p>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CommunityLeaderboardPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [selectedUserUid, setSelectedUserUid] = useState<string | null>(null);

  // ─── Season Ceremony State ───────────────────────────────────────────────────
  const [champions, setChampions] = useState<HallOfFameUser[]>([]);
  const [ceremonyLoading, setCeremonyLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setCeremonyLoading(false);
      return;
    }
    getDocs(query(collection(db, "users"), orderBy("points", "desc"), limit(10)))
      .then((snap) => {
        const badges = [
          isAr ? "كأس التخرج الذهبي 🏆" : "Golden Graduation Trophy 🏆",
          isAr ? "بطل التركيز 🥇" : "Focus Master 🥇",
          isAr ? "رائد المجتمع الأكاديمي 🥈" : "Community Pioneer 🥈",
          isAr ? "نجم الفصل الدراسي ⭐" : "Semester Star ⭐",
          isAr ? "مثابر ممتاز 💪" : "Top Perseverer 💪",
        ];
        const list: HallOfFameUser[] = [];
        let r = 1;
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data.displayName && !data.name) return;
          list.push({
            rank: r,
            uid: docSnap.id,
            name: data.displayName || data.name || (isAr ? "طالب مميز" : "Top Scholar"),
            dept: data.department || (isAr ? "غير محدد" : "Undeclared"),
            xp: data.points || 0,
            badge: badges[r - 1] || (isAr ? "وسام التميز" : "Excellence Badge"),
          });
          r++;
        });
        setChampions(list);
      })
      .catch(() => {})
      .finally(() => setCeremonyLoading(false));
  }, [isAr]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("xp");
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "users"), orderBy("points", "desc"), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setTotalUsers(snap.size);
      const all: LeaderEntry[] = snap.docs.map((d, idx) => {
        const data = d.data();
        return {
          uid: d.id,
          name: data.displayName || data.email || "Unknown",
          avatar: data.photoURL,
          department: data.department,
          academicYear: data.academicYear,
          points: data.points ?? 0,
          streakDays: data.streakDays ?? 0,
          resourceCount: data.resourceCount ?? 0,
          battleWins: data.battleWins ?? 0,
          rank: idx + 1,
        };
      });
      setEntries(all);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Sort by active category
  const sorted = useMemo(() => {
    const copy = [...entries];
    const key: keyof LeaderEntry =
      activeCategory === "xp"
        ? "points"
        : activeCategory === "streak"
          ? "streakDays"
          : activeCategory === "resources"
            ? "resourceCount"
            : "battleWins";
    copy.sort((a, b) => (b[key] as number) - (a[key] as number));
    return copy.slice(0, 50).map((e, i) => ({ ...e, rank: i + 1 }));
  }, [entries, activeCategory]);

  // Current user's rank in the current category
  const myRank = sorted.findIndex((e) => e.uid === user?.uid) + 1;
  const myEntry = sorted.find((e) => e.uid === user?.uid);

  // Stats
  const totalXP = entries.reduce((s, e) => s + e.points, 0);
  const avgXP = entries.length ? Math.round(totalXP / entries.length) : 0;
  const topStreak = Math.max(...entries.map((e) => e.streakDays), 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* ── Header ──────────────────────────────────────────────── */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-[#0f172a] border border-amber-500/30 p-6 shadow-2xl text-white dark:bg-[#090d16]">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30">
                  <Trophy className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">
                    {isAr ? "لوحة الصدارة" : "Leaderboard & Arena"}
                  </h1>
                  <p className="text-sm text-white/60 font-medium">
                    {isAr
                      ? "تنافس واصعد في الترتيب"
                      : "Compete, level up, and dominate the rankings"}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[
                  {
                    label: isAr ? "طلاب" : "Students",
                    value: totalUsers,
                    icon: Users,
                    color: "text-blue-400",
                  },
                  {
                    label: isAr ? "متوسط XP" : "Avg XP",
                    value: avgXP.toLocaleString(),
                    icon: Zap,
                    color: "text-purple-400",
                  },
                  {
                    label: isAr ? "أعلى سلسلة" : "Top Streak",
                    value: `${topStreak}d`,
                    icon: Flame,
                    color: "text-orange-400",
                  },
                  {
                    label: isAr ? "ترتيبك" : "Your Rank",
                    value: myRank > 0 ? `#${myRank}` : "—",
                    icon: Target,
                    color: "text-emerald-400",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07, type: "spring", stiffness: 300, damping: 22 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 p-3 flex items-center gap-2"
                  >
                    <stat.icon className={cn("w-4 h-4 flex-shrink-0", stat.color)} />
                    <div>
                      <p className="text-base font-black text-white leading-none">{stat.value}</p>
                      <p className="text-[10px] text-white/60 font-medium mt-0.5">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* ── Left Column: Podium + Main Leaderboard ───────────── */}
          <div className="xl:col-span-2 space-y-5">
            {/* Podium */}
            <FadeIn delay={0.05}>
              <div className="bg-card/40 backdrop-blur-2xl rounded-3xl border border-border/40 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" />
                    <h2 className="text-sm font-black text-foreground">
                      {isAr ? "منصة التتويج" : "Champions Podium"}
                    </h2>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted/40 px-2 py-1 rounded-full">
                    {isAr ? "الأسبوع الحالي" : "This Week"}
                  </span>
                </div>

                {loading ? (
                  <div className="h-48 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-amber-500/50 border-t-amber-500 rounded-full animate-spin" />
                  </div>
                ) : (
                  <Podium entries={sorted} onSelectUser={(uid) => setSelectedUserUid(uid)} />
                )}
              </div>
            </FadeIn>

            {/* Category Switcher */}
            <FadeIn delay={0.1}>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black border transition-all duration-200",
                      activeCategory === cat.id
                        ? `bg-gradient-to-r ${cat.color} text-white border-transparent shadow-lg`
                        : "bg-card/40 text-muted-foreground border-border/40 hover:text-foreground hover:border-border/60"
                    )}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    {isAr ? cat.labelAr : cat.label}
                  </button>
                ))}
              </div>
            </FadeIn>

            {/* My Rank Banner */}
            {myEntry && (
              <FadeIn delay={0.12}>
                <div
                  onClick={() => user?.uid && setSelectedUserUid(user.uid)}
                  className="bg-primary/10 border border-primary/30 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm cursor-pointer hover:bg-primary/15 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-black text-sm">
                    {user?.displayName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-primary">
                      {isAr ? "مكانتك الحالية" : "Your Current Standing"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Rank <span className="font-black text-foreground">#{myRank}</span> •{" "}
                      {myEntry.points.toLocaleString()} XP • {myEntry.streakDays} day streak
                    </p>
                  </div>
                  <div className="text-2xl">{getLeague(myEntry.points).emoji}</div>
                </div>
              </FadeIn>
            )}

            {/* Leaderboard List */}
            <FadeIn delay={0.15}>
              <div className="bg-card/40 backdrop-blur-2xl rounded-3xl border border-border/40 shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-black text-foreground">
                    {isAr ? "الترتيب الكامل" : "Full Rankings"}
                  </h2>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    Top {Math.min(sorted.length, 50)}
                  </span>
                </div>

                <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin">
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      Array.from({ length: 10 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-[60px] rounded-2xl bg-muted/30 animate-pulse"
                          style={{ animationDelay: `${i * 60}ms` }}
                        />
                      ))
                    ) : sorted.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">No rankings yet</p>
                      </div>
                    ) : (
                      sorted.map((entry, idx) => (
                        <LeaderRow
                          key={entry.uid}
                          entry={entry}
                          category={activeCategory}
                          currentUid={user?.uid}
                          delay={idx * 0.03}
                          onSelectUser={(uid) => setSelectedUserUid(uid)}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ── Right Column: Leagues + Online + Challenges ──────── */}
          <div className="space-y-5">
            {/* League Divisions */}
            <FadeIn delay={0.08}>
              <div className="bg-card/40 backdrop-blur-2xl rounded-3xl border border-border/40 shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-black text-foreground">
                    {isAr ? "الدوريات" : "League Divisions"}
                  </h2>
                </div>
                <div className="p-3 space-y-2">
                  {LEAGUES.map((league, i) => {
                    const count = entries.filter(
                      (e) => getLeague(e.points).name === league.name
                    ).length;
                    const userInLeague = myEntry && getLeague(myEntry.points).name === league.name;
                    return (
                      <motion.div
                        key={league.name}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: i * 0.08,
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                          league.bg,
                          league.border,
                          userInLeague ? "ring-1 ring-primary/40" : ""
                        )}
                      >
                        <span className="text-xl">{league.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-black", league.color)}>{league.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {league.min.toLocaleString()}+ XP
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs font-bold text-muted-foreground">{count}</span>
                        </div>
                        {userInLeague && (
                          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                            You
                          </span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>

            {/* Weekly Challenges */}
            <FadeIn delay={0.12}>
              <div className="bg-card/40 backdrop-blur-2xl rounded-3xl border border-border/40 shadow-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <h2 className="text-sm font-black text-foreground">
                    {isAr ? "تحديات الأسبوع" : "Weekly Challenges"}
                  </h2>
                </div>
                <div className="p-3 space-y-3">
                  {[
                    {
                      emoji: "📚",
                      title: "Upload 3 resources",
                      desc: "Share notes or slides",
                      xp: "+150 XP",
                      progress: 1,
                      total: 3,
                      color: "bg-emerald-500",
                    },
                    {
                      emoji: "🔥",
                      title: "5-day study streak",
                      desc: "Study every day this week",
                      xp: "+200 XP",
                      progress: 3,
                      total: 5,
                      color: "bg-orange-500",
                    },
                    {
                      emoji: "⚔️",
                      title: "Win 2 study battles",
                      desc: "Defeat opponents in 1v1",
                      xp: "+300 XP",
                      progress: 0,
                      total: 2,
                      color: "bg-blue-500",
                    },
                    {
                      emoji: "🧠",
                      title: "Complete a quiz",
                      desc: "Score 80%+ on any quiz",
                      xp: "+100 XP",
                      progress: 0,
                      total: 1,
                      color: "bg-purple-500",
                    },
                  ].map((challenge, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, type: "spring", stiffness: 300, damping: 25 }}
                      className="bg-background/50 rounded-2xl p-3 border border-border/30"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-base">{challenge.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-foreground">{challenge.title}</p>
                          <p className="text-[10px] text-muted-foreground">{challenge.desc}</p>
                        </div>
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex-shrink-0">
                          {challenge.xp}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted/40 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                            transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                            className={cn("h-full rounded-full", challenge.color)}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {challenge.progress}/{challenge.total}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Who's Online */}
            <FadeIn delay={0.16}>
              <WhoIsOnline />
            </FadeIn>

            {/* ── Season Ceremony Hall of Fame ─────────────────────── */}
            <FadeIn delay={0.2}>
              <div className="rounded-3xl bg-[#0f172a] border border-amber-500/30 shadow-2xl overflow-hidden text-white dark:bg-[#090d16]">
                {/* Ceremony Header */}
                <div className="p-5 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-500/20 rounded-2xl border border-amber-500/30">
                      <Crown className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white">
                        {isAr ? "🏆 حفل تكريم الموسم" : "🏆 Season Ceremony"}
                      </h2>
                      <p className="text-xs text-white/50 font-medium">
                        {isAr ? "أبطال هذا الفصل الدراسي" : "This semester's champions"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Champions */}
                <div className="p-4">
                  {ceremonyLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-7 h-7 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
                    </div>
                  ) : champions.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                      <Sparkles className="mx-auto text-amber-400 w-8 h-8 animate-bounce" />
                      <p className="text-sm font-bold text-white/70">
                        {isAr ? "سيتم إعلان المتفوقين قريباً" : "Champions will be announced soon"}
                      </p>
                    </div>
                  ) : (
                    <StaggerChildren className="space-y-2">
                      {champions.map((champ, i) => (
                        <ScaleIn key={champ.uid}>
                          <button
                            type="button"
                            onClick={() => setSelectedUserUid(champ.uid)}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 transition-all text-left"
                          >
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shrink-0",
                                i === 0
                                  ? "bg-amber-500 text-black"
                                  : i === 1
                                    ? "bg-slate-400 text-black"
                                    : i === 2
                                      ? "bg-amber-700 text-white"
                                      : "bg-white/10 text-white/70"
                              )}
                            >
                              #{champ.rank}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-white truncate">{champ.name}</p>
                              <p className="text-[10px] text-white/50 font-medium">{champ.dept}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-black text-amber-400">
                                {champ.xp.toLocaleString()} XP
                              </p>
                              <p className="text-[9px] text-white/40 font-medium">{champ.badge}</p>
                            </div>
                          </button>
                        </ScaleIn>
                      ))}
                    </StaggerChildren>
                  )}

                  {/* XP Rules */}
                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-2">
                    {[
                      {
                        emoji: "🎯",
                        label: isAr ? "+50 XP" : "+50 XP",
                        desc: isAr ? "اختبارات" : "Quizzes",
                      },
                      {
                        emoji: "🔥",
                        label: isAr ? "+30 XP" : "+30 XP",
                        desc: isAr ? "سلسلة يومية" : "Daily streak",
                      },
                      {
                        emoji: "📖",
                        label: isAr ? "+20 XP" : "+20 XP",
                        desc: isAr ? "ملفات" : "Resources",
                      },
                    ].map((r) => (
                      <div
                        key={r.desc}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-center"
                      >
                        <p className="text-base">{r.emoji}</p>
                        <p className="text-xs font-black text-amber-400">{r.label}</p>
                        <p className="text-[9px] text-white/50">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal uid={selectedUserUid} onClose={() => setSelectedUserUid(null)} />
    </div>
  );
}
