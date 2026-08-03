"use client";

import * as React from "react";
import Link from "next/link";
import { Subject } from "@/types";
import { useLanguage, useAuth } from "@/contexts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { BookOpen, User, ArrowUpRight, CheckCircle2 } from "lucide-react";

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
  const { user } = useAuth();
  const [isHovered, setIsHovered] = React.useState(false);

  // Dynamic animation determination using shared library
  const animationToUse = getSubjectAnimation(subject.icon);

  // Color classes - ensure fallback and correct format
  const rawColor = subject.color || "bg-indigo-500";
  const bgColorClass =
    rawColor.startsWith("bg-") || rawColor.startsWith("text-") ? rawColor : `bg-${rawColor}`;

  const textColorClass = bgColorClass.includes("500")
    ? bgColorClass.replace("bg-", "text-").replace("500", "600")
    : "text-indigo-600 dark:text-indigo-400";

  const profName = language === "ar" && subject.profNameAr ? subject.profNameAr : subject.profName;
  const subjectName = language === "ar" && subject.nameAr ? subject.nameAr : subject.name;

  return (
    <Link href={`/subject?id=${subject.id}`} className="block h-full" prefetch={true}>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -6, transition: { type: "spring", stiffness: 350, damping: 22 } }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative overflow-hidden flex flex-col justify-between h-full p-6 sm:p-7 rounded-[2rem] focus-visible:ring-2 focus-visible:ring-primary border border-border bg-card shadow-md hover:shadow-2xl hover-lift active:scale-97 transition-all duration-300 dark:bg-card"
        )}
      >
        {/* Subtle Ambient Background Glow on Hover */}
        <div
          className={cn(
            "absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl transition-all duration-500 opacity-0 group-hover:opacity-30 pointer-events-none",
            bgColorClass
          )}
        />

        {/* Top Header Row */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div
              className={cn(
                "relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110 ring-2 ring-white/10",
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
              {(() => {
                const sObj = subject as unknown as { code?: string; level?: number; year?: number };
                return (
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {sObj.code ||
                      (language === "ar"
                        ? `الفرقة ${sObj.level || sObj.year || 1}`
                        : `Year ${sObj.level || sObj.year || 1}`)}
                  </span>
                );
              })()}
              <div className="p-2 rounded-xl bg-background/60 border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight
                  size={16}
                  className="text-muted-foreground group-hover:text-primary transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Subject Title & Professor */}
          <div className="space-y-2">
            <h3 className="font-black text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {subjectName}
            </h3>

            {profName && (
              <p className="text-xs sm:text-sm text-muted-foreground font-bold flex items-center gap-1.5">
                <User size={14} className="text-primary shrink-0" />
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

        {/* Footer Badge & Resource Progress */}
        <div className="mt-6 pt-4 border-t border-border/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <BookOpen size={14} className="text-primary" />
              <span>{language === "ar" ? "المحتوى الدراسي" : "Course Content"}</span>
            </div>

            <div className="relative px-3 py-1 rounded-full overflow-hidden border border-border/30 bg-muted/30">
              <span className={cn("relative z-10 text-xs font-extrabold", textColorClass)}>
                {resourceCount} {language === "ar" ? "مصدر" : "Resources"}
              </span>
            </div>
          </div>

          {/* Quick Enrolled Indicator */}
          {user && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-500 dark:text-emerald-400">
              <CheckCircle2 size={13} />
              <span>{language === "ar" ? "مسجل في خطتك الفتية" : "Enrolled in Pathway"}</span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
});
