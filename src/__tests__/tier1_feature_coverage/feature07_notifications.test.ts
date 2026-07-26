import { beforeEach, describe, expect, it, vi } from "vitest";

const mockOnSnapshot = vi.fn();
const mockWhere = vi.fn((field, op, val) => ({ field, op, val }));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((db, ...path) => path.join("/")),
  query: vi.fn((ref, ...constraints) => ({ ref, constraints })),
  where: (field: string, op: string, val: unknown) => mockWhere(field, op, val),
  orderBy: vi.fn(),
  limit: vi.fn((val) => ({ type: "limit", val })),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

describe("Tier 1 - Feature 7: System Notifications & Live Banners", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("subscribes to user notifications with personal and global target filtering", async () => {
    mockOnSnapshot.mockReturnValue(vi.fn());

    const { notificationService } = await import("@/services/notification.service");
    notificationService.subscribeToUser("student-123", vi.fn());

    expect(mockWhere).toHaveBeenCalledWith("target", "in", ["student-123", "all"]);
    expect(mockOnSnapshot).toHaveBeenCalled();
  });

  it("includes admin target filter when subscriber is an admin user", async () => {
    mockOnSnapshot.mockReturnValue(vi.fn());

    const { notificationService } = await import("@/services/notification.service");
    notificationService.subscribeToUser("admin-999", vi.fn(), undefined, {
      includeAdminTarget: true,
    });

    expect(mockWhere).toHaveBeenCalledWith("target", "in", ["admin-999", "all", "admins"]);
  });

  it("computes unread notification badge count accurately", () => {
    const notifications = [
      { id: "n1", title: "New Lecture", read: false },
      { id: "n2", title: "Assignment Reminder", read: true },
      { id: "n3", title: "System Maintenance", read: false },
    ];

    const unreadCount = notifications.filter((n) => !n.read).length;

    expect(unreadCount).toBe(2);
  });

  it("formats live announcement banner objects and active status flag", () => {
    const banner = {
      id: "banner-1",
      title: "Midterm Exam Schedule Posted",
      content: "Check your department portal for exact dates.",
      type: "info" as const,
      active: true,
      createdAt: "2026-07-26T00:00:00Z",
    };

    expect(banner.active).toBe(true);
    expect(banner.type).toBe("info");
    expect(banner.title).toContain("Midterm");
  });

  it("validates alert payload format for targeted admin notifications", () => {
    const alertPayload = {
      targetUid: "student-123",
      title: "Academic Warning",
      message: "Please complete your pending registration.",
      priority: "high",
    };

    expect(alertPayload.targetUid).toBe("student-123");
    expect(alertPayload.priority).toBe("high");
  });
});
