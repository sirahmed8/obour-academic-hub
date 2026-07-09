import { beforeEach, describe, expect, it, vi } from "vitest";

const userGetMock = vi.fn();
const userSetMock = vi.fn();
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
const fieldValueDeleteMock = vi.fn(() => "__DELETE__");

const deleteUserMock = vi.fn();
const batchDeleteMock = vi.fn();
const batchUpdateMock = vi.fn();
const batchCommitMock = vi.fn();
const logAddMock = vi.fn();
const subColGetMock = vi.fn();

vi.mock("@/lib/server/firebase-admin", () => ({
  adminAuth: {
    deleteUser: deleteUserMock,
  },
  adminDb: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: userGetMock,
        set: userSetMock,
        collection: vi.fn(() => ({
          get: subColGetMock,
        })),
      })),
      add: logAddMock,
      where: vi.fn(() => ({
        get: subColGetMock,
      })),
    })),
    batch: vi.fn(() => ({
      delete: batchDeleteMock,
      update: batchUpdateMock,
      commit: batchCommitMock,
    })),
  },
  FieldValue: {
    delete: fieldValueDeleteMock,
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
  syncCustomClaims: vi.fn(),
}));

describe("PATCH /api/admin/users/[uid]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    userGetMock.mockResolvedValue({
      exists: true,
      data: () => ({
        role: "student",
        permissions: [],
      }),
    });
    userSetMock.mockResolvedValue(undefined);
    deleteUserMock.mockResolvedValue(undefined);
    batchCommitMock.mockResolvedValue(undefined);
    logAddMock.mockResolvedValue({ id: "log-1" });
    subColGetMock.mockResolvedValue({
      forEach: () => {},
    });
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

  it("assigns default permissions when promoting a user to admin", async () => {
    // Promoting to admin requires owner context
    requirePermissionMock.mockResolvedValueOnce({
      uid: "manager-1",
      isOwner: true,
      role: "owner",
      permissions: new Set(["manage_users"]),
    });

    const { PATCH } = await import("./route");

    const response = await PATCH(
      new Request("http://localhost/api/admin/users/student-1", {
        method: "PATCH",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          role: "admin",
        }),
      }),
      { params: Promise.resolve({ uid: "student-1" }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(userSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "admin",
        permissions: [
          "manage_subjects",
          "manage_resources",
          "send_notifications",
          "manage_announcements",
        ],
        updatedBy: "manager-1",
        updatedAt: "__TIMESTAMP__",
      }),
      { merge: true }
    );
  });

  it("removes studentCode when an empty value is submitted", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(
      new Request("http://localhost/api/admin/users/student-1", {
        method: "PATCH",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          studentCode: "",
        }),
      }),
      { params: Promise.resolve({ uid: "student-1" }) }
    );

    expect(response.status).toBe(200);
    expect(fieldValueDeleteMock).toHaveBeenCalledTimes(1);
    expect(userSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        studentCode: "__DELETE__",
      }),
      { merge: true }
    );
  });

  it("rejects non-owner permission updates for non-admin users", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(
      new Request("http://localhost/api/admin/users/student-1", {
        method: "PATCH",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          permissions: ["manage_users"],
        }),
      }),
      { params: Promise.resolve({ uid: "student-1" }) }
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Permissions can only be assigned to admins",
    });
    expect(userSetMock).not.toHaveBeenCalled();
  });

  describe("DELETE /api/admin/users/[uid]", () => {
    it("successfully deletes the user (and subcollections) and logs the action", async () => {
      subColGetMock.mockResolvedValueOnce({
        forEach: (cb: (doc: { ref: string }) => void) => {
          cb({ ref: "task-1" });
        },
      });
      subColGetMock.mockResolvedValueOnce({
        forEach: (cb: (doc: { ref: string }) => void) => {
          cb({ ref: "stats-1" });
        },
      });

      const { DELETE } = await import("./route");

      const response = await DELETE(
        new Request("http://localhost/api/admin/users/student-1", {
          method: "DELETE",
          headers: {
            authorization: "Bearer token",
          },
        }),
        { params: Promise.resolve({ uid: "student-1" }) }
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });

      expect(batchDeleteMock).toHaveBeenCalledTimes(4);
      expect(batchDeleteMock).toHaveBeenCalledWith("task-1");
      expect(batchDeleteMock).toHaveBeenCalledWith("stats-1");
      expect(batchCommitMock).toHaveBeenCalledTimes(1);

      expect(deleteUserMock).toHaveBeenCalledWith("student-1");
      expect(logAddMock).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "DELETE_USER",
          userId: "manager-1",
        })
      );
    });

    it("rejects when deleting own account", async () => {
      const { DELETE } = await import("./route");

      const response = await DELETE(
        new Request("http://localhost/api/admin/users/manager-1", {
          method: "DELETE",
          headers: {
            authorization: "Bearer token",
          },
        }),
        { params: Promise.resolve({ uid: "manager-1" }) }
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "You cannot delete your own account" });
    });

    it("prevents non-owners from deleting admins or owners", async () => {
      userGetMock.mockResolvedValueOnce({
        exists: true,
        data: () => ({
          role: "admin",
          permissions: ["manage_users"],
        }),
      });

      const { DELETE } = await import("./route");

      const response = await DELETE(
        new Request("http://localhost/api/admin/users/admin-2", {
          method: "DELETE",
          headers: {
            authorization: "Bearer token",
          },
        }),
        { params: Promise.resolve({ uid: "admin-2" }) }
      );

      expect(response.status).toBe(403);
      expect(await response.json()).toEqual({
        error: "Only the owner can delete admin/owner accounts",
      });
    });

    it("anonymizes global chat messages if they exist", async () => {
      subColGetMock.mockResolvedValueOnce({
        forEach: () => {},
      });
      subColGetMock.mockResolvedValueOnce({
        forEach: () => {},
      });
      subColGetMock.mockResolvedValueOnce({
        forEach: (cb: (doc: { ref: string }) => void) => {
          cb({ ref: "chat-msg-1" });
          cb({ ref: "chat-msg-2" });
        },
      });

      const { DELETE } = await import("./route");

      const response = await DELETE(
        new Request("http://localhost/api/admin/users/student-1", {
          method: "DELETE",
          headers: {
            authorization: "Bearer token",
          },
        }),
        { params: Promise.resolve({ uid: "student-1" }) }
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({ success: true });

      expect(batchUpdateMock).toHaveBeenCalledTimes(2);
      expect(batchUpdateMock).toHaveBeenCalledWith("chat-msg-1", {
        displayName: "Deleted User",
        uid: "deleted",
        role: "student",
      });
      expect(batchUpdateMock).toHaveBeenCalledWith("chat-msg-2", {
        displayName: "Deleted User",
        uid: "deleted",
        role: "student",
      });
    });
  });
});
