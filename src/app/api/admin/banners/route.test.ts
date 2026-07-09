import { beforeEach, describe, expect, it, vi } from "vitest";

const bannerAddMock = vi.fn();
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
      if (name === "banners") {
        return {
          add: bannerAddMock,
        };
      }

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

describe("POST /api/admin/banners", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    bannerAddMock.mockResolvedValue({
      id: "banner-1",
    });
    notificationAddMock.mockResolvedValue(undefined);
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

  it("creates a banner and broadcasts the matching notification", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/admin/banners", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          textAr: "إعلان عاجل",
          textEn: "Urgent announcement",
          type: "urgent",
          isActive: true,
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, id: "banner-1" });
    expect(bannerAddMock).toHaveBeenCalledWith({
      textAr: "إعلان عاجل",
      textEn: "Urgent announcement",
      type: "urgent",
      isActive: true,
      createdAt: "__TIMESTAMP__",
      createdBy: "admin-1",
    });
    expect(notificationAddMock).toHaveBeenCalledWith({
      titleAr: "🚨 إعلان عاجل",
      titleEn: "🚨 Urgent Announcement",
      title: "🚨 إعلان عاجل",
      messageAr: "إعلان عاجل",
      messageEn: "Urgent announcement",
      message: "إعلان عاجل",
      type: "urgent",
      target: "all",
      bannerId: "banner-1",
      readBy: [],
      createdAt: "__TIMESTAMP__",
      createdBy: "admin-1",
    });
  });

  it("rejects invalid banner payloads before writes happen", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/admin/banners", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          textAr: "",
          textEn: "",
          type: "urgent",
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(bannerAddMock).not.toHaveBeenCalled();
    expect(notificationAddMock).not.toHaveBeenCalled();
  });
});
