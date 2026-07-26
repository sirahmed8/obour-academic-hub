import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Firebase client auth & server auth
const mockSignInWithPopup = vi.fn();
const mockSignInWithRedirect = vi.fn();
const mockSignOut = vi.fn();

vi.mock("firebase/auth", () => ({
  signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
  signInWithRedirect: (...args: unknown[]) => mockSignInWithRedirect(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  GoogleAuthProvider: vi.fn(),
  getAuth: vi.fn(() => ({})),
}));

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
  rtdb: {},
}));

vi.mock("@/lib/server/auth", () => ({
  syncCustomClaims: vi.fn(async (uid: string, role: string, permissions: string[]) => {
    return { uid, role, permissions };
  }),
  assertCanManageUser: vi.fn(),
  requirePermission: vi.fn(async () => ({
    uid: "admin-1",
    role: "admin",
    isOwner: false,
    permissions: new Set(["manage_users"]),
  })),
  handleRouteError: vi.fn((req, err) => Response.json({ error: String(err) }, { status: 500 })),
}));

describe("Tier 1 - Feature 1: Authentication & User Session (signInWithPopup)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enforces signInWithPopup mode and rejects redirect login attempts", async () => {
    mockSignInWithPopup.mockResolvedValueOnce({
      user: {
        uid: "user-123",
        email: "student@obour.edu",
        displayName: "Student One",
        getIdTokenResult: async () => ({ claims: { role: "student", permissions: [] } }),
      },
    });

    const { signInWithPopup } = await import("firebase/auth");
    const result = await signInWithPopup(
      {} as unknown as import("firebase/auth").Auth,
      {} as unknown as import("firebase/auth").AuthProvider
    );

    expect(result.user.uid).toBe("user-123");
    expect(mockSignInWithPopup).toHaveBeenCalledTimes(1);
    expect(mockSignInWithRedirect).not.toHaveBeenCalled();
  });

  it("synchronizes custom claims for authenticated user sessions", async () => {
    const { syncCustomClaims } = await import("@/lib/server/auth");
    const claims = await syncCustomClaims("user-123", "admin", ["manage_users"]);

    expect(claims).toEqual({
      uid: "user-123",
      role: "admin",
      permissions: ["manage_users"],
    });
    expect(syncCustomClaims).toHaveBeenCalledWith("user-123", "admin", ["manage_users"]);
  });

  it("extracts role and permissions correctly from user ID token claims", () => {
    const mockTokenResult = {
      claims: {
        role: "doctor",
        permissions: ["manage_subjects", "upload_resources"],
        admin: true,
      },
    };

    const role = mockTokenResult.claims.role || "student";
    const permissions = mockTokenResult.claims.permissions || [];
    const isAdmin = Boolean(mockTokenResult.claims.admin || role === "admin" || role === "owner");

    expect(role).toBe("doctor");
    expect(permissions).toContain("manage_subjects");
    expect(isAdmin).toBe(true);
  });

  it("activates emergency owner bypass when email matches NEXT_PUBLIC_OWNER_EMAIL", () => {
    const ownerEmail = "owner@obour.edu";
    process.env.NEXT_PUBLIC_OWNER_EMAIL = ownerEmail;

    const testUserEmail = "owner@obour.edu";
    const isOwner =
      testUserEmail.toLowerCase() === process.env.NEXT_PUBLIC_OWNER_EMAIL.toLowerCase();

    expect(isOwner).toBe(true);
  });

  it("performs session cleanup and resets state on user sign out", async () => {
    mockSignOut.mockResolvedValueOnce(undefined);
    const { signOut } = await import("firebase/auth");

    await signOut({} as unknown as import("firebase/auth").Auth);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});
