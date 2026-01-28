import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AnimatedCheckbox } from "./AnimatedCheckbox";

describe("AnimatedCheckbox", () => {
  it("renders correctly with checked state", () => {
    render(<AnimatedCheckbox checked={true} onChange={() => {}} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange when clicked", () => {
    const handleChange = vi.fn();
    render(<AnimatedCheckbox checked={false} onChange={handleChange} />);
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("renders with aria-label", () => {
    render(
      <AnimatedCheckbox
        checked={false}
        onChange={() => {}}
        aria-label="Select User"
      />
    );
    const checkbox = screen.getByRole("checkbox", { name: "Select User" });
    expect(checkbox).toBeInTheDocument();
  });

  it("renders with aria-labelledby", () => {
    render(
      <>
        <span id="label-id">Label Text</span>
        <AnimatedCheckbox
          checked={false}
          onChange={() => {}}
          aria-labelledby="label-id"
        />
      </>
    );
    const checkbox = screen.getByRole("checkbox", { name: "Label Text" });
    expect(checkbox).toBeInTheDocument();
  });
});
