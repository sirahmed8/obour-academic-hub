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

const sendMailMock = vi.fn();
const createTransportMock = vi.fn(() => ({
  sendMail: sendMailMock,
}));

const notificationAddMock = vi.fn();

vi.mock("nodemailer", () => ({
  default: {
    createTransport: createTransportMock,
  },
}));

vi.mock("@/lib/server/firebase-admin", () => ({
  adminDb: {
    collection: vi.fn((colName) => {
      if (colName === "users") {
        return {
          doc: vi.fn(() => ({
            get: userGetMock,
          })),
        };
      }
      if (colName === "notifications") {
        return {
          add: notificationAddMock,
        };
      }
      return {};
    }),
  },
  Timestamp: {
    now: () => "__TIMESTAMP__",
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

describe("POST /api/admin/users/[uid]/alert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    // Default envs
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_USER = "user@example.com";
    process.env.SMTP_PASS = "pass";

    userGetMock.mockResolvedValue({
      exists: true,
      data: () => ({
        role: "student",
        email: "student@example.com",
      }),
    });
    sendMailMock.mockResolvedValue({ messageId: "123" });
    notificationAddMock.mockResolvedValue({ id: "notif-1" });

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

  it("sends an alert and creates a notification successfully", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/admin/users/student-1/alert", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "Warning Title",
          message: "Warning Message content here.",
        }),
      }),
      { params: Promise.resolve({ uid: "student-1" }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, emailSent: true });

    expect(requirePermissionMock).toHaveBeenCalledWith(expect.any(Request), "manage_users");
    expect(assertCanManageUserMock).toHaveBeenCalled();
    expect(createTransportMock).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "student@example.com",
        subject: "Warning Title",
      })
    );
    expect(notificationAddMock).toHaveBeenCalledWith(
      expect.objectContaining({
        titleEn: "Warning Title",
        messageEn: "Warning Message content here.",
        target: "student-1",
      })
    );
  });

  it("returns 404 if the user is not found in Firestore", async () => {
    userGetMock.mockResolvedValueOnce({
      exists: false,
    });

    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/admin/users/student-1/alert", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "Warning Title",
          message: "Warning Message",
        }),
      }),
      { params: Promise.resolve({ uid: "student-1" }) }
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "User not found" });
    expect(sendMailMock).not.toHaveBeenCalled();
  });
});
