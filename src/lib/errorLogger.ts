import * as Sentry from "@sentry/nextjs";

type ErrorSeverity = "info" | "warning" | "error" | "critical";

interface ErrorContext {
  userId?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

/**
 * Centralized error logging service
 * Handles logging to Console (Dev) and Sentry/Firestore (Prod)
 */
export const errorLogger = {
  /**
   * Log an error with context safely without crashing execution
   */
  log: (error: Error | string, severity: ErrorSeverity = "error", context?: ErrorContext) => {
    try {
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
          `${colorMap[severity] || colorMap.error}[${severity.toUpperCase()}] ${errorMessage}\x1b[0m`
        );
        if (errorStack) console.error(errorStack);
        if (context) console.log("Context:", context);
        console.groupEnd();
      }

      // 2. Production: Send to Sentry
      if (process.env.NODE_ENV === "production") {
        try {
          Sentry.withScope((scope) => {
            scope.setLevel(severity as Sentry.SeverityLevel);
            if (context) {
              scope.setExtras(context);
            }
            Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
          });
        } catch {
          // Fallback if Sentry scope fails
        }
      }
    } catch (loggingError) {
      console.error("Critical: Error in errorLogger itself:", loggingError);
    }
  },

  /**
   * Add a breadcrumb event for diagnostic tracing
   */
  addBreadcrumb: (message: string, category = "app", level: Sentry.SeverityLevel = "info") => {
    try {
      if (process.env.NODE_ENV === "production") {
        Sentry.addBreadcrumb({ message, category, level });
      }
    } catch {
      // Ignore Sentry breadcrumb failures
    }
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
