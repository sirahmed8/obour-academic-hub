import * as Sentry from "@sentry/nextjs";

type ErrorSeverity = "info" | "warning" | "error" | "critical";

interface ErrorContext {
  userId?: string;
  [key: string]: unknown;
}

/**
 * Centralized error logging service
 * Handles logging to Console (Dev) and Sentry/Firestore (Prod)
 */
export const errorLogger = {
  /**
   * Log an error with context
   */
  log: (error: Error | string, severity: ErrorSeverity = "error", context?: ErrorContext) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // 1. Development: Log to console
    if (process.env.NODE_ENV === "development") {
      const colorMap = {
        info: "\x1b[36m", // Cyan
        warning: "\x1b[33m", // Yellow
        error: "\x1b[31m", // Red
        critical: "\x1b[41m\x1b[37m", // Red BG
      };

      console.groupCollapsed(
        `${colorMap[severity]}[${severity.toUpperCase()}] ${errorMessage}\x1b[0m`
      );
      if (errorStack) console.error(errorStack);
      if (context) console.log("Context:", context);
      console.groupEnd();
    }

    // 2. Production: Send to Sentry
    if (process.env.NODE_ENV === "production") {
      Sentry.withScope((scope) => {
        scope.setLevel(severity as Sentry.SeverityLevel);
        if (context) {
          scope.setExtras(context);
        }
        Sentry.captureException(error);
      });
    }

    // 3. Optional: Log critical errors to Firestore (via separate service if needed)
    // Kept simple here to avoid circular deps with firebase.ts
  },

  /**
   * Helper for try/catch blocks
   */
  capture: (error: unknown, context?: ErrorContext) => {
    if (error instanceof Error) {
      errorLogger.log(error, "error", context);
    } else {
      errorLogger.log(String(error), "error", context);
    }
  },
};
