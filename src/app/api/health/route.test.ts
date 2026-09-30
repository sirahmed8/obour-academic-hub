import { describe, expect, it, vi } from "vitest";

const getLimitMock = vi.fn().mockResolvedValue({ empty: false });

vi.mock("@/lib/server/firebase-admin", () => ({
  adminDb: {
    collection: vi.fn(() => ({
      limit: vi.fn(() => ({
        get: getLimitMock,
      })),
    })),
  },
}));

describe("GET /api/health", () => {
  it("returns healthy status and 200 with database check latency", async () => {
    const { GET, HEAD } = await import("./route");

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("healthy");
    expect(data.checks.database.status).toBe("up");
    expect(data.checks.environment.status).toBeDefined();

    const headResponse = await HEAD();
    expect(headResponse.status).toBe(200);
  });
});
