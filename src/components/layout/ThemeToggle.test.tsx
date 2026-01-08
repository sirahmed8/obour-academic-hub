import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeToggle } from "./ThemeToggle";

// Mock hooks
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

vi.mock("@/contexts", () => ({
  useLanguage: () => ({
    t: (key: string) => key,
  }),
}));

describe("ThemeToggle Layout Component", () => {
  it("renders radio buttons", () => {
    render(<ThemeToggle />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("has accessibility attributes", () => {
    render(<ThemeToggle />);

    // Check for radio group role
    const group = screen.getByRole("radiogroup");
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("aria-labelledby", "theme-label");

    // Check for label id
    const label = screen.getByText("profile.theme");
    expect(label).toHaveAttribute("id", "theme-label");

    // Check for radio roles on buttons
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);

    // Check for checked state (mocked theme is 'light')
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(radios[1]).toHaveAttribute("aria-checked", "false");
    expect(radios[2]).toHaveAttribute("aria-checked", "false");

    // Check for aria-labels
    expect(radios[0]).toHaveAttribute("aria-label", "profile.lightMode");
  });
});
