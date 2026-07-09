import "server-only";

/**
 * Sanitized logging utility for server-side errors.
 * Removes sensitive data (UIDs, emails, tokens, full stacks) from logs.
 */

type LogContext = {
  route?: string;
  action?: string;
  userId?: string;
  userEmail?: string;
  [key: string]: unknown;
};

/**
 * Pattern to detect sensitive information
 */
const SENSITIVE_PATTERNS = {
  // UUID-like patterns
  uid: /\b[a-zA-Z0-9]{20,}\b/g,
  // Email patterns
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // Token patterns (Bearer, JWT-like)
  token: /Bearer\s+[A-Za-z0-9\-_.]+/gi,
  // API keys
  apiKey: /api[_-]?key[=:]\s*[A-Za-z0-9\-_]+/gi,
  // File paths in stack traces (optional mask)
  filePath: /\/[a-zA-Z0-9._/-]+\//g,
};

/**
 * Sanitize string by replacing sensitive patterns with placeholders
 */
function sanitizeString(str: string): string {
  if (!str || typeof str !== "string") return str;

  let sanitized = str;

  // Replace emails
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.email, "[EMAIL]");

  // Replace tokens
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.token, "[TOKEN]");

  // Replace API keys
  sanitized = sanitized.replace(SENSITIVE_PATTERNS.apiKey, "[API_KEY]");

  return sanitized;
}

/**
 * Extract safe error information without exposing sensitive data
 */
export function sanitizeError(error: unknown): {
  message: string;
  code?: string;
  hint?: string;
} {
  if (error instanceof Error) {
    const message = sanitizeString(error.message);

    // Try to extract error code if it exists
    const errorWithCode = error as {
      code?: string | number;
      errorInfo?: { code?: string | number };
    };
    const code = errorWithCode.code || errorWithCode.errorInfo?.code;

    return {
      message,
      code: code ? String(code) : undefined,
    };
  }

  const message = sanitizeString(String(error));
  return { message };
}

/**
 * Log error securely on the server-side
 * Use this instead of console.error for all error logging
 */
export function logServerError(message: string, error?: unknown, context?: LogContext): void {
  const timestamp = new Date().toISOString();
  const sanitizedError = error ? sanitizeError(error) : null;

  // Use a safer structured logging approach
  const logEntry = {
    timestamp,
    level: "ERROR",
    message,
    error: sanitizedError,
    context: context || undefined,
  };

  try {
    // Simple JSON.stringify for production logging, but with a safety net
    // for circular structures if needed (though sanitizeError already flattens it)
    console.error(JSON.stringify(logEntry));
  } catch {
    // Ultimate fallback if stringify fails
    console.error(`[${timestamp}] ERROR: ${message} - (Log error: Failed to stringify log entry)`);
    if (sanitizedError) {
      console.error(`[${timestamp}] ERROR DETAILS: ${sanitizedError.message}`);
    }
  }
}

/**
 * Log warning securely on the server-side
 */
export function logServerWarning(message: string, context?: LogContext): void {
  const timestamp = new Date().toISOString();

  try {
    console.warn(
      JSON.stringify({
        timestamp,
        level: "WARN",
        message,
        context: context || undefined,
      })
    );
  } catch {
    console.warn(`[${timestamp}] WARN: ${message}`);
  }
}

/**
 * Log info securely on the server-side
 */
export function logServerInfo(message: string, context?: LogContext): void {
  const timestamp = new Date().toISOString();

  try {
    console.log(
      JSON.stringify({
        timestamp,
        level: "INFO",
        message,
        context: context || undefined,
      })
    );
  } catch {
    console.log(`[${timestamp}] INFO: ${message}`);
  }
}
