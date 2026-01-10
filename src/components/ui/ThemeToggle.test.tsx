import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

describe("ThemeToggle", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("has accessible label", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label");
  });
});
