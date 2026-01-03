"use client";

import { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

export default function GlobalError({
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
        digest: error.digest,
        timestamp: new Date().toISOString(),
        userAgent: window.navigator.userAgent,
        url: window.location.href,
        status: "open",
      });
      setIsReported(true);
    } catch (err) {
      console.error("Failed to report error:", err);
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Something went wrong!</h1>
            <p className="text-muted-foreground">
              We apologize for the inconvenience. An unexpected error has occurred.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 text-left text-sm font-mono overflow-auto max-h-32 border border-border">
            {error.message || "Unknown error occurred"}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Try Again
            </button>

            <button
              onClick={reportError}
              disabled={isReporting || isReported}
              className={`px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                isReported ? "text-green-600 border-green-200 bg-green-50 hover:bg-green-100" : ""
              }`}
            >
              {isReporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : isReported ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Reported
                </>
              ) : (
                "Report to Admin"
              )}
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-8">
            Error Code: {error.digest || "UNKNOWN"}
          </p>
        </div>
      </body>
    </html>
  );
}
