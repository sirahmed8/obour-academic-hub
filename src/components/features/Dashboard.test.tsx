import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Dashboard } from "./Dashboard";

// Mock dependencies
vi.mock("@/contexts", () => ({
  useAuth: vi.fn(() => ({
    user: { displayName: "Test User" },
    isAdmin: false,
  })),
  useLanguage: vi.fn(() => ({
    language: "en",
    t: (key: string) => {
      if (key === "dashboard.greeting") return "Good Morning";
      if (key === "dashboard.bannerTitle") return "Welcome";
      if (key === "dashboard.bannerSubtitle") return "Subtitle";
      if (key === "dashboard.subjects") return "Subjects";
      if (key === "dashboard.noSubjects") return "No subjects found";
      return key;
    },
  })),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn((query, callback) => {
    // Simulate empty data immediately
    callback({
      docs: [],
    });
    return () => {}; // Unsubscribe function
  }),
}));

// Mock Animations to avoid issues in test environment
vi.mock("@/components/ui/Animations", () => ({
  StaggerChildren: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ScaleIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("lottie-react", () => ({
  default: () => <div>Lottie Mock</div>,
  useLottie: () => ({ View: <div>Lottie Mock</div> }),
}));

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the greeting with user name", async () => {
    render(<Dashboard />);

    // Wait for loading state to resolve (though our mock resolves immediately, the component has useEffect)
    await waitFor(() => {
      expect(screen.getByText(/Test/)).toBeInTheDocument();
    });

    // Check for parts of the greeting
    expect(screen.getByText(/Good Morning/)).toBeInTheDocument();
  });
});
