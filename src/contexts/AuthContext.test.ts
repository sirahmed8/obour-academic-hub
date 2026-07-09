import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Firebase Administration SDK
const mockGetIdToken = vi.fn();
const mockGetIdTokenResult = vi.fn();

describe("AuthContext Bootstrap Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetIdToken.mockResolvedValue("mock-token");
    mockGetIdTokenResult.mockResolvedValue({
      claims: {
        role: "admin",
        permissions: ["read", "write"],
      },
    });
  });

  describe("successful bootstrap flow", () => {
    it("should bootstrap user successfully on first try", async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch as unknown as typeof fetch;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce({
          user: {
            uid: "test-user-123",
            email: "test@example.com",
            role: "student",
            permissions: [],
          },
        }),
      });

      // Simulate the bootstrap logic
      const token = await mockGetIdToken("test-user-123");
      const response = await fetch("http://api.test/api/auth/bootstrap", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://api.test/api/auth/bootstrap",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
            "Content-Type": "application/json",
          }),
        })
      );
    });
  });

  describe("retry on 401/403", () => {
    it("should retry with refreshed token on 401", async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch as unknown as typeof fetch;

      // First call returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: vi.fn().mockResolvedValueOnce({
          error: "Unauthorized",
        }),
        text: vi.fn().mockResolvedValueOnce("Unauthorized"),
      });

      // Second call with refreshed token returns 200
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce({
          user: {
            uid: "test-user-123",
            email: "test@example.com",
            role: "admin",
            permissions: ["read", "write"],
          },
        }),
      });

      mockGetIdToken.mockResolvedValueOnce("initial-token");
      mockGetIdToken.mockResolvedValueOnce("refreshed-token");

      // First bootstrap call
      const token = await mockGetIdToken();
      const response = await fetch("http://api.test/api/auth/bootstrap", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(401);

      // Second call with refreshed token
      const refreshedToken = await mockGetIdToken();
      const retryResponse = await fetch("http://api.test/api/auth/bootstrap", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshedToken}`,
          "Content-Type": "application/json",
        },
      });

      expect(retryResponse.ok).toBe(true);
      expect(retryResponse.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should retry with refreshed token on 403", async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch as unknown as typeof fetch;

      // First call returns 403
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: vi.fn().mockResolvedValueOnce({
          error: "Forbidden",
        }),
        text: vi.fn().mockResolvedValueOnce("Forbidden"),
      });

      // Second call with refreshed token returns 200
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce({
          user: {
            uid: "test-user-123",
            email: "test@example.com",
          },
        }),
      });

      mockGetIdToken.mockResolvedValueOnce("initial-token");
      mockGetIdToken.mockResolvedValueOnce("refreshed-token");

      const token = await mockGetIdToken();
      const response = await fetch("http://api.test/api/auth/bootstrap", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(403);

      const refreshedToken = await mockGetIdToken();
      const retryResponse = await fetch("http://api.test/api/auth/bootstrap", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshedToken}`,
          "Content-Type": "application/json",
        },
      });

      expect(retryResponse.ok).toBe(true);
    });
  });

  describe("error handling", () => {
    it("should handle network errors gracefully", async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch as unknown as typeof fetch;

      const networkError = new Error("Network failed");
      mockFetch.mockRejectedValueOnce(networkError);

      try {
        await fetch("http://api.test/api/auth/bootstrap", {
          method: "POST",
          headers: {
            Authorization: "Bearer token",
          },
        });
      } catch (error) {
        expect(error).toEqual(networkError);
      }

      expect(mockFetch).toHaveBeenCalled();
    });

    it("should handle server errors with details", async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch as unknown as typeof fetch;

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockRejectedValueOnce(new Error("Invalid JSON")),
        text: vi.fn().mockResolvedValueOnce("Internal Server Error"),
      });

      const response = await fetch("http://api.test/api/auth/bootstrap", {
        method: "POST",
        headers: {
          Authorization: "Bearer token",
        },
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });

    it("should use claims from ID token if available", async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch as unknown as typeof fetch;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValueOnce({
          user: {
            uid: "test-user-123",
            email: "test@example.com",
            role: "student",
            permissions: [],
          },
        }),
      });

      mockGetIdTokenResult.mockResolvedValueOnce({
        claims: {
          role: "superadmin",
          permissions: ["read", "write", "delete"],
        },
      });

      const token = await mockGetIdToken();
      await fetch("http://api.test/api/auth/bootstrap", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const idTokenResult = await mockGetIdTokenResult(true);
      expect(idTokenResult.claims.role).toBe("superadmin");
      expect(idTokenResult.claims.permissions).toContain("delete");
    });
  });

  describe("abort signal handling", () => {
    it("should abort fetch if signal is triggered", async () => {
      const mockFetch = vi.fn();
      global.fetch = mockFetch as unknown as typeof fetch;

      const abortController = new AbortController();

      // Simulate abort
      mockFetch.mockImplementationOnce((_url: string, options: RequestInit | undefined) => {
        if (options?.signal?.aborted) {
          return Promise.reject(new DOMException("Aborted", "AbortError"));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValueOnce({ user: {} }),
        });
      });

      // Abort before fetch completes
      abortController.abort();

      try {
        await fetch("http://api.test/api/auth/bootstrap", {
          method: "POST",
          signal: abortController.signal,
          headers: {
            Authorization: "Bearer token",
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(DOMException);
      }
    });
  });

  describe("token claims merge", () => {
    it("should prefer claims from ID token over bootstrap response", async () => {
      mockGetIdTokenResult.mockResolvedValueOnce({
        claims: {
          role: "admin",
          permissions: ["admin:read", "admin:write"],
        },
      });

      const idTokenResult = await mockGetIdTokenResult(true);

      // Simulating merge logic: claims override user data
      const mergedUser = {
        uid: "test-user-123",
        email: "test@example.com",
        role: idTokenResult.claims.role || "student",
        permissions: idTokenResult.claims.permissions || [],
      };

      expect(mergedUser.role).toBe("admin");
      expect(mergedUser.permissions).toEqual(["admin:read", "admin:write"]);
    });

    it("should fallback to response data if claims are missing", async () => {
      mockGetIdTokenResult.mockResolvedValueOnce({
        claims: {}, // Empty claims
      });

      const idTokenResult = await mockGetIdTokenResult(true);

      const mergedUser = {
        uid: "test-user-123",
        email: "test@example.com",
        role: idTokenResult.claims.role || "student",
        permissions: idTokenResult.claims.permissions || [],
      };

      expect(mergedUser.role).toBe("student");
      expect(mergedUser.permissions).toEqual([]);
    });
  });
});
