"use client";

import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AlertTriangle, Loader2, CheckCircle2, RotateCcw, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AuthProvider, LanguageProvider, ThemeProvider, useAuth, useLanguage } from "@/contexts";
import { analyticsService } from "@/services/analytics.service";
import { AIChatbot } from "@/components/features/AIChatbot";
import { Toaster, toast } from "sonner";
import "./globals.css"; // Ensure styles are loaded

function GlobalErrorContent({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isReporting, setIsReporting] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [copied, setCopied] = useState(false);
  // We can safely use hooks here because this component is wrapped in providers
  const { user } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const reportError = async () => {
    try {
      if (!db) {
        toast.error(
          language === "ar" ? "تعذر الاتصال بقاعدة البيانات" : "Cannot connect to database"
        );
        return;
      }
      setIsReporting(true);

      // 1. System Log
      await addDoc(collection(db, "system_errors"), {
        message: error.message,
        stack: error.stack,
        digest: error.digest || null,
        timestamp: serverTimestamp(),
        userAgent: window.navigator.userAgent,
        url: window.location.href,
        status: "open",
        type: "global_error",
        userId: user?.uid || "anonymous",
      });

      // 2. Analytics Log
      if (user) {
        await analyticsService.logReport(user.uid, `Critical Error: ${error.message}`);
      }

      setIsReported(true);
    } catch (err) {
      console.error("Failed to report error:", err);
    } finally {
      setIsReporting(false);
    }
  };

  const handleCopyError = () => {
    const errorDetails = `Error: ${error.message}\nStack: ${error.stack}\nDigest: ${error.digest}\nURL: ${window.location.href}`;
    navigator.clipboard.writeText(errorDetails);
    setCopied(true);
    toast.success(language === "ar" ? "تم نسخ الخطأ" : "Error copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 bg-background overflow-hidden text-foreground font-sans">
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
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            {language === "ar" ? "خطأ جسيم في النظام" : "Critical System Error"}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar"
              ? "نعتذر بشدة، حدث خطأ غير متوقع أدى إلى توقف التطبيق."
              : "We apologize. A critical error has occurred and the app cannot continue."}
          </p>
        </div>

        <div className="relative group p-4 rounded-xl bg-muted/50 border border-border/50 text-left text-xs font-mono mb-6 scrollbar-thin scrollbar-thumb-border">
          <button
            onClick={handleCopyError}
            className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-background rounded-lg border border-border/50 shadow-sm transition-all opacity-0 group-hover:opacity-100"
            title="Copy Error Details"
          >
            {copied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} className="text-muted-foreground" />
            )}
          </button>
          <div className="overflow-auto max-h-32 whitespace-pre-wrap">
            {error.message || "Unknown error occurred"}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-medium flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4" />
            {language === "ar" ? "إنعاش التطبيق" : "Reload App"}
          </button>
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
                  ? "إبلاغ المطور"
                  : "Report to Developer"}
          </button>
        </div>

        {error.digest && (
          <p className="text-[10px] text-muted-foreground font-mono text-center mt-4 opacity-50">
            ID: {error.digest}
          </p>
        )}
      </motion.div>

      <AIChatbot />
      <Toaster position="top-center" />
    </div>
  );
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <GlobalErrorContent error={error} reset={reset} />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
