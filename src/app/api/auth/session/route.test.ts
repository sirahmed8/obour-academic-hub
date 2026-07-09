import { beforeEach, describe, expect, it, vi } from "vitest";

const createSessionCookieMock = vi.fn();
const handleRouteErrorMock = vi.fn();
const withCorsMock = vi.fn((request: Request, response: Response) => {
  void request;
  return response;
});
const corsOptionsMock = vi.fn((request: Request) => {
  void request;
  return new Response(null, { status: 204 });
});

vi.mock("@/lib/server/firebase-admin", () => ({
  adminAuth: {
    createSessionCookie: createSessionCookieMock,
  },
}));

vi.mock("@/lib/server/cors", () => ({
  corsOptions: corsOptionsMock,
  withCors: withCorsMock,
}));

vi.mock("@/lib/server/auth", () => ({
  handleRouteError: handleRouteErrorMock,
}));

vi.mock("@/lib/server/error-sanitizer", () => ({
  logServerError: vi.fn(),
  logServerInfo: vi.fn(),
  logServerWarning: vi.fn(),
}));

describe("POST /api/auth/session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    createSessionCookieMock.mockResolvedValue("mock_session_cookie_123");
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      void request;
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    });
  });

  it("fails if Authorization header is missing", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/auth/session", {
        method: "POST",
      })
    );

    expect(response.status).toBe(401);
    expect(createSessionCookieMock).not.toHaveBeenCalled();
  });

  it("creates session cookie successfully when token is valid", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/auth/session", {
        method: "POST",
        headers: {
          authorization: "Bearer valid_id_token",
        },
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "success" });
    expect(createSessionCookieMock).toHaveBeenCalledWith("valid_id_token", expect.any(Object));
  });
});

describe("DELETE /api/auth/session", () => {
  it("deletes session successfully", async () => {
    const { DELETE } = await import("./route");
    const response = await DELETE(
      new Request("http://localhost/api/auth/session", {
        method: "DELETE",
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "success" });
  });
});
