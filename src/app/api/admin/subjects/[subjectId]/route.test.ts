import { beforeEach, describe, expect, it, vi } from "vitest";

const batchDeleteMock = vi.fn();
const batchCommitMock = vi.fn();
const getResourcesMock = vi.fn();
const subjectDocSetMock = vi.fn();
const updatePlatformStatsMock = vi.fn();
const requirePermissionMock = vi.fn();
const handleRouteErrorMock = vi.fn();
const timestampNowMock = vi.fn(() => "__TIMESTAMP__");

const mockBatch = {
  delete: batchDeleteMock,
  commit: batchCommitMock,
};

vi.mock("@/lib/server/firebase-admin", () => ({
  adminDb: {
    batch: vi.fn(() => mockBatch),
    collection: vi.fn((collectionName: string) => {
      if (collectionName === "subjects") {
        return {
          doc: vi.fn(() => ({
            set: subjectDocSetMock,
            collection: vi.fn((subName: string) => {
              if (subName === "resources") {
                return {
                  get: getResourcesMock,
                };
              }
              throw new Error(`Unexpected subcollection ${subName}`);
            }),
          })),
        };
      }
      throw new Error(`Unexpected collection ${collectionName}`);
    }),
  },
  Timestamp: {
    now: timestampNowMock,
  },
}));

vi.mock("@/lib/server/cors", () => ({
  corsOptions: vi.fn(() => new Response(null, { status: 204 })),
  withCors: vi.fn((req, res) => res),
}));

vi.mock("@/lib/server/auth", () => ({
  handleRouteError: handleRouteErrorMock,
  requirePermission: requirePermissionMock,
}));

vi.mock("@/lib/server/stats", () => ({
  updatePlatformStats: updatePlatformStatsMock,
}));

describe("DELETE /api/admin/subjects/[subjectId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermissionMock.mockResolvedValue({ uid: "admin-1" });
    getResourcesMock.mockResolvedValue({
      docs: [{ ref: "__RESOURCE_REF_1__" }, { ref: "__RESOURCE_REF_2__" }],
    });
    batchCommitMock.mockResolvedValue(undefined);
    updatePlatformStatsMock.mockResolvedValue(undefined);
    handleRouteErrorMock.mockImplementation((req, err) =>
      Response.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 })
    );
  });

  it("deletes subject and its nested resources in a batch and updates stats", async () => {
    const { DELETE } = await import("./route");

    const response = await DELETE(
      new Request("http://localhost/api/admin/subjects/subject-1", {
        method: "DELETE",
      }),
      { params: Promise.resolve({ subjectId: "subject-1" }) }
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });

    // Verify it query resources
    expect(getResourcesMock).toHaveBeenCalled();

    // Verify it batched deleted 2 resources and the subject itself
    expect(batchDeleteMock).toHaveBeenCalledTimes(3);
    expect(batchDeleteMock).toHaveBeenNthCalledWith(1, "__RESOURCE_REF_1__");
    expect(batchDeleteMock).toHaveBeenNthCalledWith(2, "__RESOURCE_REF_2__");
    expect(batchCommitMock).toHaveBeenCalled();

    // Verify it updated stats
    expect(updatePlatformStatsMock).toHaveBeenCalledWith("subjects", -1);
  });
});
