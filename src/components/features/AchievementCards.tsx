"use client";

import { useLanguage } from "@/contexts";
import { Award, Crown } from "lucide-react";
import { ScaleIn, StaggerChildren } from "@/components/ui/Animations";

interface CardBadge {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  rarity: "Legendary" | "Epic" | "Rare";
  unlocked: boolean;
}

const BADGES: CardBadge[] = [
  {
    id: "1",
    titleAr: "بطل الاستمرار 10D",
    titleEn: "Streak Master 10D",
    descAr: "حقق تتابع دراسي لمدة 10 أيام متتالية دون انقطاع.",
    descEn: "Maintained a consecutive 10-day study streak.",
    rarity: "Legendary",
    unlocked: true,
  },
  {
    id: "2",
    titleAr: "مبتكر المصادر الأكاديمية",
    titleEn: "Resource Pioneer",
    descAr: "قام برفع وتوثيق أكثر من 5 ملخصات دراسية معتمدة.",
    descEn: "Uploaded over 5 verified academic notes.",
    rarity: "Epic",
    unlocked: true,
  },
  {
    id: "3",
    titleAr: "عاشق السهر والتفوق",
    titleEn: "Night Owl Scholar",
    descAr: "أنجز جلسات دراسية ليلية كاملة.",
    descEn: "Completed midnight study focus sessions.",
    rarity: "Rare",
    unlocked: false,
  },
];

export function AchievementCards() {
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Crown className="text-yellow-500" size={24} />
        <h2 className="text-2xl font-black text-foreground font-harman">
          {isRtl
            ? "بطاقات الإنجازات الأكاديمية (Achievement Cards)"
            : "Collectible Achievement Cards"}
        </h2>
      </div>

      <StaggerChildren className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {BADGES.map((badge) => (
          <ScaleIn key={badge.id}>
            <div
              className={`p-6 rounded-[2.5rem] border backdrop-blur-2xl shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden transition-transform hover:scale-105 duration-300 ${
                badge.unlocked
                  ? "bg-gradient-to-tr from-amber-500/20 via-primary/20 to-purple-600/20 border-amber-500/30"
                  : "bg-card/40 border-border/50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  <Award size={24} />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-black text-[10px] uppercase">
                  {badge.rarity}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-foreground">
                  {isRtl ? badge.titleAr : badge.titleEn}
                </h3>
                <p className="text-xs font-medium text-muted-foreground mt-1 leading-relaxed">
                  {isRtl ? badge.descAr : badge.descEn}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 text-[11px] font-black text-amber-500">
                {badge.unlocked
                  ? isRtl
                    ? "بطاقة مُكتسبة ✅"
                    : "Unlocked Badge ✅"
                  : isRtl
                    ? "مغلقة 🔒"
                    : "Locked 🔒"}
              </div>
            </div>
          </ScaleIn>
        ))}
      </StaggerChildren>
    </div>
  );
}
