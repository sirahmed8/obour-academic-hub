import { beforeEach, describe, expect, it, vi } from "vitest";

const settingsSetMock = vi.fn();
const requireOwnerMock = vi.fn();
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

const MOCK_DATE = "2024-01-01T00:00:00.000Z";

vi.mock("@/lib/server/firebase-admin", () => ({
  adminDb: {
    collection: vi.fn((name: string) => {
      if (name === "settings") {
        return {
          doc: vi.fn(() => ({
            set: settingsSetMock,
          })),
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
  requireOwner: requireOwnerMock,
}));

describe("PATCH /api/admin/settings/global", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(MOCK_DATE));

    settingsSetMock.mockResolvedValue(undefined);
    requireOwnerMock.mockResolvedValue({
      uid: "owner-1",
    });
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      void request;
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    });
  });

  it("writes settings updates with Firestore timestamps", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(
      new Request("http://localhost/api/admin/settings/global", {
        method: "PATCH",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          aiEnabled: true,
          chatbotEnabled: false,
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect(settingsSetMock).toHaveBeenCalledWith(
      {
        aiEnabled: true,
        chatbotEnabled: false,
        updatedAt: MOCK_DATE,
        updatedBy: "owner-1",
      },
      { merge: true }
    );
  });

  it("rejects empty settings payloads before writes happen", async () => {
    const { PATCH } = await import("./route");

    const response = await PATCH(
      new Request("http://localhost/api/admin/settings/global", {
        method: "PATCH",
        headers: {
          authorization: "Bearer token",
          "content-type": "application/json",
        },
        body: JSON.stringify({}),
      })
    );

    expect(response.status).toBe(400);
    expect(settingsSetMock).not.toHaveBeenCalled();
  });
});
