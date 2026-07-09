import { beforeEach, describe, expect, it, vi } from "vitest";

const docSetMock = vi.fn();
const docMock = vi.fn(() => ({
  set: docSetMock,
}));

const getRequestContextMock = vi.fn();
const handleRouteErrorMock = vi.fn();
const timestampNowMock = vi.fn(() => "__TIMESTAMP__");
const withCorsMock = vi.fn((request: Request, response: Response) => {
  void request;
  return response;
});
const corsOptionsMock = vi.fn((request: Request) => {
  void request;
  return new Response(null, { status: 204 });
});

vi.mock("@/lib/server/firebase-admin", () => ({
  adminDb: {
    collection: vi.fn((name: string) => {
      if (name === "admin_approvals") {
        return {
          doc: docMock,
        };
      }
      throw new Error(`Unexpected collection ${name}`);
    }),
  },
  Timestamp: {
    now: timestampNowMock,
  },
}));

vi.mock("@/lib/server/cors", () => ({
  corsOptions: corsOptionsMock,
  withCors: withCorsMock,
}));

vi.mock("@/lib/server/auth", () => ({
  handleRouteError: handleRouteErrorMock,
  getRequestContext: getRequestContextMock,
}));

describe("PATCH /api/admin/approvals/[requestId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    getRequestContextMock.mockResolvedValue({
      uid: "admin-1",
      isOwner: false,
      permissions: new Set(["manage_subjects"]),
    });
    docSetMock.mockResolvedValue(undefined);
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      void request;
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    });
  });

  it("approves request successfully", async () => {
    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/admin/approvals/req-123", {
        method: "PATCH",
        body: JSON.stringify({
          status: "approved",
        }),
      }),
      { params: Promise.resolve({ requestId: "req-123" }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(docMock).toHaveBeenCalledWith("req-123");
    expect(docSetMock).toHaveBeenCalledWith(
      {
        status: "approved",
        approvedBy: "admin-1",
        approvedAt: "__TIMESTAMP__",
      },
      { merge: true }
    );
  });

  it("rejects request successfully", async () => {
    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/admin/approvals/req-123", {
        method: "PATCH",
        body: JSON.stringify({
          status: "rejected",
        }),
      }),
      { params: Promise.resolve({ requestId: "req-123" }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(docSetMock).toHaveBeenCalledWith(
      {
        status: "rejected",
        rejectedBy: "admin-1",
        rejectedAt: "__TIMESTAMP__",
      },
      { merge: true }
    );
  });

  it("fails if unauthorized", async () => {
    getRequestContextMock.mockResolvedValue({
      uid: "student-1",
      isOwner: false,
      permissions: new Set([]),
    });

    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/admin/approvals/req-123", {
        method: "PATCH",
        body: JSON.stringify({
          status: "approved",
        }),
      }),
      { params: Promise.resolve({ requestId: "req-123" }) }
    );

    expect(response.status).toBe(403);
    expect(docSetMock).not.toHaveBeenCalled();
  });
});
