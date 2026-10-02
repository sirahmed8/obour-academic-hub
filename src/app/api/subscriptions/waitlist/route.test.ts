import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

const mockAdd = vi.fn().mockResolvedValue({ id: "waitlist-123" });

vi.mock("@/lib/server/firebase-admin", () => ({
  adminDb: {
    collection: vi.fn(() => ({
      add: mockAdd,
    })),
  },
}));

vi.mock("@/lib/server/auth", () => ({
  getRequestContext: vi.fn().mockResolvedValue({
    uid: "student-waitlist-1",
    email: "student@example.com",
    role: "student",
  }),
}));

vi.mock("@/lib/server/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({
    allowed: true,
    remaining: 4,
    retryAfterMs: 0,
  }),
}));

describe("POST /api/subscriptions/waitlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers valid user email into priority waitlist", async () => {
    const request = new Request("http://localhost:3000/api/subscriptions/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "student@example.com",
        name: "Omar Ali",
        gateway: "card_online",
        plan: "semester",
        notes: "Interested in instant card checkout",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain("تم تسجيلك");
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "student@example.com",
        name: "Omar Ali",
        gateway: "card_online",
        plan: "semester",
        userId: "student-waitlist-1",
      })
    );
  });

  it("returns 400 for invalid email address", async () => {
    const request = new Request("http://localhost:3000/api/subscriptions/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "not-an-email",
        plan: "monthly",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json.error).toBe("Invalid waitlist payload data");
  });
});
