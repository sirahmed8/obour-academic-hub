import { beforeEach, describe, expect, it, vi } from "vitest";

const { collectionMock, whereMock, orderByMock, queryMock, onSnapshotMock } = vi.hoisted(() => ({
  collectionMock: vi.fn(() => "notifications-collection"),
  whereMock: vi.fn((...args) => ({ type: "where", args })),
  orderByMock: vi.fn((...args) => ({ type: "orderBy", args })),
  queryMock: vi.fn(() => "notifications-query"),
  onSnapshotMock: vi.fn(() => vi.fn()),
}));

vi.mock("firebase/firestore", () => ({
  collection: collectionMock,
  doc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: queryMock,
  orderBy: orderByMock,
  onSnapshot: onSnapshotMock,
  arrayUnion: vi.fn(),
  Timestamp: { now: vi.fn() },
  getDocs: vi.fn(),
  where: whereMock,
  limit: vi.fn(),
  writeBatch: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

import { notificationService } from "./notification.service";

describe("notificationService.subscribeToUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes admin-targeted notifications for admins", () => {
    notificationService.subscribeToUser("admin-1", vi.fn(), undefined, {
      includeAdminTarget: true,
    });

    expect(whereMock).toHaveBeenCalledWith("target", "in", ["admin-1", "all", "admins"]);
    expect(onSnapshotMock).toHaveBeenCalled();
  });

  it("only includes personal and global notifications for students", () => {
    notificationService.subscribeToUser("student-1", vi.fn());

    expect(whereMock).toHaveBeenCalledWith("target", "in", ["student-1", "all"]);
    expect(onSnapshotMock).toHaveBeenCalled();
  });
});
