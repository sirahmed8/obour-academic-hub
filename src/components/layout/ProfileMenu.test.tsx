import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileMenu } from "./ProfileMenu";

// Mock dependencies
vi.mock("@/contexts", () => ({
  useAuth: () => ({
    user: {
      uid: "test-uid",
      displayName: "Test User",
      studentCode: "123456",
      email: "test@example.com",
      notificationSettings: { email: false },
    },
    logout: vi.fn(),
  }),
  useLanguage: () => ({
    language: "en",
    setLanguage: vi.fn(),
    t: (key: string) => key,
  }),
  useSolidMode: () => ({
    isSolid: false,
    toggleSolidMode: vi.fn(),
  }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  updateDoc: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("./ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("ProfileMenu Accessibility", () => {
  beforeEach(() => {
    // Mock Notification API
    vi.stubGlobal("Notification", {
      permission: "default",
      requestPermission: vi.fn().mockResolvedValue("granted"),
    });
  });

  it("renders with correct accessibility roles and attributes", () => {
    render(<ProfileMenu onClose={vi.fn()} direction="ltr" />);

    // Check Solid Mode Toggle
    const solidSwitch = screen.getByText("profile.solidMode").closest("button");
    expect(solidSwitch).toBeInTheDocument();
    expect(solidSwitch).toHaveAttribute("role", "switch");
    expect(solidSwitch).toHaveAttribute("aria-checked", "false");

    // Check Notification Toggle (Push)
    const notifButtons = screen.getAllByText("notifications.title");
    const notifSwitch = notifButtons.find((el) => el.closest("button"))?.closest("button");

    expect(notifSwitch).toBeInTheDocument();
    expect(notifSwitch).toHaveAttribute("role", "switch");

    // Check Email Notification Toggle
    const emailSwitch = screen.getByText("Email Notifications").closest("button");
    expect(emailSwitch).toBeInTheDocument();
    expect(emailSwitch).toHaveAttribute("role", "switch");
    expect(emailSwitch).toHaveAttribute("aria-checked", "false");

    // Check Language Buttons
    const enButton = screen.getByText("English").closest("button");
    const arButton = screen.getByText("العربية").closest("button");

    expect(enButton).toBeInTheDocument();
    expect(arButton).toBeInTheDocument();

    expect(enButton).toHaveAttribute("aria-pressed", "true");
    expect(arButton).toHaveAttribute("aria-pressed", "false");
  });
});
