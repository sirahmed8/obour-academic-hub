"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts";
import { WhoIsOnline } from "@/components/features/WhoIsOnline";
import { FadeIn } from "@/components/ui/Animations";
import { GlobalChat } from "@/components/chat/GlobalChat";
import { Users, Trophy, Crown, Medal, Sparkles, MessageCircle, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── Leaderboard Sidebar ──
function LeaderboardSidebar() {
  const { language } = useLanguage();
  const [topStudents, setTopStudents] = useState<{ name: string; points: number; rank: number }[]>(
    []
  );

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "users"), orderBy("points", "desc"), limit(20));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const students = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            const name = data.displayName || data.email || "Unknown";
            const points = data.points || 0;
            return { name, points };
          })
          .filter((s) => s.points > 0);
        const ranked = students.slice(0, 15).map((s, idx) => ({ ...s, rank: idx + 1 }));
        setTopStudents(ranked);
      },
      (error) => {
        console.error("LeaderboardSidebar snapshot error:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const rankIcons = [
    <Crown key="1" className="w-4 h-4 text-amber-400" />,
    <Medal key="2" className="w-4 h-4 text-gray-400" />,
    <Medal key="3" className="w-4 h-4 text-amber-700" />,
  ];

  return (
    <div className="bg-card/40 backdrop-blur-2xl rounded-3xl border border-primary/20 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40 bg-card/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Trophy size={20} className="text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">
              {language === "ar" ? "لوحة الشرف للأسبوع" : "Weekly Leaderboard"}
            </h3>
            <p className="text-[10px] text-muted-foreground font-semibold">
              {language === "ar" ? "أعلى الطلاب تفاعلاً ونقاطاً" : "Top active scholars"}
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest">
          TOP 15
        </span>
      </div>

      {/* Students List */}
      <div className="p-3 space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar">
        {topStudents.map((student, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            className={`flex items-center gap-3 p-2.5 rounded-2xl transition-all ${
              idx === 0
                ? "bg-amber-500/10 border border-amber-500/30 shadow-sm"
                : "hover:bg-muted/40 border border-transparent"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                idx === 0
                  ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                  : idx === 1
                    ? "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    : idx === 2
                      ? "bg-amber-700/20 text-amber-700 border border-amber-700/30"
                      : "bg-muted/60 text-muted-foreground"
              }`}
            >
              {idx < 3 ? rankIcons[idx] : student.rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                {student.name}
              </p>
            </div>
            <span className="text-xs font-black text-primary tabular-nums bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
              {student.points.toLocaleString()} {language === "ar" ? "ن" : "pts"}
            </span>
          </motion.div>
        ))}
      </div>

      {/* View Full Leaderboard Link */}
      <div className="p-3 pt-2">
        <Link
          href="/community/leaderboard"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-2xl border border-primary/20 transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
        >
          <span>{language === "ar" ? "عرض الترتيب الشامل" : "View Full Leaderboard"}</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Quick Tip */}
      <div className="p-3 border-t border-border/30">
        <div className="bg-primary/5 rounded-2xl p-3 border border-primary/10">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={14} className="text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
              {language === "ar" ? "كيف تجمع النقاط؟" : "How to Earn Points"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
            {language === "ar"
              ? "شارِك بالرسائل والملاحظات وحِل المهام اليومية لرفع ترتيبك الأكاديمي!"
              : "Post notes, chat with peers, and complete tasks to climb the rank!"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Community Page ──
export default function CommunityPage() {
  const { language, t } = useLanguage();

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 w-full page-transition min-h-screen max-w-7xl mx-auto">
      {/* Header Banner */}
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-card/60 border border-primary/20 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Users size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                  {t("nav.community")}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 animate-pulse">
                  {language === "ar" ? "مباشر 🟢" : "Live 🟢"}
                </span>
              </div>
              <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-1">
                {language === "ar"
                  ? "تواصل مع زملائك الطلاب، وشارك الاستفسارات، وتنافس في لوحة الشرف"
                  : "Connect with classmates, share study queries, and climb the leaderboard"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/community/chat"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              <MessageCircle size={16} />
              <span>{language === "ar" ? "شاشة الدردشة الكاملة" : "Full Chat Mode"}</span>
            </Link>

            <Link
              href="/community/leaderboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-foreground text-xs font-bold border border-white/40 dark:border-white/10 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            >
              <Trophy size={16} className="text-amber-500" />
              <span>{language === "ar" ? "جدول الترتيب" : "Leaderboard"}</span>
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* Main Layout: Chat + Sidebar */}
      <div
        className={`flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-14rem)] ${
          language === "ar" ? "lg:flex-row-reverse" : ""
        }`}
      >
        {/* Main: Global Chat */}
        <div className="flex-1 h-[520px] lg:h-auto lg:min-h-0">
          <GlobalChat isEmbedded={true} />
        </div>

        {/* Sidebar: Leaderboard + Who's Online */}
        <div
          className={`w-full lg:w-80 xl:w-96 space-y-6 shrink-0 lg:overflow-y-auto lg:max-h-full ${
            language === "ar" ? "order-first lg:order-none" : ""
          }`}
        >
          <WhoIsOnline />
          <LeaderboardSidebar />
        </div>
      </div>
    </div>
  );
}
