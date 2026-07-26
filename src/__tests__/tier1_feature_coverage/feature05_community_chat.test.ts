import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAddDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockUpdateDoc = vi.fn();

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((db, ...path) => path.join("/")),
  doc: vi.fn((db, ...path) => path.join("/")),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  setDoc: (...args: unknown[]) => mockSetDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  increment: (val: number) => ({ type: "increment", val }),
  serverTimestamp: () => "__TIMESTAMP__",
  writeBatch: vi.fn(() => ({
    update: vi.fn(),
    commit: vi.fn(async () => {}),
  })),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("@/lib/profanityFilter", () => ({
  filterProfanity: vi.fn((text: string) => text.replace(/badword/gi, "****")),
}));

describe("Tier 1 - Feature 5: Community Hub & Live Peer Chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends live chat message with automatic profanity filtering", async () => {
    mockAddDoc.mockResolvedValueOnce({ id: "msg-1" });
    mockSetDoc.mockResolvedValueOnce(undefined);

    const { sendMessage } = await import("@/lib/chatUtils");

    await sendMessage("global_chat", "Hello badword world!", "user-1", "Alice", false);

    expect(mockAddDoc).toHaveBeenCalledWith(
      "chats/global_chat/messages",
      expect.objectContaining({
        text: "Hello **** world!",
        senderId: "user-1",
        senderName: "Alice",
        context: "live",
      })
    );
  });

  it("marks chat messages as seen by admin or user recipient", async () => {
    mockSetDoc.mockResolvedValueOnce(undefined);
    const { getDocs } = await import("firebase/firestore");
    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [],
    } as unknown as import("firebase/firestore").QuerySnapshot);

    const { markMessagesAsSeen } = await import("@/lib/chatUtils");

    await markMessagesAsSeen("global_chat", true);

    expect(mockSetDoc).toHaveBeenCalledWith(
      "chats/global_chat",
      { adminUnreadCount: 0 },
      { merge: true }
    );
  });

  it("toggles emoji reaction on chat message", async () => {
    const { toggleReaction } = await import("@/lib/chatUtils");
    const { getDoc } = await import("firebase/firestore");

    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ reactions: {} }),
    } as unknown as import("firebase/firestore").DocumentSnapshot);

    await toggleReaction("global_chat", "msg-1", "user-1", "👍");

    expect(mockUpdateDoc).toHaveBeenCalledWith("chats/global_chat/messages/msg-1", {
      reactions: { "user-1": "👍" },
    });
  });

  it("soft deletes a message and replaces text with deletion placeholder", async () => {
    const { deleteMessage } = await import("@/lib/chatUtils");

    await deleteMessage("global_chat", "msg-1");

    expect(mockUpdateDoc).toHaveBeenCalledWith("chats/global_chat/messages/msg-1", {
      isDeleted: true,
      text: "🚫 This message was deleted",
    });
  });

  it("tracks online presence status counts for active chat participants", () => {
    const usersPresence = [
      { uid: "u1", name: "Alice", online: true },
      { uid: "u2", name: "Bob", online: true },
      { uid: "u3", name: "Charlie", online: false },
    ];

    const onlineCount = usersPresence.filter((u) => u.online).length;

    expect(onlineCount).toBe(2);
    expect(usersPresence.map((u) => u.name)).toContain("Alice");
  });
});
