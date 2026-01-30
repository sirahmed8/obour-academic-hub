import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnimatedCheckbox } from "./AnimatedCheckbox";

describe("AnimatedCheckbox", () => {
  it("renders correctly", () => {
    render(<AnimatedCheckbox checked={false} onChange={() => {}} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  it("handles checked state", () => {
    render(<AnimatedCheckbox checked={true} onChange={() => {}} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange when clicked", () => {
    const handleChange = vi.fn();
    render(<AnimatedCheckbox checked={false} onChange={handleChange} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("supports aria-label", () => {
    const label = "Select item";
    render(<AnimatedCheckbox checked={false} onChange={() => {}} aria-label={label} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-label", label);
  });
});
