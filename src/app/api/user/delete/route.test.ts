import { beforeEach, describe, expect, it, vi } from "vitest";

const deleteUserMock = vi.fn();
const batchDeleteMock = vi.fn();
const batchUpdateMock = vi.fn();
const batchCommitMock = vi.fn();
const logAddMock = vi.fn();
const getRequestContextMock = vi.fn();
const handleRouteErrorMock = vi.fn();

const getMock = vi.fn();

vi.mock("@/lib/server/firebase-admin", () => ({
  adminAuth: {
    deleteUser: deleteUserMock,
  },
  adminDb: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        delete: vi.fn(),
        collection: vi.fn(() => ({
          get: getMock,
        })),
      })),
      add: logAddMock,
      where: vi.fn(() => ({
        get: getMock,
      })),
    })),
    batch: vi.fn(() => ({
      delete: batchDeleteMock,
      update: batchUpdateMock,
      commit: batchCommitMock,
    })),
  },
}));

vi.mock("@/lib/server/cors", () => ({
  corsOptions: vi.fn(() => new Response(null, { status: 204 })),
  withCors: vi.fn((_req, res) => res),
}));

vi.mock("@/lib/server/auth", () => ({
  getRequestContext: getRequestContextMock,
  handleRouteError: handleRouteErrorMock,
}));

describe("DELETE /api/user/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    getRequestContextMock.mockResolvedValue({
      uid: "user-123",
      email: "user@example.com",
      role: "student",
      permissions: new Set([]),
      isOwner: false,
    });
    deleteUserMock.mockResolvedValue(undefined);
    batchCommitMock.mockResolvedValue(undefined);
    getMock.mockResolvedValue({
      forEach: () => {},
    });
    logAddMock.mockResolvedValue({ id: "log-1" });
    handleRouteErrorMock.mockImplementation((req, err) => {
      return Response.json(
        { error: err instanceof Error ? err.message : "Error" },
        { status: 500 }
      );
    });
  });

  it("successfully deletes the user and stats, deletes from auth, and logs the action", async () => {
    const { DELETE } = await import("./route");

    const response = await DELETE(
      new Request("http://localhost/api/user/delete", {
        method: "DELETE",
        headers: {
          authorization: "Bearer token",
        },
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });

    // Verify batch operations
    expect(batchDeleteMock).toHaveBeenCalledTimes(2);
    expect(batchCommitMock).toHaveBeenCalledTimes(1);

    // Verify Auth deletion
    expect(deleteUserMock).toHaveBeenCalledWith("user-123");

    // Verify system log
    expect(logAddMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "USER_SELF_DELETE",
        userEmail: "user@example.com",
      })
    );
  });

  it("deletes subcollection documents if they exist", async () => {
    getMock.mockResolvedValueOnce({
      forEach: (cb: (doc: { ref: string }) => void) => {
        cb({ ref: "task-doc-ref-1" });
        cb({ ref: "task-doc-ref-2" });
      },
    });
    getMock.mockResolvedValueOnce({
      forEach: (cb: (doc: { ref: string }) => void) => {
        cb({ ref: "stats-doc-ref-1" });
      },
    });

    const { DELETE } = await import("./route");

    const response = await DELETE(
      new Request("http://localhost/api/user/delete", {
        method: "DELETE",
        headers: {
          authorization: "Bearer token",
        },
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });

    expect(batchDeleteMock).toHaveBeenCalledTimes(5);
    expect(batchDeleteMock).toHaveBeenCalledWith("task-doc-ref-1");
    expect(batchDeleteMock).toHaveBeenCalledWith("task-doc-ref-2");
    expect(batchDeleteMock).toHaveBeenCalledWith("stats-doc-ref-1");
  });

  it("anonymizes global chat messages if they exist", async () => {
    getMock.mockResolvedValueOnce({
      forEach: () => {},
    });
    getMock.mockResolvedValueOnce({
      forEach: () => {},
    });
    getMock.mockResolvedValueOnce({
      forEach: (cb: (doc: { ref: string }) => void) => {
        cb({ ref: "chat-msg-1" });
        cb({ ref: "chat-msg-2" });
      },
    });

    const { DELETE } = await import("./route");

    const response = await DELETE(
      new Request("http://localhost/api/user/delete", {
        method: "DELETE",
        headers: {
          authorization: "Bearer token",
        },
      })
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

  it("returns 401 when UID is missing", async () => {
    getRequestContextMock.mockResolvedValueOnce({
      uid: "",
      email: "",
      role: "student",
      permissions: new Set([]),
      isOwner: false,
    });

    const { DELETE } = await import("./route");

    const response = await DELETE(
      new Request("http://localhost/api/user/delete", {
        method: "DELETE",
      })
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });
});
