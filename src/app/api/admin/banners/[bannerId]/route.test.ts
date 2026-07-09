import { beforeEach, describe, expect, it, vi } from "vitest";

const bannerDocSetMock = vi.fn();
const bannerDocDeleteMock = vi.fn();
const bannerDocMock = vi.fn(() => ({
  set: bannerDocSetMock,
  delete: bannerDocDeleteMock,
}));

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
          doc: bannerDocMock,
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

describe("PATCH /api/admin/banners/[bannerId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    bannerDocSetMock.mockResolvedValue(undefined);
    bannerDocDeleteMock.mockResolvedValue(undefined);
    requirePermissionMock.mockResolvedValue({ uid: "admin-1" });
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      void request;
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    });
  });

  it("updates banner details successfully", async () => {
    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/admin/banners/banner-123", {
        method: "PATCH",
        body: JSON.stringify({
          textAr: "إعلان معدل",
          isActive: false,
        }),
      }),
      { params: Promise.resolve({ bannerId: "banner-123" }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(bannerDocMock).toHaveBeenCalledWith("banner-123");
    expect(bannerDocSetMock).toHaveBeenCalledWith(
      {
        textAr: "إعلان معدل",
        isActive: false,
        updatedAt: "__TIMESTAMP__",
        updatedBy: "admin-1",
      },
      { merge: true }
    );
  });

  it("rejects empty updates", async () => {
    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/admin/banners/banner-123", {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ bannerId: "banner-123" }) }
    );

    expect(response.status).toBe(400);
    expect(bannerDocSetMock).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/admin/banners/[bannerId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    bannerDocDeleteMock.mockResolvedValue(undefined);
    requirePermissionMock.mockResolvedValue({ uid: "admin-1" });
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      void request;
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    });
  });

  it("deletes the banner successfully", async () => {
    const { DELETE } = await import("./route");
    const response = await DELETE(
      new Request("http://localhost/api/admin/banners/banner-123", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ bannerId: "banner-123" }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(bannerDocMock).toHaveBeenCalledWith("banner-123");
    expect(bannerDocDeleteMock).toHaveBeenCalled();
  });
});
