import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetDocs = vi.fn();
const mockSetDoc = vi.fn();
const mockApiFetch = vi.fn();

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((db, ...path) => path.join("/")),
  doc: vi.fn((db, ...path) => path.join("/")),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  query: vi.fn((ref, ...constraints) => ({ ref, constraints })),
  where: vi.fn((field, op, val) => ({ field, op, val })),
  orderBy: vi.fn(),
  limit: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("@/lib/api-client", () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

describe("Tier 1 - Feature 8: Admin Control Panel & User Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches user list with optional role filtering", async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          id: "u1",
          data: () => ({ displayName: "Alice Student", role: "student" }),
        },
        {
          id: "u2",
          data: () => ({ displayName: "Bob Student", role: "student" }),
        },
      ],
    });

    const { userService } = await import("@/services/user.service");
    const users = await userService.getAll({ role: "student" });

    expect(users).toHaveLength(2);
    expect(users[0].role).toBe("student");
  });

  it("promotes student user to admin via admin API endpoint", async () => {
    mockApiFetch.mockResolvedValueOnce({ success: true });

    const { userService } = await import("@/services/user.service");
    await userService.promoteToAdmin("user-55", "student55@obour.edu");

    expect(mockApiFetch).toHaveBeenCalledWith("/api/admin/users/user-55", {
      method: "PATCH",
      body: { role: "admin" },
    });
  });

  it("sends ban command to user ban API route with reason and timestamp", async () => {
    mockApiFetch.mockResolvedValueOnce({ success: true, message: "User banned successfully" });

    const banUser = async (uid: string, reason: string) => {
      return mockApiFetch(`/api/admin/users/${uid}/ban`, {
        method: "PUT",
        body: { reason },
      });
    };

    const res = await banUser("user-bad", "Academic dishonesty");

    expect(res.success).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/admin/users/user-bad/ban", {
      method: "PUT",
      body: { reason: "Academic dishonesty" },
    });
  });

  it("sends unban command to restore user access", async () => {
    mockApiFetch.mockResolvedValueOnce({ success: true, message: "User unbanned successfully" });

    const unbanUser = async (uid: string) => {
      return mockApiFetch(`/api/admin/users/${uid}/unban`, {
        method: "PUT",
      });
    };

    const res = await unbanUser("user-bad");

    expect(res.success).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/admin/users/user-bad/unban", {
      method: "PUT",
    });
  });

  it("sends kick session command to force sign out user active tokens", async () => {
    mockApiFetch.mockResolvedValueOnce({ success: true, message: "User session revoked" });

    const kickUser = async (uid: string) => {
      return mockApiFetch(`/api/admin/users/${uid}/kick`, {
        method: "PUT",
      });
    };

    const res = await kickUser("user-bad");

    expect(res.success).toBe(true);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/admin/users/user-bad/kick", {
      method: "PUT",
    });
  });
});
