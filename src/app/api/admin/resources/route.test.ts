import { beforeEach, describe, expect, it, vi } from "vitest";

const resourceAddMock = vi.fn();
const subjectGetMock = vi.fn();
const subjectCollectionMock = vi.fn();
const subjectDocMock = vi.fn();
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
          doc: subjectDocMock,
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

describe("POST /api/admin/resources", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    subjectCollectionMock.mockReturnValue({
      add: resourceAddMock,
    });
    subjectDocMock.mockReturnValue({
      collection: subjectCollectionMock,
      get: subjectGetMock,
    });
    resourceAddMock.mockResolvedValue({
      id: "resource-1",
    });
    subjectGetMock.mockResolvedValue({
      data: () => ({
        name: "Physics",
        nameAr: "فيزياء",
      }),
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

  it("creates the resource and a matching notification with Firestore timestamps", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/admin/resources", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          subjectId: "subject-1",
          title: "Lecture 1",
          titleAr: "المحاضرة 1",
          description: "Intro",
          descriptionAr: "مقدمة",
          url: "https://example.com/lecture-1.pdf",
          thumbnailUrl: "",
          type: "pdf",
          displayAsFile: true,
          orderIndex: 3,
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, id: "resource-1" });
    expect(subjectDocMock).toHaveBeenCalledWith("subject-1");
    expect(subjectCollectionMock).toHaveBeenCalledWith("resources");
    expect(resourceAddMock).toHaveBeenCalledWith({
      title: "Lecture 1",
      titleAr: "المحاضرة 1",
      description: "Intro",
      descriptionAr: "مقدمة",
      url: "https://example.com/lecture-1.pdf",
      type: "pdf",
      displayAsFile: true,
      orderIndex: 3,
      thumbnailUrl: "",
      createdAt: "__TIMESTAMP__",
      createdBy: "admin-1",
    });
    expect(notificationAddMock).toHaveBeenCalledWith(
      expect.objectContaining({
        subjectId: "subject-1",
        resourceId: "resource-1",
        createdAt: "__TIMESTAMP__",
        createdBy: "admin-1",
        titleEn: "📚 New Resource",
        messageEn: expect.stringContaining("Physics"),
        messageAr: expect.stringContaining("فيزياء"),
      })
    );
  });

  it("rejects invalid resource payloads before any writes happen", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/admin/resources", {
        method: "POST",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          subjectId: "subject-1",
          title: "",
          url: "not-a-url",
          type: "pdf",
          orderIndex: -1,
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(resourceAddMock).not.toHaveBeenCalled();
    expect(notificationAddMock).not.toHaveBeenCalled();
  });
});
