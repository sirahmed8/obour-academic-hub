"use client";

import * as React from "react";
import Link from "next/link";
import { Subject } from "@/types";
import { useLanguage } from "@/contexts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { CARD_BASE, CARD_HOVER } from "@/lib/ui-variants";
import { BookOpen, User, ArrowUpRight } from "lucide-react";
import { getSubjectAnimation } from "@/lib/subjectIcons";

interface SubjectCardProps {
  subject: Subject;
  resourceCount?: number;
}

export const SubjectCard = React.memo(function SubjectCard({
  subject,
  resourceCount = 0,
}: SubjectCardProps) {
  const { language } = useLanguage();
  const [isHovered, setIsHovered] = React.useState(false);

  // Dynamic animation determination using shared library
  const animationToUse = getSubjectAnimation(subject.icon);

  // Color classes - ensure fallback and correct format
  const rawColor = subject.color || "bg-blue-500";
  const bgColorClass =
    rawColor.startsWith("bg-") || rawColor.startsWith("text-") ? rawColor : `bg-${rawColor}`;

  const textColorClass = bgColorClass.includes("500")
    ? bgColorClass.replace("bg-", "text-").replace("500", "600")
    : "text-blue-600 dark:text-blue-400";

  const profName = language === "ar" && subject.profNameAr ? subject.profNameAr : subject.profName;
  const subjectName = language === "ar" && subject.nameAr ? subject.nameAr : subject.name;

  return (
    <Link href={`/subject?id=${subject.id}`} className="block h-full" prefetch={true}>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={cn(
          CARD_BASE,
          CARD_HOVER,
          "group relative overflow-hidden flex flex-col justify-between h-full p-6 focus-visible:ring-2 focus-visible:ring-primary border border-border/80 dark:border-white/10 backdrop-blur-xl"
        )}
      >
        {/* Subtle Ambient Background Glow on Hover */}
        <div
          className={cn(
            "absolute -top-16 -right-16 w-32 h-32 rounded-full blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-30 pointer-events-none",
            bgColorClass
          )}
        />

        {/* Top Header Row */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div
              className={cn(
                "relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110",
                bgColorClass
              )}
            >
              <div className="relative z-10 text-white">
                <AnimatedIcon
                  icon={animationToUse}
                  iconName={subject.icon}
                  size={32}
                  active={isHovered}
                  useAnimation={true}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-muted text-muted-foreground border border-border/50">
                {subject.code ||
                  (language === "ar"
                    ? `مستوى ${subject.level || subject.year || 1}`
                    : `L${subject.level || subject.year || 1}`)}
              </span>
              <div className="p-2 rounded-xl bg-card border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight
                  size={16}
                  className="text-muted-foreground group-hover:text-primary"
                />
              </div>
            </div>
          </div>

          {/* Subject Title & Professor */}
          <div className="space-y-1.5">
            <h3 className="font-black text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {subjectName}
            </h3>

            {profName && (
              <p className="text-xs sm:text-sm text-muted-foreground font-semibold flex items-center gap-1.5">
                <User size={14} className="text-primary/70 shrink-0" />
                <span className="truncate">
                  {language === "ar" ? "د." : "Dr."} {profName}
                </span>
              </p>
            )}

            {subject.description && (
              <p className="text-xs text-muted-foreground/80 font-medium line-clamp-2 mt-2 leading-relaxed">
                {subject.description}
              </p>
            )}
          </div>
        </div>

        {/* Footer Badge Row */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <BookOpen size={14} className="text-primary" />
            <span>{language === "ar" ? "المحتوى الأكاديمي" : "Academic Content"}</span>
          </div>

          <div className="relative px-3 py-1 rounded-full overflow-hidden border border-border/30">
            <div className={cn("absolute inset-0 opacity-15", bgColorClass)} />
            <span className={cn("relative z-10 text-xs font-extrabold", textColorClass)}>
              {resourceCount} {language === "ar" ? "مصدر" : "Resources"}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});
