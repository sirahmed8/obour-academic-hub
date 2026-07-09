"use client";

import * as React from "react";
import Link from "next/link";
import { Subject } from "@/types";
import { useLanguage } from "@/contexts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { CARD_BASE, CARD_HOVER } from "@/lib/ui-variants";

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
  // If color doesn't start with bg- or text-, assume it is a color name like 'orange-500' and prepend bg-
  const bgColorClass =
    rawColor.startsWith("bg-") || rawColor.startsWith("text-") ? rawColor : `bg-${rawColor}`;

  // Safe derivation of text color
  const textColorClass = bgColorClass.includes("500")
    ? bgColorClass.replace("bg-", "text-").replace("500", "600")
    : "text-blue-600";

  return (
    <Link href={`/subject?id=${subject.id}`} className="block" prefetch={true}>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={cn(
          CARD_BASE,
          CARD_HOVER,
          "group relative overflow-hidden focus-visible:ring-2 focus-visible:ring-primary"
        )}
      >
        {/* Accent bar */}
        <div
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-l-full transition-all duration-300 group-hover:h-20",
            bgColorClass
          )}
        />

        <div className="flex items-start gap-4">
          {/* Icon - Fixed to use the full subject color */}
          <div
            className={cn(
              "relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 animate-in fade-in zoom-in duration-500",
              bgColorClass
            )}
          >
            <div className="relative z-10 text-white">
              <AnimatedIcon
                icon={animationToUse}
                iconName={subject.icon}
                size={34} // Adjusted for the 14x14 container
                active={isHovered}
                useAnimation={true}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
              {language === "ar" && subject.nameAr ? subject.nameAr : subject.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {language === "ar" ? "د." : "Dr."}{" "}
              {language === "ar" && subject.profNameAr ? subject.profNameAr : subject.profName}
            </p>

            {subject.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {subject.description}
              </p>
            )}

            {/* Resource Count - Fixed Opacity via Layering */}
            <div className="flex items-center gap-2 mt-4">
              <div className="relative px-3 py-1 rounded-full overflow-hidden">
                <div className={cn("absolute inset-0 opacity-10", bgColorClass)} />
                <span className={cn("relative z-10 text-xs font-bold", textColorClass)}>
                  {resourceCount} {language === "ar" ? "مصادر" : "Sources"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});
