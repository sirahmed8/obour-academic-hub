/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminTeamPage from "./page";
import { useAuth, useLanguage } from "@/contexts";
import { apiFetch } from "@/lib/api-client";
import { userService } from "@/services/user.service";
import { act } from "react";

// Mock the contexts
vi.mock("@/contexts", () => ({
  useAuth: vi.fn(),
  useLanguage: vi.fn(),
  useSolidMode: vi.fn(() => ({ isSolid: false })),
}));

// Mock firebase
vi.mock("@/lib/firebase", () => ({
  db: { mockDb: true },
  rtdb: { mockRtdb: true },
  auth: { mockAuth: true },
}));

// Mock firestore
let callbacks: any[] = [];
vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn((q, callback) => {
    callbacks.push(callback);
    return vi.fn(); // Unsubscribe function
  }),
}));

// Mock api client
vi.mock("@/lib/api-client", () => ({
  apiFetch: vi.fn(),
}));

// Mock user service
vi.mock("@/services/user.service", () => ({
  userService: {
    update: vi.fn(),
  },
}));

// Mock framer-motion to prevent animation delays/issues
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    path: (props: any) => <path {...props} />,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

// Mock image component
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("AdminTeamPage", () => {
  const mockT = vi.fn((key: string) => key);

  beforeEach(() => {
    vi.clearAllMocks();
    callbacks = [];

    // Set up default language context
    (useLanguage as any).mockReturnValue({
      language: "en",
      t: mockT,
      dir: "ltr",
    });
  });

  const triggerSnapshots = (whitelistDocs: any[] = [], userDocs: any[] = []) => {
    act(() => {
      // 1st is whitelist callback
      if (callbacks[0]) {
        callbacks[0]({
          docs: whitelistDocs.map((d) => ({
            id: d.email,
            data: () => ({ addedBy: d.addedBy, addedAt: d.addedAt }),
          })),
        });
      }
      // 2nd is users callback
      if (callbacks[1]) {
        callbacks[1]({
          docs: userDocs.map((u) => ({
            id: u.uid || "uid",
            data: () => u,
          })),
        });
      }
    });
  };

  it("renders access denied when user is not an admin", () => {
    (useAuth as any).mockReturnValue({
      user: { email: "student@example.com", role: "student" },
      isAdmin: false,
      isOwner: false,
    });

    render(<AdminTeamPage />);
    expect(screen.getByText("Access Denied")).toBeInTheDocument();
  });

  it("renders team management and listens to snapshot updates when user is admin", async () => {
    (useAuth as any).mockReturnValue({
      user: { email: "admin@example.com", role: "admin" },
      isAdmin: true,
      isOwner: false,
    });

    render(<AdminTeamPage />);

    // Trigger loading resolution
    triggerSnapshots(
      [{ email: "whitelisted-admin@example.com", addedBy: "owner@example.com", addedAt: "now" }],
      [
        {
          email: "whitelisted-admin@example.com",
          displayName: "Test Admin",
          role: "admin",
          permissions: ["manage_subjects"],
          uid: "actual-admin-uid",
        },
      ]
    );

    expect(screen.getByText("Team Management")).toBeInTheDocument();

    // Check if the team members are rendered
    await waitFor(() => {
      expect(screen.getByText("Test Admin")).toBeInTheDocument();
      expect(screen.getByText("whitelisted-admin@example.com")).toBeInTheDocument();
      // Hardcoded owner should also be in the list
      expect(screen.getByText("a7medorabe7@gmail.com")).toBeInTheDocument();
    });
  });

  it("allows owner to add new admin users", async () => {
    (useAuth as any).mockReturnValue({
      user: { email: "a7medorabe7@gmail.com", role: "owner" },
      isAdmin: true,
      isOwner: true,
    });

    render(<AdminTeamPage />);
    triggerSnapshots([], []);

    // Check for "Add New Admin or Moderator" section
    expect(screen.getByText("Add New Admin or Moderator")).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText("Enter email...");
    const addButton = screen.getByText("Add");

    // Type email
    fireEvent.change(emailInput, { target: { value: "newadmin@example.com" } });

    // Mock API response
    (apiFetch as any).mockResolvedValueOnce({ ok: true });

    // Click Add
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        "/api/admin/whitelist/newadmin%40example.com",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({
            role: "admin",
            permissions: [],
          }),
        })
      );
    });
  });

  it("allows owner to remove admin users", async () => {
    (useAuth as any).mockReturnValue({
      user: { email: "a7medorabe7@gmail.com", role: "owner" },
      isAdmin: true,
      isOwner: true,
    });

    render(<AdminTeamPage />);

    // Populate team members
    triggerSnapshots(
      [{ email: "whitelisted-admin@example.com", addedBy: "owner@example.com", addedAt: "now" }],
      [
        {
          email: "whitelisted-admin@example.com",
          displayName: "Test Admin",
          role: "admin",
          permissions: [],
          uid: "actual-admin-uid",
        },
      ]
    );

    await waitFor(() => {
      expect(screen.getByText("Test Admin")).toBeInTheDocument();
    });

    // Get remove button (Trash2 icon wrapper)
    const removeButtons = screen.getAllByTitle("Remove");
    expect(removeButtons.length).toBe(1);

    // Click remove
    fireEvent.click(removeButtons[0]);

    // Check for confirmation modal message
    expect(
      screen.getByText(/Are you sure you want to remove whitelisted-admin@example.com/)
    ).toBeInTheDocument();

    // Confirm remove
    (apiFetch as any).mockResolvedValueOnce({ ok: true });
    const confirmButton = screen.getByText("Remove");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        "/api/admin/whitelist/whitelisted-admin%40example.com?uid=actual-admin-uid",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });

  it("allows owner to edit user permissions", async () => {
    (useAuth as any).mockReturnValue({
      user: { email: "a7medorabe7@gmail.com", role: "owner" },
      isAdmin: true,
      isOwner: true,
    });

    render(<AdminTeamPage />);

    // Populate team members
    triggerSnapshots(
      [],
      [
        {
          email: "whitelisted-admin@example.com",
          displayName: "Test Admin",
          role: "admin",
          permissions: ["manage_subjects"],
          uid: "actual-admin-uid",
        },
      ]
    );

    await waitFor(() => {
      expect(screen.getByText("Test Admin")).toBeInTheDocument();
    });

    // Get edit button (Settings icon wrapper)
    const editButtons = screen.getAllByTitle("Edit Permissions");
    expect(editButtons.length).toBe(1);

    // Click edit to open the modal
    fireEvent.click(editButtons[0]);

    // The modal should be open and display the user name
    expect(screen.getByDisplayValue("Test Admin")).toBeInTheDocument();

    // Change name or select/deselect permission (let's check saving)
    const saveButton = screen.getByText("Save");

    (userService.update as any).mockResolvedValueOnce(undefined);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(userService.update).toHaveBeenCalledWith("actual-admin-uid", {
        displayName: "Test Admin",
        studentCode: "",
        permissions: ["manage_subjects"],
      });
    });
  });
});
