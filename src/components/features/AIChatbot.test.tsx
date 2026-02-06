
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AIChatbot } from "./AIChatbot";

// Mock dependencies
const mockUser = { uid: "test-uid", displayName: "Test User", photoURL: "http://example.com/photo.jpg" };
vi.mock("@/contexts", () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
  })),
  useLanguage: vi.fn(() => ({ language: "en" })),
  useSolidMode: vi.fn(() => ({ isSolid: false })),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn((query, callback) => {
    // Mock object that satisfies both DocumentSnapshot and QuerySnapshot interfaces loosely
    const mockSnapshot = {
      docs: [], // For QuerySnapshot
      exists: () => true, // For DocumentSnapshot
      data: () => ({ aiEnabled: true, unreadCount: 0 }), // For DocumentSnapshot
    };
    callback(mockSnapshot);
    return () => {}; // unsubscribe
  }),
  doc: vi.fn(),
}));

vi.mock("@/lib/chatUtils", () => ({
  sendMessage: vi.fn(),
  clearChatHistory: vi.fn(),
  toggleReaction: vi.fn(),
  deleteMessage: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock ChatInput to avoid complex rendering and ensure we just test typing
vi.mock("./chatbot/ChatInput", () => ({
  ChatInput: ({
    setInput,
    input,
  }: {
    setInput: (v: string) => void;
    input: string;
  }) => (
    <input
      data-testid="chat-input"
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
  ),
}));

vi.mock("@/components/ui/AnimatedIcon", () => ({
  AnimatedIcon: () => <div data-testid="animated-icon" />,
}));

// Capture props passed to ChatMessages
const chatMessagesProps: Record<string, unknown>[] = [];

vi.mock("./chatbot/ChatMessages", () => ({
  ChatMessages: (props: Record<string, unknown>) => {
    chatMessagesProps.push(props);
    return <div data-testid="chat-messages">Messages List</div>;
  },
}));

describe("AIChatbot Performance", () => {
  beforeEach(() => {
    chatMessagesProps.length = 0;
    vi.clearAllMocks();
  });

  it("should have stable callback props for ChatMessages", async () => {
    render(<AIChatbot />);

    // Open the chatbot
    // The floating button is the only button initially
    const buttons = screen.getAllByRole("button");
    const toggleBtn = buttons[0];
    fireEvent.click(toggleBtn);

    // Wait for chat window to appear
    await waitFor(() => screen.getByTestId("chat-input"));

    // We expect at least one render now
    expect(chatMessagesProps.length).toBeGreaterThan(0);
    // Get the props from the LAST render
    const firstRenderProps = chatMessagesProps[chatMessagesProps.length - 1];

    // Simulate typing
    const input = screen.getByTestId("chat-input");
    fireEvent.change(input, { target: { value: "H" } });

    // Expect another render
    await waitFor(() => {
       expect(chatMessagesProps.length).toBeGreaterThan(1);
    });

    const secondRenderProps = chatMessagesProps[chatMessagesProps.length - 1];

    // onReact is already wrapped in useCallback in the source code
    expect(secondRenderProps.onReact).toBe(firstRenderProps.onReact);

    // onDelete is now wrapped in useCallback, so it should be same
    expect(secondRenderProps.onDelete).toBe(firstRenderProps.onDelete);
  });
});
