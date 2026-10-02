"use client";

import { useLanguage } from "@/contexts";

export function SkipLink() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:bg-primary focus:text-primary-foreground focus:font-bold focus:text-sm focus:rounded-xl focus:shadow-2xl focus:ring-4 focus:ring-primary/30 focus:outline-none transition-all"
    >
      {isAr ? "انتقل إلى المحتوى الرئيسي" : "Skip to main content"}
    </a>
  );
}
