import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { initializeApp } from "firebase/app";

// Mock Firebase modules
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({ name: "[DEFAULT]" })),
  getApps: vi.fn(() => []),
  getApp: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  getFirestore: vi.fn(),
}));

vi.mock("firebase/storage", () => ({
  getStorage: vi.fn(),
}));

vi.mock("firebase/database", () => ({
  getDatabase: vi.fn(),
}));

vi.mock("firebase/analytics", () => ({
  getAnalytics: vi.fn(),
  isSupported: vi.fn(() => Promise.resolve(false)),
}));

vi.mock("firebase/performance", () => ({
  getPerformance: vi.fn(),
}));

describe("Firebase Configuration Security", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it("should NOT initialize if API Key is missing (Secure behavior)", async () => {
    // Ensure no API key in env
    delete process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    // Import the module
    const { default: app } = await import("./firebase");

    // Should be null because config is missing and we removed hardcoded secrets
    expect(app).toBeNull();
  });

  it("should initialize correctly when env vars are provided", async () => {
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test.firebaseapp.com";
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";

    const { default: app } = await import("./firebase");

    expect(initializeApp).toHaveBeenCalled();
    expect(app).toBeTruthy();
  });
});
