import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfirmationModal } from "./ConfirmationModal";

describe("ConfirmationModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: "Delete Item",
    message: "Are you sure you want to delete this item?",
  };

  it("renders with correct accessibility attributes", () => {
    render(<ConfirmationModal {...defaultProps} />);

    // Check for dialog role
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");

    // Check for labelledby pointing to title
    const title = screen.getByText("Delete Item");
    expect(title).toHaveAttribute("id");
    const titleId = title.getAttribute("id");
    expect(dialog).toHaveAttribute("aria-labelledby", titleId);

    // Check for describedby pointing to message
    const message = screen.getByText("Are you sure you want to delete this item?");
    expect(message).toHaveAttribute("id");
    const messageId = message.getAttribute("id");
    expect(dialog).toHaveAttribute("aria-describedby", messageId);
  });

  it("close button has aria-label", () => {
    render(<ConfirmationModal {...defaultProps} />);
    const closeButton = screen.getByLabelText("Close");
    expect(closeButton).toBeInTheDocument();
  });
});
