import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasswordInput } from "./PasswordInput";

describe("PasswordInput", () => {
  it("renders with password type by default", () => {
    render(<PasswordInput label="Admin Key" placeholder="Enter key..." />);

    const input = screen.getByPlaceholderText("Enter key...");
    expect(input).toHaveAttribute("type", "password");
  });

  it("toggles password visibility when button is clicked", () => {
    render(<PasswordInput label="Secret" placeholder="Secret text" />);

    const input = screen.getByPlaceholderText("Secret text");
    const toggleBtn = screen.getByLabelText("Show password");

    expect(input).toHaveAttribute("type", "password");

    fireEvent.click(toggleBtn);
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Hide password")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Hide password"));
    expect(input).toHaveAttribute("type", "password");
  });

  it("renders error message with role='alert'", () => {
    render(<PasswordInput error="Password is required" />);

    const errorMsg = screen.getByRole("alert");
    expect(errorMsg).toHaveTextContent("Password is required");
  });

  it("supports custom bilingual accessibility labels", () => {
    render(
      <PasswordInput showPasswordLabel="إظهار كلمة المرور" hidePasswordLabel="إخفاء كلمة المرور" />
    );

    const toggleBtn = screen.getByLabelText("إظهار كلمة المرور");
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByLabelText("إخفاء كلمة المرور")).toBeInTheDocument();
  });
});
