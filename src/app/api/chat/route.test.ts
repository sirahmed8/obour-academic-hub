import { POST } from "./route";
import { rateLimit } from "@/lib/rate-limit";
import { generateText } from "ai";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
  AIModelProvider: {
    GPT35: "gpt-3.5-turbo",
    GPT4: "gpt-4",
    GEMINI_PRO: "gemini-pro",
  },
  getAIModel: vi.fn((model) => model),
  SYSTEM_PROMPT: "test-prompt",
}));

describe("Chat API Route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 429 when rate limit is exceeded", async () => {
    // Mock rateLimit to return failure
    (rateLimit as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ success: false });

    // Create a mock request
    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [] }),
      headers: {
        "x-forwarded-for": "1.2.3.4",
      },
    });

    const response = await POST(req);
    expect(response.status).toBe(429);
  });

  it("should not leak error details on failure", async () => {
    // Mock rateLimit to return success
    (rateLimit as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ success: true });

    // Mock generateText to throw a sensitive error
    const sensitiveError = new Error("Sensitive internal info");
    (generateText as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(sensitiveError);

    const req = new Request("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toHaveProperty("error");
    // This is the key assertion for the security fix:
    expect(body).not.toHaveProperty("details");
  });
});
