import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AnimatedCheckbox } from "./AnimatedCheckbox";

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
        <label id="test-label">Test Label</label>
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

  it("handles click events", () => {
    const handleChange = vi.fn();
    render(
      <AnimatedCheckbox
        checked={false}
        onChange={handleChange}
        aria-label="Click me"
      />
    );

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
