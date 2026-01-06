type RateLimitConfig = {
  interval: number; // Window size in milliseconds
  limit: number; // Max requests per window
};

const trackers = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { interval: 60000, limit: 10 }
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const record = trackers.get(identifier);

  if (!record || now > record.expiresAt) {
    trackers.set(identifier, {
      count: 1,
      expiresAt: now + config.interval,
    });
    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: now + config.interval,
    };
  }

  if (record.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: record.expiresAt,
    };
  }

  record.count++;
  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - record.count,
    reset: record.expiresAt,
  };
}

// Clean up expired entries periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of trackers.entries()) {
      if (now > record.expiresAt) {
        trackers.delete(key);
      }
    }
  }, 300000);
}
