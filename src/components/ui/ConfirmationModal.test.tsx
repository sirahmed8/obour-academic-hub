import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("traps focus inside the modal", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <button>Outside Button</button>
        <ConfirmationModal {...defaultProps} />
      </div>
    );

    // Wait for modal to be visible
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    const closeButton = screen.getByLabelText("Close");
    const confirmButton = screen.getByText("Confirm");

    // Manually focus the last element to start the cycle test
    confirmButton.focus();
    expect(document.activeElement).toBe(confirmButton);

    // Tab -> should go to Close button (first focusable element)
    await user.tab();
    expect(document.activeElement).toBe(closeButton);

    // Shift+Tab -> should go back to Confirm button (last focusable element)
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(confirmButton);
  });
});
