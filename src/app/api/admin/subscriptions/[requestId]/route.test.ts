import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const batchUpdateMock = vi.fn();
const batchSetMock = vi.fn();
const batchCommitMock = vi.fn().mockResolvedValue(undefined);

const sampleRequestData = {
  id: "req-123",
  userId: "user-456",
  userEmail: "student@obour.edu.eg",
  plan: "semester",
  planNameAr: "باقة الفصل الدراسي",
  planNameEn: "Semester VIP Pass",
  amount: 199,
  status: "pending",
  durationDays: 120,
};

const requestGetMock = vi.fn().mockResolvedValue({
  exists: true,
  data: () => sampleRequestData,
});

const userGetMock = vi.fn().mockResolvedValue({
  exists: true,
  data: () => ({ isVip: false }),
});

const requirePermissionMock = vi.fn();
const handleRouteErrorMock = vi.fn();
const withCorsMock = vi.fn((request: Request, response: Response) => response);
const corsOptionsMock = vi.fn(() => new Response(null, { status: 204 }));

vi.mock("@/lib/server/firebase-admin", () => ({
  adminDb: {
    collection: vi.fn((name: string) => {
      if (name === "subscription_requests") {
        return {
          doc: vi.fn(() => ({
            get: requestGetMock,
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
      update: batchUpdateMock,
      set: batchSetMock,
      commit: batchCommitMock,
    })),
  },
  FieldValue: {
    serverTimestamp: vi.fn(() => "__SERVER_TIMESTAMP__"),
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

describe("PATCH /api/admin/subscriptions/[requestId]", () => {
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

  it("approves subscription request and grants VIP status with calculated expiration", async () => {
    const { PATCH } = await import("./route");

    const req = new Request("http://localhost/api/admin/subscriptions/req-123", {
      method: "PATCH",
      body: JSON.stringify({
        action: "approve",
        customDurationDays: 120,
      }),
    });

    const response = await PATCH(req as unknown as NextRequest, {
      params: Promise.resolve({ requestId: "req-123" }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe("approved");
    expect(data.durationDays).toBe(120);

    // Verify batch commits
    expect(batchUpdateMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ status: "approved" })
    );
    expect(batchSetMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        isVip: true,
        subscriptionTier: "vip",
        vipType: "paid",
      }),
      { merge: true }
    );
    expect(batchCommitMock).toHaveBeenCalled();
  });

  it("rejects subscription request and notifies student with reason", async () => {
    const { PATCH } = await import("./route");

    const req = new Request("http://localhost/api/admin/subscriptions/req-123", {
      method: "PATCH",
      body: JSON.stringify({
        action: "reject",
        rejectionReason: "رقم العملية غير موجود في كشف الحساب",
      }),
    });

    const response = await PATCH(req as unknown as NextRequest, {
      params: Promise.resolve({ requestId: "req-123" }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe("rejected");
    expect(batchUpdateMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        status: "rejected",
        rejectionReason: "رقم العملية غير موجود في كشف الحساب",
      })
    );
  });
});
