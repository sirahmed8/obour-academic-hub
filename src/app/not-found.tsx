"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useLanguage } from "@/contexts";

export default function NotFound() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto animate-fade-in-up">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[12rem] font-black text-primary/10 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-6 bg-primary/10 rounded-3xl backdrop-blur-sm">
              <Search className="w-16 h-16 text-primary animate-pulse" />
            </div>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {language === "ar" ? "الصفحة غير موجودة" : "Page Not Found"}
        </h1>
        <p className="text-muted-foreground mb-8 text-lg">
          {language === "ar"
            ? "عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها."
            : "Sorry, we couldn't find the page you're looking for."}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/main"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]"
          >
            <Home className="w-5 h-5" />
            {language === "ar" ? "الصفحة الرئيسية" : "Go Home"}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground font-medium rounded-xl hover:bg-muted/80 transition-all duration-200 active:scale-[0.98]"
          >
            <ArrowLeft className="w-5 h-5" />
            {language === "ar" ? "العودة" : "Go Back"}
          </button>
        </div>
      </div>
    </div>
  );
}
