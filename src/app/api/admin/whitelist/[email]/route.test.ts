import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const whitelistSetMock = vi.fn();
const whitelistDeleteMock = vi.fn();
const whitelistDocMock = vi.fn(() => ({
  set: whitelistSetMock,
  delete: whitelistDeleteMock,
}));
const usersWhereMock = vi.fn();
const usersLimitMock = vi.fn();
const queryGetMock = vi.fn();
const userDocMock = vi.fn();
const userSetMock = vi.fn();
const requirePermissionMock = vi.fn();
const handleRouteErrorMock = vi.fn();
const syncCustomClaimsMock = vi.fn();
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
      if (name === "whitelisted_admins") {
        return {
          doc: whitelistDocMock,
        };
      }

      if (name === "users") {
        return {
          where: usersWhereMock,
          doc: userDocMock,
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
  requireOwner: requirePermissionMock,
  syncCustomClaims: syncCustomClaimsMock,
}));

describe("admin whitelist route", () => {
  const originalOwnerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    process.env.NEXT_PUBLIC_OWNER_EMAIL = "owner@example.com";

    usersLimitMock.mockReturnValue({
      get: queryGetMock,
    });
    usersWhereMock.mockReturnValue({
      limit: usersLimitMock,
    });
    userDocMock.mockReturnValue({
      get: vi.fn().mockResolvedValue({
        exists: true,
        id: "test-user-id",
        ref: {
          set: userSetMock,
        },
      }),
    });
    queryGetMock.mockResolvedValue({
      docs: [
        {
          id: "test-user-id",
          ref: {
            set: userSetMock,
          },
        },
      ],
    });
    whitelistSetMock.mockResolvedValue(undefined);
    whitelistDeleteMock.mockResolvedValue(undefined);
    userSetMock.mockResolvedValue(undefined);
    syncCustomClaimsMock.mockResolvedValue(undefined);
    requirePermissionMock.mockResolvedValue({
      uid: "manager-1",
    });
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      void request;
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    });
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_OWNER_EMAIL = originalOwnerEmail;
  });

  it("normalizes the email and syncs the matching user to admin", async () => {
    const { PUT } = await import("./route");

    const response = await PUT(
      new Request("http://localhost/api/admin/whitelist/newadmin%40example.com", {
        method: "PUT",
        headers: {
          authorization: "Bearer token",
        },
      }),
      { params: Promise.resolve({ email: "NewAdmin%40Example.COM" }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(whitelistDocMock).toHaveBeenCalledWith("newadmin@example.com");
    expect(whitelistSetMock).toHaveBeenCalledWith({
      email: "newadmin@example.com",
      role: "admin",
      permissions: [
        "manage_subjects",
        "manage_resources",
        "send_notifications",
        "manage_announcements",
      ],
      addedBy: "manager-1",
      addedAt: "__TIMESTAMP__",
    });
    expect(usersWhereMock).toHaveBeenCalledWith("email", "==", "newadmin@example.com");
    expect(userSetMock).toHaveBeenCalledWith(
      {
        role: "admin",
        permissions: [
          "manage_subjects",
          "manage_resources",
          "send_notifications",
          "manage_announcements",
        ],
        updatedAt: "__TIMESTAMP__",
      },
      { merge: true }
    );
  });

  it("rejects attempts to remove owner access", async () => {
    const { DELETE } = await import("./route");

    const response = await DELETE(
      new Request("http://localhost/api/admin/whitelist/owner%40example.com", {
        method: "DELETE",
        headers: {
          authorization: "Bearer token",
        },
      }),
      { params: Promise.resolve({ email: "owner%40example.com" }) }
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Owner access cannot be removed",
    });
    expect(whitelistDeleteMock).not.toHaveBeenCalled();
    expect(userSetMock).not.toHaveBeenCalled();
  });

  it("removes whitelist access and demotes the matching user", async () => {
    const { DELETE } = await import("./route");

    const response = await DELETE(
      new Request("http://localhost/api/admin/whitelist/admin%40example.com", {
        method: "DELETE",
        headers: {
          authorization: "Bearer token",
        },
      }),
      { params: Promise.resolve({ email: "admin%40example.com" }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(whitelistDocMock).toHaveBeenCalledWith("admin@example.com");
    expect(whitelistDeleteMock).toHaveBeenCalledTimes(1);
    expect(userSetMock).toHaveBeenCalledWith(
      {
        role: "student",
        permissions: [],
        updatedAt: "__TIMESTAMP__",
      },
      { merge: true }
    );
  });

  it("removes whitelist access and demotes the user directly by UID", async () => {
    const { DELETE } = await import("./route");

    const response = await DELETE(
      new Request("http://localhost/api/admin/whitelist/admin%40example.com?uid=test-user-id", {
        method: "DELETE",
        headers: {
          authorization: "Bearer token",
        },
      }),
      { params: Promise.resolve({ email: "admin%40example.com" }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(whitelistDocMock).toHaveBeenCalledWith("admin@example.com");
    expect(whitelistDeleteMock).toHaveBeenCalledTimes(1);
    expect(userDocMock).toHaveBeenCalledWith("test-user-id");
    expect(userSetMock).toHaveBeenCalledWith(
      {
        role: "student",
        permissions: [],
        updatedAt: "__TIMESTAMP__",
      },
      { merge: true }
    );
  });
});
