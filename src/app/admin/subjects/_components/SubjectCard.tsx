"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { cn } from "@/lib/utils";
import { getSubjectAnimation } from "@/lib/subjectIcons";
import { Subject } from "@/types";

interface SubjectCardProps {
  isPreview?: boolean;
  language: "ar" | "en";
  onDelete?: () => void;
  onEdit?: () => void;
  subject: Partial<Subject>;
}

export function SubjectCard({ isPreview, language, onDelete, onEdit, subject }: SubjectCardProps) {
  const icon = getSubjectAnimation(subject.icon || "BookOpen");
  const colorClass = subject.color || "bg-blue-500";
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300",
        isPreview
          ? "glass-premium scale-100 border-primary/20 shadow-lg backdrop-blur-2xl backdrop-saturate-150"
          : "glass-premium group border-border backdrop-blur-2xl backdrop-saturate-150 hover:-translate-y-1 hover:border-primary/20 hover:shadow-md"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-[0.03] transition-opacity duration-300",
          colorClass,
          isHovered ? "opacity-[0.08]" : ""
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-[60px] transition-transform duration-500",
          colorClass,
          isHovered ? "scale-150 opacity-30" : ""
        )}
      />

      <div className="relative z-10 flex flex-1 items-start justify-between p-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-2xl p-3.5 text-white shadow-lg shadow-black/5",
              colorClass
            )}
          >
            <AnimatedIcon
              icon={icon}
              iconName={subject.icon}
              size={28}
              className="text-white"
              useAnimation
              active={isHovered}
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold leading-tight">
              {language === "ar"
                ? subject.nameAr || subject.name || "اسم المادة"
                : subject.name || subject.nameAr || "Subject Name"}
            </h3>
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <span className="opacity-70">{language === "ar" ? "دكتور:" : "Dr."}</span>
              <span className="text-foreground/80">
                {language === "ar"
                  ? subject.profNameAr || subject.profName || "اسم المحاضر"
                  : subject.profName || subject.profNameAr || "Professor Name"}
              </span>
            </p>
            {(language === "ar" ? subject.descriptionAr : subject.description) && (
              <p className="mt-1 line-clamp-2 max-w-[200px] text-xs text-muted-foreground/60">
                {language === "ar" ? subject.descriptionAr : subject.description}
              </p>
            )}
          </div>
        </div>

        {!isPreview && (
          <div className="flex translate-x-2 flex-col gap-2 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
            <button
              onClick={onEdit}
              className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-blue-600 shadow-sm transition-all hover:bg-blue-500/20 active:scale-95 dark:text-blue-400"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={onDelete}
              className="rounded-xl bg-red-500/10 p-2.5 text-red-500 shadow-sm transition-all hover:bg-red-500/20 active:scale-95"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {isPreview && (
          <div className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            {language === "ar" ? "معاينة" : "Preview"}
          </div>
        )}
      </div>
    </div>
  );
}
