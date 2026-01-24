import { render, screen, fireEvent } from "@testing-library/react";
import { AnimatedCheckbox } from "./AnimatedCheckbox";
import { describe, it, expect, vi } from "vitest";

describe("AnimatedCheckbox", () => {
  it("renders with aria-label", () => {
    render(
      <AnimatedCheckbox
        checked={false}
        onChange={() => {}}
        aria-label="Select item"
      />
    );
    const checkbox = screen.getByRole("checkbox", { name: "Select item" });
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

  it("calls onChange when clicked", () => {
    const onChange = vi.fn();
    render(
      <AnimatedCheckbox
        checked={false}
        onChange={onChange}
        aria-label="Select item"
      />
    );
    const checkbox = screen.getByRole("checkbox", { name: "Select item" });
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("has accessible focus styles class", () => {
    render(
        <AnimatedCheckbox
          checked={false}
          onChange={() => {}}
          aria-label="Select item"
        />
      );
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.className).toContain("focus-visible:ring-2");
  });
});
