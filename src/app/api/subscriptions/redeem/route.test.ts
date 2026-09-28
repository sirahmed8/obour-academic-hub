import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const userGetMock = vi.fn();
const batchSetMock = vi.fn();
const batchUpdateMock = vi.fn();
const batchCommitMock = vi.fn().mockResolvedValue(undefined);

const promoGetMock = vi.fn().mockResolvedValue({
  empty: true,
  docs: [],
});

const getRequestContextMock = vi.fn();
const handleRouteErrorMock = vi.fn();
const withCorsMock = vi.fn((request: Request, response: Response) => response);
const corsOptionsMock = vi.fn(() => new Response(null, { status: 204 }));

vi.mock("@/lib/server/firebase-admin", () => ({
  adminDb: {
    collection: vi.fn((name: string) => {
      if (name === "promo_codes") {
        return {
          where: vi.fn(() => ({
            limit: vi.fn(() => ({
              get: promoGetMock,
            })),
          })),
        };
      }
      if (name === "users") {
        return {
          doc: vi.fn(() => ({
            get: userGetMock,
          })),
        };
      }
      if (name === "notifications" || name === "logs") {
        return {
          doc: vi.fn(() => ({
            id: `id-${name}`,
          })),
        };
      }
      throw new Error(`Unexpected collection: ${name}`);
    }),
    batch: vi.fn(() => ({
      set: batchSetMock,
      update: batchUpdateMock,
      commit: batchCommitMock,
    })),
  },
  FieldValue: {
    serverTimestamp: vi.fn(() => "__SERVER_TIMESTAMP__"),
    arrayUnion: vi.fn((val) => val),
    increment: vi.fn((val) => val),
  },
}));

vi.mock("@/lib/server/rate-limit", () => ({
  rateLimit: vi.fn().mockResolvedValue({ allowed: true }),
}));

vi.mock("@/lib/server/cors", () => ({
  corsOptions: corsOptionsMock,
  withCors: withCorsMock,
}));

vi.mock("@/lib/server/auth", () => ({
  handleRouteError: handleRouteErrorMock,
  getRequestContext: getRequestContextMock,
}));

describe("POST /api/subscriptions/redeem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    getRequestContextMock.mockResolvedValue({
      uid: "user-123",
      email: "scholar@obour.edu.eg",
      profile: { displayName: "Scholar" },
      isOwner: false,
    });
    userGetMock.mockResolvedValue({
      data: () => ({ isVip: false }),
    });
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    });
  });

  it("redeems valid seed promo code OBOUR2026 successfully for 120 days", async () => {
    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/subscriptions/redeem", {
      method: "POST",
      body: JSON.stringify({ code: "OBOUR2026" }),
    });

    const response = await POST(req as unknown as NextRequest);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.durationDays).toBe(120);
    expect(batchCommitMock).toHaveBeenCalled();
  });

  it("rejects unknown or invalid promo codes", async () => {
    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/subscriptions/redeem", {
      method: "POST",
      body: JSON.stringify({ code: "FAKECODE999" }),
    });

    const response = await POST(req as unknown as NextRequest);
    expect(response.status).toBe(404);
  });
});
