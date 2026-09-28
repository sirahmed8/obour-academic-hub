import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const sampleRequests = [
  {
    id: "req-1",
    userId: "user-1",
    userEmail: "student1@obour.edu.eg",
    userName: "Student One",
    plan: "semester",
    amount: 199,
    status: "pending",
    createdAt: "2026-09-27T10:00:00Z",
  },
  {
    id: "req-2",
    userId: "user-2",
    userEmail: "student2@obour.edu.eg",
    userName: "Student Two",
    plan: "monthly",
    amount: 49,
    status: "approved",
    createdAt: "2026-09-26T10:00:00Z",
  },
];

const requirePermissionMock = vi.fn();
const handleRouteErrorMock = vi.fn();
const withCorsMock = vi.fn((request: Request, response: Response) => response);
const corsOptionsMock = vi.fn(() => new Response(null, { status: 204 }));

vi.mock("@/lib/server/firebase-admin", () => ({
  adminDb: {
    collection: vi.fn((name: string) => {
      if (name === "subscription_requests") {
        return {
          get: vi.fn().mockResolvedValue({
            forEach: (cb: (doc: { id: string; data: () => unknown }) => void) => {
              sampleRequests.forEach((req) => {
                cb({
                  id: req.id,
                  data: () => req,
                });
              });
            },
          }),
        };
      }
      throw new Error(`Unexpected collection: ${name}`);
    }),
  },
}));

vi.mock("@/lib/server/cors", () => ({
  corsOptions: corsOptionsMock,
  withCors: withCorsMock,
}));

vi.mock("@/lib/server/auth", () => ({
  handleRouteError: handleRouteErrorMock,
  requirePermission: requirePermissionMock,
}));

describe("GET /api/admin/subscriptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    requirePermissionMock.mockResolvedValue({
      uid: "admin-1",
      email: "admin@obour.edu.eg",
      isOwner: true,
    });
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    });
  });

  it("returns subscription requests list and revenue statistics in EGP", async () => {
    const { GET } = await import("./route");

    const req = new Request("http://localhost/api/admin/subscriptions");
    const response = await GET(req as unknown as NextRequest);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.requests).toHaveLength(2);
    expect(data.stats.totalRequests).toBe(2);
    expect(data.stats.pendingCount).toBe(1);
    expect(data.stats.approvedCount).toBe(1);
    expect(data.stats.totalRevenueEGP).toBe(49);
  });
});
