import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileMenu } from "./ProfileMenu";
import React from 'react';

// Mock ReactDOM createPortal
vi.mock("react-dom", () => ({
  createPortal: (node: React.ReactNode) => node,
  // add other exports if necessary
}));

// Mock global Notification
global.Notification = {
  requestPermission: vi.fn(),
  permission: "default",
} as unknown as typeof Notification;

// Mock contexts
const mockUser = {
  uid: "123",
  displayName: "Test User",
  email: "test@example.com",
  studentCode: "123456",
  notificationSettings: {
    email: false,
  },
};

const mockLogout = vi.fn();
const mockToggleSolidMode = vi.fn();
const mockSetLanguage = vi.fn();

vi.mock("@/contexts", () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
  useLanguage: () => ({
    language: "en",
    setLanguage: mockSetLanguage,
    t: (key: string) => key,
  }),
  useSolidMode: () => ({
    isSolid: false,
    toggleSolidMode: mockToggleSolidMode,
  }),
}));

// Mock Firebase
vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  updateDoc: vi.fn(),
}));

// Mock Sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock ThemeToggle
vi.mock("./ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe("ProfileMenu", () => {
  it("renders toggles with role=switch", () => {
    render(<ProfileMenu onClose={() => {}} direction="ltr" />);

    const switches = screen.getAllByRole("switch");
    // We expect 3 switches: Solid Mode, Notifications, Email Notifications
    expect(switches).toHaveLength(3);

    // Check Solid Mode Toggle
    const solidSwitch = switches[0];
    expect(solidSwitch).toHaveAttribute("aria-checked", "false");

    // Check Notifications Toggle (default denied/default)
    const notifSwitch = switches[1];
    expect(notifSwitch).toHaveAttribute("aria-checked", "false");

    // Check Email Notifications Toggle (default false in mock)
    const emailSwitch = switches[2];
    expect(emailSwitch).toHaveAttribute("aria-checked", "false");
  });
});
