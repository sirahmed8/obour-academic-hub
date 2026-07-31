"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts";
import { Trophy, Crown, Sparkles } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface HallOfFameUser {
  rank: number;
  name: string;
  dept: string;
  xp: number;
  badge: string;
}

export default function SeasonCeremonyPage() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const [champions, setChampions] = useState<HallOfFameUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChampions() {
      if (!db) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, "users"), orderBy("points", "desc"), limit(3));
        const snap = await getDocs(q);
        const list: HallOfFameUser[] = [];
        let r = 1;
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const badges = [
            isRtl ? "كأس التخرج الذهبي 🏆" : "Golden Graduation Trophy 🏆",
            isRtl ? "بطل التركيز 🥇" : "Focus Master 🥇",
            isRtl ? "رائد المجتمع الأكاديمي 🥈" : "Community Pioneer 🥈",
          ];
          list.push({
            rank: r,
            name: data.displayName || data.name || (isRtl ? "طالب مميز" : "Top Scholar"),
            dept: data.department || (isRtl ? "علوم الحاسب" : "Computer Science"),
            xp: data.points || data.xp || 0,
            badge: badges[r - 1] || (isRtl ? "وسام التميز" : "Excellence Badge"),
          });
          r++;
        });
        setChampions(list);
      } catch (err) {
        console.error("Error loading ceremony champions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadChampions();
  }, [isRtl]);

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-7xl mx-auto">
      {/* Hero Banner */}
      <FadeIn>
        <div className="relative rounded-3xl sm:rounded-4xl overflow-hidden bg-[#0f172a] border border-amber-500/30 p-8 sm:p-12 shadow-2xl text-center space-y-4 text-white dark:bg-[#090d16]">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-xs uppercase tracking-widest border border-amber-500/30">
            <Sparkles size={14} className="animate-spin" />
            <span>{isRtl ? "حفل ختام الفصل الدراسي" : "End-of-Semester Ceremony"}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-harman">
            {isRtl ? "🏆 حفل تكريم المتفوقين في معهد العبور" : "🏆 Obour Academic Season Ceremony"}
          </h1>

          <p className="text-white/70 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            {isRtl
              ? "نحتفل بجميع الطلاب المتفوقين وأبطال السلسلة الدراسية الذين حققوا أعلى الإنجازات الأكاديمية والخدمية للمجتمع."
              : "Celebrating top student performers, streak champions, and academic contributors of the semester."}
          </p>
        </div>
      </FadeIn>

      {/* Top Champions Hall of Fame */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-foreground flex items-center gap-2 font-harman">
          <Crown className="text-yellow-500" />
          <span>{isRtl ? "لوحة شرف الفصل الدراسي (Hall of Fame)" : "Semester Hall of Fame"}</span>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : champions.length === 0 ? (
          <div className="p-10 rounded-3xl bg-card border border-border text-center space-y-3 shadow-md">
            <Sparkles className="mx-auto text-primary w-10 h-10 animate-bounce" />
            <h3 className="text-lg font-bold text-foreground">
              {isRtl ? "سيتم إعلان المتفوقين قريباً" : "Champions Will Be Announced Soon"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isRtl
                ? "ستظهر أسماء الطلاب المتفوقين فور اكتمال تقييمات نقاط النشاط بنهاية الفصل الدراسي."
                : "Top student scores and seasonal awards will be updated live at the end of the term."}
            </p>
          </div>
        ) : (
          <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {champions.map((champ) => (
              <ScaleIn key={champ.rank}>
                <div className="p-6 rounded-[2rem] bg-card border border-border shadow-md hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center space-y-4 relative overflow-hidden group">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-black font-black text-2xl shadow-lg ring-4 ring-yellow-500/20">
                    #{champ.rank}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-xl text-foreground">{champ.name}</h3>
                    <p className="text-xs text-muted-foreground font-bold">{champ.dept}</p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-extrabold text-xs border border-amber-500/20">
                    <Trophy size={14} />
                    <span>{champ.badge}</span>
                  </div>

                  <div className="text-sm font-black text-primary">
                    {champ.xp.toLocaleString()} XP
                  </div>
                </div>
              </ScaleIn>
            ))}
          </StaggerChildren>
        )}

        {/* Ceremony How It Works & XP Rules */}
        <FadeIn>
          <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-lg space-y-4 mt-8">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2 font-harman">
              <Sparkles className="text-primary" size={20} />
              <span>
                {isRtl ? "كيف يتم احتساب النقاط وتكريم الموسم؟" : "How Season XP & Trophies Work"}
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="font-extrabold text-primary">
                  1. {isRtl ? "النشاط والأجوبة" : "Activity & Answers"}
                </span>
                <p className="text-muted-foreground font-medium">
                  {isRtl
                    ? "احصل على +50 XP عند حل الاختبارات التفاعلية أو الإجابة في المنتدى."
                    : "Earn +50 XP by passing AI practice quizzes and posting verified answers."}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="font-extrabold text-primary">
                  2. {isRtl ? "السلسلة ومجموعات المذاكرة" : "Streaks & Hagaz Sessions"}
                </span>
                <p className="text-muted-foreground font-medium">
                  {isRtl
                    ? "حافظ على السلسلة اليومية وحضور جلسات المذاكرة لتحصيل المكافآت."
                    : "Maintain daily study streaks and attend Hagaz slots to earn bonus trophies."}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                <span className="font-extrabold text-primary">
                  3. {isRtl ? "التكريم الختامي" : "Final Ceremony"}
                </span>
                <p className="text-muted-foreground font-medium">
                  {isRtl
                    ? "يتم تتويج الـ Top 3 في حفل ختام الموسم مع أوسمة معتمدة."
                    : "Top 3 students on the leaderboard are crowned at semester conclusion."}
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
