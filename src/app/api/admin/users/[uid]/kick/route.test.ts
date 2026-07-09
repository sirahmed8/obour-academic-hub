import { beforeEach, describe, expect, it, vi } from "vitest";

const userGetMock = vi.fn();
const requirePermissionMock = vi.fn();
const assertCanManageUserMock = vi.fn();
const handleRouteErrorMock = vi.fn();
const withCorsMock = vi.fn((request: Request, response: Response) => {
  void request;
  return response;
});
const corsOptionsMock = vi.fn((request: Request) => {
  void request;
  return new Response(null, { status: 204 });
});

const revokeRefreshTokensMock = vi.fn();

vi.mock("@/lib/server/firebase-admin", () => ({
  adminAuth: {
    revokeRefreshTokens: revokeRefreshTokensMock,
  },
  adminDb: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: userGetMock,
      })),
    })),
  },
}));

vi.mock("@/lib/server/cors", () => ({
  corsOptions: corsOptionsMock,
  withCors: withCorsMock,
}));

vi.mock("@/lib/server/auth", () => ({
  assertCanManageUser: assertCanManageUserMock,
  handleRouteError: handleRouteErrorMock,
  requirePermission: requirePermissionMock,
}));

describe("PUT /api/admin/users/[uid]/kick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    userGetMock.mockResolvedValue({
      exists: true,
      data: () => ({
        role: "student",
        email: "student@example.com",
      }),
    });
    revokeRefreshTokensMock.mockResolvedValue(undefined);

    requirePermissionMock.mockResolvedValue({
      uid: "manager-1",
      isOwner: false,
      role: "admin",
      permissions: new Set(["manage_users"]),
    });
    assertCanManageUserMock.mockImplementation(() => undefined);
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      void request;
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    });
  });

  it("kicks the user successfully after verifying permissions", async () => {
    const { PUT } = await import("./route");

    const response = await PUT(
      new Request("http://localhost/api/admin/users/student-1/kick", {
        method: "PUT",
        headers: {
          authorization: "Bearer token",
        },
      }),
      { params: Promise.resolve({ uid: "student-1" }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });

    expect(requirePermissionMock).toHaveBeenCalledWith(expect.any(Request), "manage_users");
    expect(assertCanManageUserMock).toHaveBeenCalled();
    expect(revokeRefreshTokensMock).toHaveBeenCalledWith("student-1");
  });

  it("returns 404 if the user is not found in Firestore", async () => {
    userGetMock.mockResolvedValueOnce({
      exists: false,
    });

    const { PUT } = await import("./route");

    const response = await PUT(
      new Request("http://localhost/api/admin/users/student-1/kick", {
        method: "PUT",
        headers: {
          authorization: "Bearer token",
        },
      }),
      { params: Promise.resolve({ uid: "student-1" }) }
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "User not found" });
    expect(revokeRefreshTokensMock).not.toHaveBeenCalled();
  });
});
