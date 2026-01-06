"use client";

import Link from "next/link";
import { Subject } from "@/types";
import { useLanguage } from "@/contexts";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
  subject: Subject;
  resourceCount?: number;
}

export function SubjectCard({ subject, resourceCount = 0 }: SubjectCardProps) {
  const { language } = useLanguage();

  // Dynamic icon
  const IconComponent =
    (Icons as unknown as Record<string, React.ElementType>)[subject.icon] || Icons.BookOpen;

  // Color classes - ensure fallback
  const bgColorClass = subject.color?.startsWith("bg-") ? subject.color : "bg-blue-500";
  // Safe derivation of text color
  const textColorClass = bgColorClass.includes("500")
    ? bgColorClass.replace("bg-", "text-").replace("500", "600")
    : "text-blue-600";

  return (
    <Link href={`/subject?id=${subject.id}`}>
      <div className="group bg-card rounded-2xl p-6 border border-border card-hover cursor-pointer relative overflow-hidden">
        {/* Accent bar */}
        <div
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-l-full",
            bgColorClass
          )}
        />

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn("p-4 rounded-2xl flex-shrink-0", bgColorClass + "/10", textColorClass)}
          >
            <IconComponent size={28} />
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

            {/* Resource Count */}
            <div className="flex items-center gap-2 mt-4">
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  bgColorClass + "/10",
                  textColorClass
                )}
              >
                {resourceCount} {language === "ar" ? "موارد" : "resources"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
