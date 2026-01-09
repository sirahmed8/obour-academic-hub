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

    // Check for close button label
    // We look for a button that contains the X icon (or is the close button)
    // The best way to find it is by its accessible name if it exists.
    // If this fails, it means the label is missing.
    const closeButton = screen.getByRole("button", { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });
});
