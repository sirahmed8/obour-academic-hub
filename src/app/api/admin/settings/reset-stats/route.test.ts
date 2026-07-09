import { beforeEach, describe, expect, it, vi } from "vitest";

const getMock = vi.fn();

const batchCommitMock = vi.fn();
const batchUpdateMock = vi.fn();
const batchDeleteMock = vi.fn();
const batchSetMock = vi.fn();
const batchMock = {
  update: batchUpdateMock,
  delete: batchDeleteMock,
  set: batchSetMock,
  commit: batchCommitMock,
};

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
      if (
        name === "subjects" ||
        name === "logs" ||
        name === "analytics_logs" ||
        name === "user_stats"
      ) {
        return {
          get: getMock,
          doc: vi.fn((id?: string) => {
            void id;
            return "__DOC_REF_LOG__";
          }),
        };
      }
      if (name === "settings") {
        return {
          doc: vi.fn(() => "__PLATFORM_STATS_DOC_REF__"),
        };
      }
      throw new Error(`Unexpected collection ${name}`);
    }),
    collectionGroup: vi.fn((name: string) => {
      if (name === "resources") {
        return {
          get: getMock,
        };
      }
      throw new Error(`Unexpected collectionGroup ${name}`);
    }),
    batch: vi.fn(() => batchMock),
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

describe("POST /api/admin/settings/reset-stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    requireOwnerMock.mockResolvedValue({ uid: "owner-1", email: "owner@test.com" });
    getMock.mockResolvedValue({
      docs: [{ ref: "__DOC_REF_1__" }, { ref: "__DOC_REF_2__" }],
    });
    batchCommitMock.mockResolvedValue(undefined);
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      void request;
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    });
  });

  it("resets platform statistics and logs successfully", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/admin/settings/reset-stats", {
        method: "POST",
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });

    // Verify batch updates/deletes/sets
    expect(batchUpdateMock).toHaveBeenCalled();
    expect(batchDeleteMock).toHaveBeenCalled();
    expect(batchSetMock).toHaveBeenCalled();
    expect(batchCommitMock).toHaveBeenCalled();
  });
});
