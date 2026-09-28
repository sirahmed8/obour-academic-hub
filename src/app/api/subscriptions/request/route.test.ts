import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const docSetMock = vi.fn();
const docMock = vi.fn(() => ({
  id: "sub-req-123",
  set: docSetMock,
}));

const emptyQueryGetMock = vi.fn().mockResolvedValue({
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
      if (name === "subscription_requests") {
        return {
          doc: docMock,
          where: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn(() => ({
                get: emptyQueryGetMock,
              })),
            })),
          })),
        };
      }
      if (name === "notifications") {
        return {
          doc: vi.fn(() => ({
            id: "notif-123",
            set: vi.fn().mockResolvedValue(undefined),
          })),
        };
      }
      throw new Error(`Unexpected collection: ${name}`);
    }),
  },
  FieldValue: {
    serverTimestamp: vi.fn(() => "__SERVER_TIMESTAMP__"),
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

describe("POST /api/subscriptions/request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    getRequestContextMock.mockResolvedValue({
      uid: "user-123",
      email: "student@obour.edu.eg",
      profile: {
        displayName: "Ahmed Student",
        studentCode: "2024001",
      },
      isOwner: false,
    });
    docSetMock.mockResolvedValue(undefined);
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    });
  });

  it("submits semester subscription request in EGP successfully", async () => {
    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/subscriptions/request", {
      method: "POST",
      body: JSON.stringify({
        plan: "semester",
        paymentMethod: "instapay",
        senderPhoneOrAccount: "01012345678",
        transactionReference: "IPN-987654321",
        receiptUrl: "https://cloudinary.com/receipt.jpg",
        notes: "Paid via InstaPay from CIB account",
      }),
    });

    const response = await POST(req as unknown as NextRequest);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.requestId).toBe("sub-req-123");
    expect(data.plan.amount).toBe(199);
    expect(data.plan.durationDays).toBe(120);

    expect(docSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-123",
        plan: "semester",
        amount: 199,
        currency: "EGP",
        paymentMethod: "instapay",
        senderPhoneOrAccount: "01012345678",
        status: "pending",
      })
    );
  });

  it("validates input payload and rejects missing sender phone", async () => {
    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/subscriptions/request", {
      method: "POST",
      body: JSON.stringify({
        plan: "monthly",
        paymentMethod: "vodafone_cash",
        senderPhoneOrAccount: "", // Empty!
      }),
    });

    const response = await POST(req as unknown as NextRequest);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Invalid subscription request payload");
  });
});
