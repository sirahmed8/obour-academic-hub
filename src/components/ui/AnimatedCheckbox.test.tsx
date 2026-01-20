import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AnimatedCheckbox } from "./AnimatedCheckbox";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    // Filter out motion-specific props so they don't reach the DOM element
    button: ({
      children,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      whileTap: _whileTap,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      initial: _initial,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      animate: _animate,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      transition: _transition,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      exit: _exit,
      ...props
    }: React.ComponentProps<"button"> & {
      whileTap?: unknown;
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
      exit?: unknown;
    }) => <button {...props}>{children}</button>,
    div: ({
      children,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      initial: _initial,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      animate: _animate,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      transition: _transition,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      exit: _exit,
      ...props
    }: React.ComponentProps<"div"> & {
      initial?: unknown;
      animate?: unknown;
      transition?: unknown;
      exit?: unknown;
    }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Check: () => <div data-testid="check-icon" />,
}));

describe("AnimatedCheckbox", () => {
  it("renders with aria-label", () => {
    render(<AnimatedCheckbox checked={false} onChange={() => {}} aria-label="Test Label" />);
    const button = screen.getByRole("checkbox");
    expect(button).toHaveAttribute("aria-label", "Test Label");
  });

  it("renders with aria-labelledby", () => {
    render(
      <>
        <span id="test-label">Visible Label</span>
        <AnimatedCheckbox checked={false} onChange={() => {}} aria-labelledby="test-label" />
      </>
    );
    const button = screen.getByRole("checkbox");
    expect(button).toHaveAttribute("aria-labelledby", "test-label");
  });

  it("reflects checked state in aria-checked", () => {
    render(<AnimatedCheckbox checked={true} onChange={() => {}} />);
    const button = screen.getByRole("checkbox");
    expect(button).toHaveAttribute("aria-checked", "true");
  });

  it("reflects unchecked state in aria-checked", () => {
    render(<AnimatedCheckbox checked={false} onChange={() => {}} />);
    const button = screen.getByRole("checkbox");
    expect(button).toHaveAttribute("aria-checked", "false");
  });
});
