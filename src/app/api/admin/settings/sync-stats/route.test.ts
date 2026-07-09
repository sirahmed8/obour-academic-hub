import { beforeEach, describe, expect, it, vi } from "vitest";

const countGetMock = vi.fn();
const countMock = vi.fn(() => ({
  get: countGetMock,
}));

const platformStatsDocSetMock = vi.fn();
const platformStatsDocMock = vi.fn(() => ({
  set: platformStatsDocSetMock,
}));

const logsAddMock = vi.fn();

const requireOwnerMock = vi.fn();
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
    collection: vi.fn((name: string) => {
      if (name === "users" || name === "subjects") {
        return {
          count: countMock,
        };
      }
      if (name === "settings") {
        return {
          doc: platformStatsDocMock,
        };
      }
      if (name === "logs") {
        return {
          add: logsAddMock,
        };
      }
      throw new Error(`Unexpected collection ${name}`);
    }),
    collectionGroup: vi.fn((name: string) => {
      if (name === "resources") {
        return {
          count: countMock,
        };
      }
      throw new Error(`Unexpected collectionGroup ${name}`);
    }),
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

describe("POST /api/admin/settings/sync-stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    requireOwnerMock.mockResolvedValue({ uid: "owner-1", email: "owner@test.com" });
    countGetMock.mockResolvedValue({
      data: () => ({ count: 5 }),
    });
    platformStatsDocSetMock.mockResolvedValue(undefined);
    logsAddMock.mockResolvedValue({ id: "log-1" });
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      void request;
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    });
  });

  it("synchronizes platform statistics successfully", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/admin/settings/sync-stats", {
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      stats: {
        students: 5,
        subjects: 5,
        resources: 5,
      },
    });

    expect(platformStatsDocMock).toHaveBeenCalledWith("platform_stats");
    expect(platformStatsDocSetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        students: 5,
        subjects: 5,
        resources: 5,
        syncMethod: "server_count",
      }),
      { merge: true }
    );

    expect(logsAddMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "SYNC_STATS",
        userId: "owner-1",
        userEmail: "owner@test.com",
      })
    );
  });
});
