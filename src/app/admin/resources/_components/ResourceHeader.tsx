"use client";

import { FileText } from "lucide-react";
import { FadeIn } from "@/components/ui/Animations";

interface ResourceHeaderProps {
  language: string;
}

export function ResourceHeader({ language }: ResourceHeaderProps) {
  return (
    <FadeIn className="mb-8">
      <h1 className="flex items-center gap-3 text-primary text-2xl font-bold">
        <FileText className="text-primary" />
        {language === "ar" ? "إدارة المصادر" : "Resource Management"}
      </h1>
      <p className="mt-1 text-muted-foreground">
        {language === "ar"
          ? "أضف، عدّل، واحذف مصادر المواد الدراسية"
          : "Add, edit, and delete subject resources"}
      </p>
    </FadeIn>
  );
}
