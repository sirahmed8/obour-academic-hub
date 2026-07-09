import { beforeEach, describe, expect, it, vi } from "vitest";

const userGetMock = vi.fn();
const userUpdateMock = vi.fn();
const requirePermissionMock = vi.fn();
const assertCanManageUserMock = vi.fn();
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

const updateUserMock = vi.fn();

vi.mock("@/lib/server/firebase-admin", () => ({
  adminAuth: {
    updateUser: updateUserMock,
  },
  adminDb: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: userGetMock,
        update: userUpdateMock,
      })),
    })),
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
  assertCanManageUser: assertCanManageUserMock,
  handleRouteError: handleRouteErrorMock,
  requirePermission: requirePermissionMock,
}));

describe("PUT /api/admin/users/[uid]/unban", () => {
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
    userUpdateMock.mockResolvedValue(undefined);
    updateUserMock.mockResolvedValue(undefined);

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

  it("unbans the user successfully after verifying permissions", async () => {
    const { PUT } = await import("./route");

    const response = await PUT(
      new Request("http://localhost/api/admin/users/student-1/unban", {
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
    expect(userUpdateMock).toHaveBeenCalledWith({
      status: "active",
      updatedAt: "__TIMESTAMP__",
    });
    expect(updateUserMock).toHaveBeenCalledWith("student-1", { disabled: false });
  });

  it("returns 404 if the user is not found in Firestore", async () => {
    userGetMock.mockResolvedValueOnce({
      exists: false,
    });

    const { PUT } = await import("./route");

    const response = await PUT(
      new Request("http://localhost/api/admin/users/student-1/unban", {
        method: "PUT",
        headers: {
          authorization: "Bearer token",
        },
      }),
      { params: Promise.resolve({ uid: "student-1" }) }
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "User not found" });
    expect(userUpdateMock).not.toHaveBeenCalled();
  });
});
