"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types";
import { Trophy, Medal, Star, ArrowLeft, Crown } from "lucide-react";
import Link from "next/link";
import { useAuth, useLanguage } from "@/contexts";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui/Animations";
import { LoadingTable } from "@/components/ui/Loading";

const LEAGUES = [
  {
    key: "Diamond",
    minPoints: 1000,
    color: "text-blue-500 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    key: "Gold",
    minPoints: 500,
    color: "text-yellow-500 dark:text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  {
    key: "Silver",
    minPoints: 100,
    color: "text-slate-400 dark:text-slate-300",
    bg: "bg-slate-500/10 border-slate-500/20",
  },
  {
    key: "Bronze",
    minPoints: 0,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-600/10 border-amber-600/20",
  },
];

function getLeague(points: number) {
  return LEAGUES.find((league) => (points || 0) >= league.minPoints) || LEAGUES[3];
}

export default function LeaderboardClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { language, t } = useLanguage();

  const isRtl = language === "ar";

  useEffect(() => {
    if (!db) return () => {};

    const q = query(collection(db, "users"), orderBy("points", "desc"), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs
        .map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }))
        .filter((u: Partial<User>) => (u.points || 0) > 0) as User[];
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Visual Podium placement: 2nd on left, 1st in center, 3rd on right
  const getPodiumList = () => {
    const list = [];
    if (users.length > 1) list.push({ user: users[1], rank: 2 });
    if (users.length > 0) list.push({ user: users[0], rank: 1 });
    if (users.length > 2) list.push({ user: users[2], rank: 3 });
    return list;
  };

  const podiumUsers = getPodiumList();

  return (
    <div
      className="max-w-5xl mx-auto px-4 py-8 w-full page-transition min-h-screen"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/community"
          className="p-3 bg-card/30 backdrop-blur-xl hover:bg-card/50 rounded-xl transition-all border border-border/50 shadow-sm active:scale-95 animate-fade-in"
        >
          <ArrowLeft className={`w-5 h-5 text-foreground ${isRtl ? "rotate-180" : ""}`} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3 tracking-tight">
            <Trophy className="w-8 h-8 text-yellow-500 animate-bounce" />
            {t("leaderboard.title")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base font-medium">
            {t("leaderboard.subtitle")}
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingTable rows={8} />
      ) : (
        <div className="space-y-8">
          {/* Stunning Podium Section */}
          {podiumUsers.length > 0 && (
            <FadeIn className="grid grid-cols-3 gap-3 md:gap-6 items-end max-w-2xl mx-auto pt-8 pb-4">
              {podiumUsers.map(({ user, rank }) => {
                const isFirst = rank === 1;
                const isSecond = rank === 2;
                const isThird = rank === 3;
                const league = getLeague(user.points || 0);

                return (
                  <motion.div
                    key={user.uid}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: rank === 1 ? 0.1 : rank === 2 ? 0.2 : 0.3 }}
                    className={`flex flex-col items-center relative ${isFirst ? "z-10" : "z-0"}`}
                  >
                    {/* Crown / Top Badge */}
                    <div className="absolute -top-7 flex justify-center w-full">
                      {isFirst && (
                        <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500/20 drop-shadow-md animate-pulse" />
                      )}
                      {isSecond && <Medal className="w-6 h-6 text-slate-300 drop-shadow-sm" />}
                      {isThird && (
                        <Star className="w-6 h-6 text-amber-600 fill-amber-600/20 drop-shadow-sm" />
                      )}
                    </div>

                    {/* Avatar Sphere */}
                    <div
                      className={`w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center text-xl md:text-3xl font-extrabold uppercase shadow-lg border-2 relative ${
                        isFirst
                          ? "bg-gradient-to-tr from-yellow-500/20 to-yellow-300/10 border-yellow-500 scale-110 shadow-yellow-500/10"
                          : isSecond
                            ? "bg-gradient-to-tr from-slate-400/20 to-slate-200/10 border-slate-400"
                            : "bg-gradient-to-tr from-amber-600/20 to-amber-400/10 border-amber-600"
                      }`}
                    >
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || "?"}
                      {/* Floating Rank Indicator */}
                      <span
                        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${
                          isFirst ? "bg-yellow-500" : isSecond ? "bg-slate-400" : "bg-amber-600"
                        }`}
                      >
                        {rank}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="text-center mt-4 w-full min-w-0 px-2">
                      <h3
                        className="font-bold text-xs md:text-sm text-foreground truncate w-full"
                        title={user.displayName || "Anonymous Student"}
                      >
                        {user.displayName || "Anonymous Student"}
                      </h3>
                      <p className="text-[10px] md:text-xs text-muted-foreground truncate w-full">
                        {user.email?.split("@")[0] || "Student"}
                      </p>

                      {/* Points badge */}
                      <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card/60 border border-border/50 text-[10px] md:text-xs font-bold text-primary shadow-sm">
                        <span>{user.points || 0}</span>
                        <span className="text-[9px] font-normal text-muted-foreground">
                          {t("leaderboard.pts")}
                        </span>
                      </div>

                      {/* League badge */}
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold border ${league.bg} ${league.color}`}
                        >
                          {t("leaderboard.league." + league.key)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </FadeIn>
          )}

          {/* Leaderboard Table / Rest of Ranks */}
          <div className="bg-card/30 backdrop-blur-xl rounded-3xl border border-border/50 overflow-hidden shadow-xl">
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse" dir={isRtl ? "rtl" : "ltr"}>
                <thead>
                  <tr className="bg-muted/30 border-b border-border/50">
                    <th
                      className={`py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground w-20 text-center ${isRtl ? "text-right animate-fade-in" : "text-left"}`}
                    >
                      {t("leaderboard.rank")}
                    </th>
                    <th
                      className={`py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground ${isRtl ? "text-right" : "text-left"}`}
                    >
                      {t("leaderboard.student")}
                    </th>
                    <th
                      className={`py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground ${isRtl ? "text-right" : "text-left"}`}
                    >
                      {t("leaderboard.league")}
                    </th>
                    <th
                      className={`py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground text-right ${isRtl ? "text-left" : "text-right"}`}
                    >
                      {t("leaderboard.points")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {users.map((user, index) => {
                    const league = getLeague(user.points || 0);
                    const isCurrentUser = currentUser?.uid === user.uid;
                    const rank = index + 1;

                    return (
                      <tr
                        key={user.uid}
                        className={`transition-colors hover:bg-muted/20 ${
                          isCurrentUser ? "bg-primary/10 hover:bg-primary/15" : ""
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-6 text-center">
                          {rank === 1 ? (
                            <div className="w-7 h-7 mx-auto bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center font-black text-sm border border-yellow-500/30">
                              1
                            </div>
                          ) : rank === 2 ? (
                            <div className="w-7 h-7 mx-auto bg-slate-400/20 text-slate-400 rounded-full flex items-center justify-center font-black text-sm border border-slate-400/30">
                              2
                            </div>
                          ) : rank === 3 ? (
                            <div className="w-7 h-7 mx-auto bg-amber-600/20 text-amber-500 rounded-full flex items-center justify-center font-black text-sm border border-amber-600/30">
                              3
                            </div>
                          ) : (
                            <span className="text-muted-foreground font-semibold text-sm">
                              {rank}
                            </span>
                          )}
                        </td>

                        {/* Student Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold uppercase shrink-0 text-sm">
                              {user.displayName?.charAt(0) || user.email?.charAt(0) || "?"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                                <span
                                  className="truncate max-w-[180px] sm:max-w-xs md:max-w-md"
                                  title={user.displayName || "Anonymous Student"}
                                >
                                  {user.displayName || "Anonymous Student"}
                                </span>
                                {isCurrentUser && (
                                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold animate-pulse shrink-0">
                                    {t("leaderboard.you")}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-[180px] sm:max-w-xs">
                                {user.email?.split("@")[0] || "Student"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* League */}
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${league.bg} ${league.color}`}
                          >
                            {league.key === "Diamond" ? (
                              <Star className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Medal className="w-3.5 h-3.5" />
                            )}
                            {t("leaderboard.league." + league.key)}
                          </span>
                        </td>

                        {/* Points */}
                        <td className="py-4 px-6 text-right">
                          <div className="font-extrabold text-sm text-foreground flex justify-end items-center gap-1">
                            <span>{user.points || 0}</span>
                            <span className="text-muted-foreground text-xs font-medium">
                              {t("leaderboard.pts")}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-12 text-muted-foreground font-medium text-sm">
                  {t("leaderboard.empty")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
