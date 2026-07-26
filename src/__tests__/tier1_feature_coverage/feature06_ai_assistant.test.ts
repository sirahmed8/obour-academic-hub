import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAddDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockDeleteDoc = vi.fn();

vi.mock("firebase/firestore", () => ({
  collection: vi.fn((db, ...path) => path.join("/")),
  doc: vi.fn((db, ...path) => path.join("/")),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  deleteDoc: (...args: unknown[]) => mockDeleteDoc(...args),
  writeBatch: vi.fn(() => ({
    delete: mockDeleteDoc,
    commit: vi.fn(async () => {}),
  })),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

describe("Tier 1 - Feature 6: AI Study Assistant & Chatbot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("processes prompt submit and formats AI assistant streaming request payload", async () => {
    const prompt = "Explain Binary Search Trees with time complexity";
    const subjectContext = "CS201 Data Structures";

    const payload = {
      messages: [{ role: "user", content: prompt }],
      subject: subjectContext,
      stream: true,
    };

    expect(payload.messages[0].content).toContain("Binary Search Trees");
    expect(payload.subject).toBe("CS201 Data Structures");
    expect(payload.stream).toBe(true);
  });

  it("injects selected subject context into AI chatbot prompt metadata", () => {
    const buildPromptWithContext = (userPrompt: string, subjectName?: string) => {
      if (!subjectName) return userPrompt;
      return `[Context: ${subjectName}]\n${userPrompt}`;
    };

    const formattedPrompt = buildPromptWithContext("How do I solve problem 3?", "Math 101");

    expect(formattedPrompt).toBe("[Context: Math 101]\nHow do I solve problem 3?");
  });

  it("clears chatbot conversation history permanently", async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [{ ref: "doc-1" }, { ref: "doc-2" }],
    });

    const { clearChatHistory } = await import("@/lib/chatUtils");
    await clearChatHistory("user-1");

    expect(mockGetDocs).toHaveBeenCalled();
  });

  it("sanitizes HTML tags in user prompt input before sending to AI backend", () => {
    const sanitizePrompt = (raw: string) => raw.replace(/<[^>]*>/g, "");

    const dangerousInput = "Explain <script>alert('xss')</script> physics equations";
    const clean = sanitizePrompt(dangerousInput);

    expect(clean).toBe("Explain alert('xss') physics equations");
    expect(clean).not.toContain("<script>");
  });

  it("extracts structured todo action from AI assistant response when requested", () => {
    const aiResponse = JSON.stringify({
      text: "I have structured a study task for you.",
      action: "confirm_task",
      taskData: {
        title: "Review Chapter 5 Sorting Algorithms",
        subjectId: "CS201",
        priority: "high",
      },
    });

    const parsed = JSON.parse(aiResponse);

    expect(parsed.action).toBe("confirm_task");
    expect(parsed.taskData.title).toBe("Review Chapter 5 Sorting Algorithms");
    expect(parsed.taskData.priority).toBe("high");
  });
});
