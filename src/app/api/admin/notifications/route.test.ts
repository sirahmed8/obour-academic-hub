import { beforeEach, describe, expect, it, vi } from "vitest";

const notificationAddMock = vi.fn();
const requirePermissionMock = vi.fn();
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
      if (name === "notifications") {
        return {
          add: notificationAddMock,
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
  requirePermission: requirePermissionMock,
}));

describe("POST /api/admin/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    notificationAddMock.mockResolvedValue({
      id: "notification-1",
    });
    requirePermissionMock.mockResolvedValue({
      uid: "admin-1",
    });
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      void request;
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    });
  });

  it("creates a notification with normalized fields and Firestore timestamps", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/admin/notifications", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          titleAr: "تنبيه",
          titleEn: "Alert",
          messageAr: "رسالة مهمة",
          messageEn: "Important message",
          type: "warning",
          target: "admins",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, id: "notification-1" });
    expect(notificationAddMock).toHaveBeenCalledWith({
      titleAr: "تنبيه",
      titleEn: "Alert",
      title: "تنبيه",
      messageAr: "رسالة مهمة",
      messageEn: "Important message",
      message: "رسالة مهمة",
      type: "warning",
      target: "admins",
      readBy: [],
      createdAt: "__TIMESTAMP__",
      createdBy: "admin-1",
    });
  });

  it("rejects invalid notification payloads before writes happen", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/admin/notifications", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          titleAr: "",
          titleEn: "",
          messageAr: "",
          messageEn: "",
          type: "warning",
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(notificationAddMock).not.toHaveBeenCalled();
  });
});
