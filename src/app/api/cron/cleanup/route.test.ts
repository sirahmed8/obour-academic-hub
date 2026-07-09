import { beforeEach, describe, expect, it, vi } from "vitest";

const getMock = vi.fn();
const batchCommitMock = vi.fn();
const batchDeleteMock = vi.fn();
const batchMock = {
  delete: batchDeleteMock,
  commit: batchCommitMock,
};

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
      if (name === "analytics_logs" || name === "notifications") {
        return {
          where: vi.fn(() => ({
            limit: vi.fn(() => ({
              get: getMock,
            })),
          })),
        };
      }
      throw new Error(`Unexpected collection ${name}`);
    }),
    batch: vi.fn(() => batchMock),
  },
  Timestamp: {
    fromDate: vi.fn((date: Date) => `__TIMESTAMP_OF_${date.toISOString()}__`),
  },
}));

vi.mock("@/lib/server/cors", () => ({
  corsOptions: corsOptionsMock,
  withCors: withCorsMock,
}));

vi.mock("@/lib/server/error-sanitizer", () => ({
  logServerError: vi.fn(),
  logServerInfo: vi.fn(),
}));

describe("GET /api/cron/cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.CRON_SECRET = "secret_cron_123";
    getMock.mockResolvedValue({
      empty: false,
      size: 2,
      docs: [{ ref: "__DOC_REF_1__" }, { ref: "__DOC_REF_2__" }],
    });
    batchCommitMock.mockResolvedValue(undefined);
  });

  it("fails if unauthorized", async () => {
    const { GET } = await import("./route");
    const response = await GET(
      new Request("http://localhost/api/cron/cleanup", {
        method: "GET",
        headers: {
          authorization: "Bearer wrong_secret",
        },
      })
    );

    expect(response.status).toBe(401);
    expect(getMock).not.toHaveBeenCalled();
  });

  it("runs cleanup successfully when authorized", async () => {
    const { GET } = await import("./route");
    const response = await GET(
      new Request("http://localhost/api/cron/cleanup", {
        method: "GET",
        headers: {
          authorization: "Bearer secret_cron_123",
        },
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "success",
      results: {
        analytics_logs_deleted: 2,
        notifications_deleted: 2,
      },
    });

    expect(batchDeleteMock).toHaveBeenCalledTimes(4); // 2 analytics + 2 notifications
    expect(batchCommitMock).toHaveBeenCalledTimes(2);
  });

  it("handles empty collections gracefully", async () => {
    getMock.mockResolvedValue({
      empty: true,
      size: 0,
      docs: [],
    });

    const { GET } = await import("./route");
    const response = await GET(
      new Request("http://localhost/api/cron/cleanup", {
        method: "GET",
        headers: {
          authorization: "Bearer secret_cron_123",
        },
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "success",
      results: {
        analytics_logs_deleted: 0,
        notifications_deleted: 0,
      },
    });

    expect(batchDeleteMock).not.toHaveBeenCalled();
    expect(batchCommitMock).not.toHaveBeenCalled();
  });
});
