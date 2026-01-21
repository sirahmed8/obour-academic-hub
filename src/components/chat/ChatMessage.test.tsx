import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatMessageItem } from "./ChatMessage";
import { ChatMessage, User } from "@/types";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

// Mock ReactMarkdown
vi.mock("react-markdown", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock FileAttachmentDisplay
vi.mock("@/components/features/FileUpload", () => ({
  FileAttachmentDisplay: () => <div>Attachment</div>,
}));

describe("ChatMessageItem Accessibility", () => {
  const mockUser: User = {
    uid: "user1",
    email: "user@example.com",
    displayName: "Test User",
    role: "student",
    photoURL: "https://example.com/photo.jpg",
    preferences: { theme: "light", language: "en", notifications: true },
  };

  const mockMessage: ChatMessage = {
    id: "msg1",
    text: "Hello world",
    senderId: "user1",
    senderName: "Test User",
    timestamp: { seconds: 1234567890, nanoseconds: 0 },
    isDeleted: false,
    reactions: {},
  };

  it("renders action buttons with focus-visible styles", () => {
    render(
      <ChatMessageItem
        message={mockMessage}
        user={mockUser}
        isUser={true}
        onReply={vi.fn()}
        onReact={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // Find the action buttons
    const replyButton = screen.getByTitle("Reply");
    const reactButton = screen.getByTitle("React");
    const deleteButton = screen.getByTitle("Delete");

    // Check for focus-visible styles
    expect(replyButton.className).toContain("focus-visible:ring-2");
    expect(reactButton.className).toContain("focus-visible:ring-2");
    expect(deleteButton.className).toContain("focus-visible:ring-2");
  });

  it("renders actions container with focus-within:opacity-100", () => {
    const { container } = render(
      <ChatMessageItem
        message={mockMessage}
        user={mockUser}
        isUser={true}
        onReply={vi.fn()}
        onReact={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    // The actions container has the opacity class.
    // We can search by class or structure.
    // It's the container that wraps the buttons.
    const replyButton = screen.getByTitle("Reply");
    const actionsContainer = replyButton.closest("div.absolute");

    expect(actionsContainer).not.toBeNull();
    expect(actionsContainer?.className).toContain("lg:focus-within:opacity-100");
  });
});
