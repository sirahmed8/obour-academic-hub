import { beforeEach, describe, expect, it, vi } from "vitest";

class MockTimestamp {
  static now = vi.fn();
  toDate() {
    return new Date();
  }
}
const timestampNowMock = MockTimestamp.now;
const userGetMock = vi.fn();
const userSetMock = vi.fn();
const collectionMock = vi.fn((name: string) => {
  if (name === "users") {
    return {
      doc: vi.fn(() => ({
        get: userGetMock,
        set: userSetMock,
      })),
    };
  }

  if (name === "settings") {
    return {
      doc: vi.fn(() => ({
        set: vi.fn().mockResolvedValue(undefined),
      })),
    };
  }

  throw new Error(`Unexpected collection ${name}`);
});
const getRequestContextMock = vi.fn();
const handleRouteErrorMock = vi.fn();
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
    collection: collectionMock,
  },
  getAdminDb: vi.fn(() => ({
    collection: collectionMock,
  })),
  Timestamp: MockTimestamp,
  FieldValue: {
    increment: vi.fn((val) => `increment(${val})`),
    serverTimestamp: vi.fn(() => "__SERVER_TIMESTAMP__"),
  },
}));

vi.mock("@/lib/server/cors", () => ({
  corsOptions: corsOptionsMock,
  withCors: withCorsMock,
}));

vi.mock("@/lib/server/auth", () => ({
  getRequestContext: getRequestContextMock,
  handleRouteError: handleRouteErrorMock,
  syncCustomClaims: vi.fn(),
}));

describe("POST /api/auth/bootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    userGetMock.mockResolvedValue({ exists: false });
    userSetMock.mockResolvedValue(undefined);
    timestampNowMock.mockReturnValue(new MockTimestamp());
    getRequestContextMock.mockResolvedValue({
      uid: "student-1",
      email: "student@example.com",
      decodedToken: {
        name: "Student Name",
        picture: "https://example.com/avatar.png",
      },
      profile: null,
      isOwner: false,
    });
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      void request;
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    });
  });

  it("bootstraps new users as students with default permissions", async () => {
    userGetMock.mockResolvedValue({ exists: false });
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/auth/bootstrap", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
        },
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "success",
      profile: expect.objectContaining({
        uid: "student-1",
        email: "student@example.com",
        displayName: "Student Name",
        photoURL: "https://example.com/avatar.png",
        role: "student",
        permissions: ["view_resources"],
      }),
      isNewUser: true,
    });
    expect(userSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: "student-1",
        role: "student",
        permissions: ["view_resources"],
      }),
      { merge: true }
    );
    expect(timestampNowMock).toHaveBeenCalledTimes(1);
  });

  it("preserves existing admin metadata during bootstrap", async () => {
    const createdAt = { kind: "created-at", toDate: () => new Date() };

    userGetMock.mockResolvedValue({
      exists: true,
      data: () => ({
        role: "admin",
        permissions: ["manage_users"],
        createdAt,
      }),
    });
    getRequestContextMock.mockResolvedValue({
      uid: "admin-1",
      email: "admin@example.com",
      decodedToken: {
        name: "   ",
        picture: undefined,
      },
      profile: {
        role: "admin",
        permissions: ["manage_users"],
        displayName: "Existing Admin",
        photoURL: "https://example.com/existing.png",
        createdAt,
      },
      isOwner: false,
    });

    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/auth/bootstrap", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
        },
      })
    );

    expect(response.status).toBe(200);
    expect(userSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        uid: "admin-1",
        displayName: "   ",
        photoURL: "",
        role: "admin",
        permissions: ["manage_users"],
      }),
      { merge: true }
    );
  });
});
