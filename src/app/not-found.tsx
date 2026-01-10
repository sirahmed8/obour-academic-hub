"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts";
import { AIChatbot } from "@/components/features/AIChatbot";
import { motion } from "framer-motion";
import { Ghost } from "lucide-react";

export default function NotFound() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background p-6">
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-card/50 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-8 md:p-12"
        >
          {/* Icon */}
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Ghost className="w-12 h-12 text-primary animate-bounce-slow" />
          </div>

          {/* Text */}
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
            404
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-foreground/80 mb-4">
            {language === "ar" ? "الصفحة غير موجودة" : "Page Not Found"}
          </h2>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            {language === "ar"
              ? "عذراً، يبدو أن الصفحة التي تبحث عنها قد اختفت أو تم نقلها."
              : "Oops! The page you're looking for seems to have vanished into thin air."}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/25 hover:scale-105 active:scale-95"
            >
              <Home className="w-5 h-5" />
              {language === "ar" ? "الرئيسية" : "Home"}
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
              {language === "ar" ? "رجوع" : "Back"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Floating Chat */}
      <AIChatbot />
    </div>
  );
}
