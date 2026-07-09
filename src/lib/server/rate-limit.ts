import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logServerError, logServerWarning } from "@/lib/server/error-sanitizer";

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

// Initialize Upstash Redis client
let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch (error) {
  console.warn(
    "Failed to initialize Upstash Redis from environment variables. Falling back to memory.",
    error
  );
}

// Standard in-memory fallback for local development
const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(options: RateLimitOptions) {
  const now = Date.now();
  const current = memoryBuckets.get(options.key);

  if (!current || current.resetAt <= now) {
    memoryBuckets.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return { allowed: true, remaining: options.limit - 1, retryAfterMs: options.windowMs };
  }

  if (current.count >= options.limit) {
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(current.resetAt - now, 0) };
  }

  current.count += 1;
  return {
    allowed: true,
    remaining: Math.max(options.limit - current.count, 0),
    retryAfterMs: Math.max(current.resetAt - now, 0),
  };
}

/**
 * Distributed Rate Limiter
 * Uses Upstash Redis in production, falls back to in-memory locally.
 */
export async function rateLimit(options: RateLimitOptions) {
  if (!redis) {
    logServerWarning("Using in-memory rate limiting (UPSTASH keys missing)", {
      action: "rate_limit_fallback",
    });
    return memoryRateLimit(options);
  }

  try {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(options.limit, `${options.windowMs} ms`),
      analytics: true,
      prefix: "@upstash/ratelimit/obour",
    });

    const { success, remaining, reset } = await ratelimit.limit(options.key);
    const now = Date.now();

    return {
      allowed: success,
      remaining,
      retryAfterMs: Math.max(reset - now, 0),
    };
  } catch (error) {
    logServerError("Upstash rate limit execution error", error, {
      action: "rate_limit_error",
      key: options.key,
    });
    return memoryRateLimit(options);
  }
}
