"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts";
import { WhoIsOnline } from "@/components/features/WhoIsOnline";
import { FadeIn } from "@/components/ui/Animations";
import { GlobalChat } from "@/components/chat/GlobalChat";
import { Users, Trophy, Crown, Medal, Sparkles } from "lucide-react";
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
    <div className="bg-card/30 backdrop-blur-xl rounded-3xl border border-border/50 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/30 bg-card/50">
        <div className="p-2 bg-amber-500/10 rounded-xl">
          <Trophy size={18} className="text-amber-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">
            {language === "ar" ? "لوحة الشرف" : "Leaderboard"}
          </h3>
          <p className="text-[10px] text-muted-foreground font-medium">
            {language === "ar" ? "أفضل الطلاب هذا الأسبوع" : "Top students this week"}
          </p>
        </div>
      </div>

      {/* Students List */}
      <div className="p-3 space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
        {topStudents.map((student, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
              idx === 0 ? "bg-amber-500/10 border border-amber-500/20" : "hover:bg-muted/30"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                idx === 0
                  ? "bg-amber-500/20 text-amber-500"
                  : idx === 1
                    ? "bg-gray-500/20 text-gray-400"
                    : idx === 2
                      ? "bg-amber-700/20 text-amber-700"
                      : "bg-muted/50 text-muted-foreground"
              }`}
            >
              {idx < 3 ? rankIcons[idx] : student.rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{student.name}</p>
            </div>
            <span className="text-xs font-black text-primary tabular-nums">
              {student.points.toLocaleString()}
            </span>
          </motion.div>
        ))}
      </div>

      {/* View Full Leaderboard Link */}
      <div className="px-3 pb-3">
        <Link
          href="/community/leaderboard"
          className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl border border-primary/20 transition-all active:scale-95"
        >
          <span>{language === "ar" ? "عرض لوحة الصدارة كاملة" : "View Full Leaderboard"}</span>
        </Link>
      </div>

      {/* Quick Tip */}
      <div className="p-3 border-t border-border/30">
        <div className="bg-primary/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={12} className="text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary/80">
              {language === "ar" ? "نصيحة" : "Tip"}
            </span>
          </div>
          <p className="text-[11px] text-foreground/60 font-medium leading-relaxed">
            {language === "ar"
              ? "📱 أضف الموقع للشاشة الرئيسية للوصول السريع!"
              : "📱 Add to home screen for instant access!"}
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
    <div className="p-4 lg:p-8 w-full page-transition min-h-screen">
      {/* Header */}
      <FadeIn>
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl">
              <Users className="text-primary" size={28} />
            </div>
            {t("nav.community")}
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-2 max-w-2xl">
            {language === "ar"
              ? "تواصل مع زملائك وتابع لوحة الشرف"
              : "Connect with classmates and track the leaderboard"}
          </p>
        </div>
      </FadeIn>

      {/* Main Layout: Chat + Sidebar */}
      <div
        className={`flex flex-col lg:flex-row gap-4 lg:gap-6 lg:h-[calc(100vh-12rem)] ${
          language === "ar" ? "lg:flex-row-reverse" : ""
        }`}
      >
        {/* Main: Global Chat */}
        <div className="flex-1 h-[500px] lg:h-auto lg:min-h-0">
          <GlobalChat isEmbedded={true} />
        </div>

        {/* Sidebar: Leaderboard + Who's Online */}
        <div
          className={`w-full lg:w-80 xl:w-96 space-y-4 shrink-0 lg:overflow-y-auto lg:max-h-full ${
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
