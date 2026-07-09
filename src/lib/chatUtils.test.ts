import { beforeEach, describe, expect, it, vi } from "vitest";

const addDocMock = vi.fn();
const setDocMock = vi.fn();
const collectionMock = vi.fn(() => "messages-ref");
const docMock = vi.fn(() => "chat-ref");
const serverTimestampMock = vi.fn(() => "server-timestamp");
const incrementMock = vi.fn((value: number) => ({ __increment: value }));

vi.mock("firebase/firestore", () => ({
  collection: collectionMock,
  addDoc: addDocMock,
  updateDoc: vi.fn(),
  doc: docMock,
  serverTimestamp: serverTimestampMock,
  getDoc: vi.fn(),
  setDoc: setDocMock,
  increment: incrementMock,
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  writeBatch: vi.fn(),
}));

vi.mock("./firebase", () => ({
  db: {},
}));

vi.mock("./profanityFilter", () => ({
  filterProfanity: (text: string) => text,
}));

describe("sendMessage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addDocMock.mockResolvedValue({});
    setDocMock.mockResolvedValue(undefined);
  });

  it("keeps bot replies out of live-support admin unread counters", async () => {
    const { sendMessage } = await import("./chatUtils");

    await sendMessage("student-1", "Bot reply", "bot", "AI Assistant", false, undefined, "bot");

    const updateData = setDocMock.mock.calls[0][1];
    expect(updateData.lastMessage).toBe("Bot reply");
    expect(updateData).not.toHaveProperty("adminUnreadCount");
    expect(updateData).not.toHaveProperty("userId");
    expect(updateData).not.toHaveProperty("userName");
  });

  it("tracks live-support user messages against the support session", async () => {
    const { sendMessage } = await import("./chatUtils");

    await sendMessage(
      "student-1_support",
      "Need help",
      "student-1",
      "Student",
      false,
      undefined,
      "live",
      undefined,
      undefined,
      "https://example.com/avatar.png"
    );

    const updateData = setDocMock.mock.calls[0][1];
    expect(updateData.adminUnreadCount).toEqual({ __increment: 1 });
    expect(updateData.userId).toBe("student-1_support");
    expect(updateData.userName).toBe("Student");
    expect(updateData.userImage).toBe("https://example.com/avatar.png");
  });
});
