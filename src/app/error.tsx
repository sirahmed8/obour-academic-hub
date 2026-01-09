"use client";

import { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AlertTriangle, Loader2, CheckCircle2, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isReporting, setIsReporting] = useState(false);
  const [isReported, setIsReported] = useState(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  const reportError = async () => {
    try {
      setIsReporting(true);
      await addDoc(collection(db, "system_errors"), {
        message: error.message,
        stack: error.stack,
        digest: error.digest || null,
        timestamp: new Date().toISOString(),
        userAgent: window.navigator.userAgent,
        url: window.location.href,
        status: "open",
        type: "segment_error",
      });
      setIsReported(true);
    } catch (err) {
      console.error("Failed to report error:", err);
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-6 bg-card border border-border p-8 rounded-3xl shadow-sm"
      >
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load this section. Please try again.
          </p>
        </div>

        <div className="p-3 rounded-lg bg-muted text-left text-xs font-mono overflow-auto max-h-24 border border-border whitespace-pre-wrap">
          {error.message || "Unknown error occurred"}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-medium flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>

          <button
            onClick={reportError}
            disabled={isReporting || isReported}
            className={`flex-1 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-xl transition-all font-medium flex items-center justify-center gap-2 ${
              isReported ? "text-green-600 border-green-200 bg-green-50" : ""
            }`}
          >
            {isReporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isReported ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              "Report Issue"
            )}
            {isReporting ? "Sending..." : isReported ? "Sent" : "Report"}
          </button>
        </div>

        {error.digest && (
          <p className="text-[10px] text-muted-foreground font-mono">ID: {error.digest}</p>
        )}
      </motion.div>
    </div>
  );
}
