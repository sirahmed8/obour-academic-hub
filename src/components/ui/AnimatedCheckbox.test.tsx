import { render, screen } from "@testing-library/react";
import { AnimatedCheckbox } from "./AnimatedCheckbox";
import { describe, it, expect, vi } from "vitest";
import React from "react";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    button: ({ children, whileTap, initial, animate, transition, ...props }: React.ComponentProps<"button"> & { whileTap?: unknown; initial?: unknown; animate?: unknown; transition?: unknown }) => <button {...props}>{children}</button>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    div: ({ children, initial, animate, transition, exit, ...props }: React.ComponentProps<"div"> & { initial?: unknown; animate?: unknown; transition?: unknown; exit?: unknown }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("AnimatedCheckbox", () => {
  it("renders with aria-label", () => {
    render(
      <AnimatedCheckbox
        checked={false}
        onChange={() => {}}
        aria-label="Test Label"
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-label", "Test Label");
  });

  it("renders with aria-labelledby", () => {
    render(
      <>
        <label id="test-label">Label Text</label>
        <AnimatedCheckbox
          checked={false}
          onChange={() => {}}
          aria-labelledby="test-label"
        />
      </>
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-labelledby", "test-label");
  });
});
