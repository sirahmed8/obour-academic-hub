import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should allow requests within the limit", () => {
    const id = "test-allow-" + Math.random();
    const config = { interval: 1000, limit: 2 };

    expect(rateLimit(id, config).success).toBe(true);
    expect(rateLimit(id, config).success).toBe(true);
  });

  it("should block requests exceeding the limit", () => {
    const id = "test-block-" + Math.random();
    const config = { interval: 1000, limit: 2 };

    rateLimit(id, config);
    rateLimit(id, config);

    const result = rateLimit(id, config);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reset after interval", () => {
    const id = "test-reset-" + Math.random();
    const config = { interval: 1000, limit: 1 };

    rateLimit(id, config); // 1st request, allowed
    expect(rateLimit(id, config).success).toBe(false); // 2nd request, blocked

    // Advance time
    vi.advanceTimersByTime(1001);

    // Should be allowed again
    expect(rateLimit(id, config).success).toBe(true);
  });
});
