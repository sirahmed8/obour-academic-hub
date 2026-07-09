import { beforeEach, describe, expect, it, vi } from "vitest";

const subjectAddMock = vi.fn();
const subjectCountGetMock = vi.fn();
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
      if (name === "subjects") {
        return {
          count: vi.fn(() => ({
            get: subjectCountGetMock,
          })),
          add: subjectAddMock,
        };
      }

      if (name === "notifications") {
        return {
          add: notificationAddMock,
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
    }),
  },
  Timestamp: {
    now: timestampNowMock,
  },
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
  handleRouteError: handleRouteErrorMock,
  requirePermission: requirePermissionMock,
}));

describe("POST /api/admin/subjects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    subjectCountGetMock.mockResolvedValue({
      data: () => ({
        count: 12,
      }),
    });
    subjectAddMock.mockResolvedValue({
      id: "subject-13",
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

  it("creates a subject with a Firestore timestamp and broadcasts a notification", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/admin/subjects", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Physics",
          nameAr: "فيزياء",
          profName: "Dr. Ali",
          profNameAr: "د. علي",
          description: "Core course",
          descriptionAr: "مادة أساسية",
          icon: "atom",
          color: "bg-blue-500",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, id: "subject-13" });
    expect(subjectAddMock).toHaveBeenCalledWith({
      name: "Physics",
      nameAr: "فيزياء",
      profName: "Dr. Ali",
      profNameAr: "د. علي",
      description: "Core course",
      descriptionAr: "مادة أساسية",
      icon: "atom",
      color: "bg-blue-500",
      createdAt: "__TIMESTAMP__",
      createdBy: "admin-1",
      orderIndex: 12,
    });
    expect(notificationAddMock).toHaveBeenCalledWith(
      expect.objectContaining({
        subjectId: "subject-13",
        createdAt: "__TIMESTAMP__",
        createdBy: "admin-1",
        titleEn: "🏫 New Subject",
        messageEn: "New subject added: Physics",
        messageAr: "تم إضافة مادة جديدة: فيزياء",
      })
    );
  });

  it("rejects invalid subject payloads before writes happen", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/admin/subjects", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "",
          profName: "",
          icon: "",
          color: "not-a-tailwind-bg-class",
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(subjectAddMock).not.toHaveBeenCalled();
    expect(notificationAddMock).not.toHaveBeenCalled();
  });
});
