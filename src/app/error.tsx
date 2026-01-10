"use client";

import { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AlertTriangle, Loader2, CheckCircle2, RotateCcw, Home } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth, useLanguage } from "@/contexts";
import { analyticsService } from "@/services/analytics.service";
import { AIChatbot } from "@/components/features/AIChatbot";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isReporting, setIsReporting] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const { user } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const reportError = async () => {
    try {
      setIsReporting(true);
      // 1. System Log
      await addDoc(collection(db, "system_errors"), {
        message: error.message,
        stack: error.stack,
        digest: error.digest || null,
        timestamp: new Date().toISOString(),
        userAgent: window.navigator.userAgent,
        url: window.location.href,
        status: "open",
        type: "segment_error",
        userId: user?.uid || "anonymous",
      });

      // 2. Analytics Log (User Action)
      if (user) {
        await analyticsService.logReport(user.uid, `Error: ${error.message}`);
      }

      setIsReported(true);
    } catch (err) {
      console.error("Failed to report error:", err);
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-background overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center relative">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
        </div>

        <div className="space-y-3 text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {language === "ar" ? "حدث خطأ غير متوقع" : "Something went wrong"}
          </h2>
          <p className="text-muted-foreground">
            {language === "ar"
              ? "نعتذر عن الإزعاج، حدث خطأ أثناء تحميل هذه الصفحة."
              : "We couldn't load this section. Please try again."}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-muted/50 border border-border/50 text-left text-xs font-mono overflow-auto max-h-32 mb-6 whitespace-pre-wrap scrollbar-thin scrollbar-thumb-border">
          {error.message || "Unknown error occurred"}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-medium flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            {language === "ar" ? "إعادة المحاولة" : "Try Again"}
          </button>

          <Link
            href="/"
            className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-all font-medium flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <button
            onClick={reportError}
            disabled={isReporting || isReported}
            className={cn(
              "w-full px-4 py-2.5 rounded-xl transition-all font-medium flex items-center justify-center gap-2",
              isReported
                ? "bg-linear-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20 border-none scale-[1.02]"
                : "border border-input bg-background/50 hover:bg-accent/50 hover:text-accent-foreground"
            )}
          >
            {isReporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isReported ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {isReporting
              ? language === "ar"
                ? "جاري الإرسال..."
                : "Sending..."
              : isReported
                ? language === "ar"
                  ? "تم الإبلاغ"
                  : "Reported"
                : language === "ar"
                  ? "إبلاغ عن المشكلة"
                  : "Report Issue"}
          </button>
        </div>

        {error.digest && (
          <p className="text-[10px] text-muted-foreground font-mono text-center mt-4 opacity-50">
            ID: {error.digest}
          </p>
        )}
      </motion.div>

      {/* Live Support */}
      <AIChatbot />
    </div>
  );
}
