"use client";

import { useLanguage } from "@/contexts";
import { Trophy, Crown, Sparkles } from "lucide-react";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";

const HALL_OF_FAME = [
  {
    rank: 1,
    name: "أحمد العبدالله",
    dept: "Computer Science",
    xp: 14250,
    badge: "Golden Graduation Trophy",
  },
  { rank: 2, name: "مريم حسن", dept: "Information Systems", xp: 12800, badge: "Focus Master" },
  {
    rank: 3,
    name: "عمر الفاروق",
    dept: "Artificial Intelligence",
    xp: 11400,
    badge: "Community Pioneer",
  },
];

export default function SeasonCeremonyPage() {
  const { language } = useLanguage();

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 w-full page-transition min-h-screen max-w-7xl mx-auto">
      {/* Hero Banner */}
      <FadeIn>
        <div className="relative rounded-3xl sm:rounded-4xl overflow-hidden bg-gradient-to-tr from-amber-500/20 via-primary/20 to-purple-600/20 border border-amber-500/30 p-8 sm:p-12 shadow-2xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 font-extrabold text-xs uppercase tracking-widest border border-amber-500/30">
            <Sparkles size={14} className="animate-spin" />
            <span>{language === "ar" ? "حفل ختام الفصل الدراسي" : "End-of-Semester Ceremony"}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight font-harman">
            {language === "ar"
              ? "🏆 حفل تكريم المتفوقين في معهد العبور"
              : "🏆 Obour Academic Season Ceremony"}
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            {language === "ar"
              ? "نحتفل بجميع الطلاب المتفوقين وأبطال السلسلة الدراسية الذين حققوا أعلى الإنجازات الأكاديمية والخدمية للمجتمع."
              : "Celebrating top student performers, streak champions, and academic contributors of the semester."}
          </p>
        </div>
      </FadeIn>

      {/* Top Champions Hall of Fame */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-foreground flex items-center gap-2 font-harman">
          <Crown className="text-yellow-500" />
          <span>
            {language === "ar" ? "لوحة شرف الفصل الدراسي (Hall of Fame)" : "Semester Hall of Fame"}
          </span>
        </h2>

        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HALL_OF_FAME.map((champ) => (
            <ScaleIn key={champ.rank}>
              <div className="p-6 rounded-[2rem] bg-card/60 border border-primary/20 backdrop-blur-xl shadow-xl flex flex-col items-center text-center space-y-4 relative overflow-hidden group hover:scale-[1.02] transition-transform">
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
      </div>
    </div>
  );
}
