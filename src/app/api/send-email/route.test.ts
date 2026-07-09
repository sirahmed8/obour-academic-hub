import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMailMock = vi.fn();
const verifyMock = vi.fn();
const transporterMock = {
  sendMail: sendMailMock,
  verify: verifyMock,
};

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => transporterMock),
  },
}));

const rateLimitMock = vi.fn();
vi.mock("@/lib/server/rate-limit", () => ({
  rateLimit: rateLimitMock,
}));

const requireOwnerMock = vi.fn();
const handleRouteErrorMock = vi.fn();
const withCorsMock = vi.fn((request: Request, response: Response) => {
  void request;
  return response;
});
const corsOptionsMock = vi.fn((request: Request) => {
  void request;
  return new Response(null, { status: 204 });
});

vi.mock("@/lib/server/cors", () => ({
  corsOptions: corsOptionsMock,
  withCors: withCorsMock,
}));

vi.mock("@/lib/server/auth", () => ({
  handleRouteError: handleRouteErrorMock,
  requireOwner: requireOwnerMock,
}));

vi.mock("@/lib/server/error-sanitizer", () => ({
  logServerError: vi.fn(),
  logServerInfo: vi.fn(),
  logServerWarning: vi.fn(),
}));

describe("POST /api/send-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.SMTP_HOST = "smtp.test.com";
    process.env.SMTP_USER = "user@test.com";
    process.env.SMTP_PASS = "pass123";
    process.env.SMTP_PORT = "587";

    requireOwnerMock.mockResolvedValue({ uid: "owner-1", email: "owner@test.com" });
    rateLimitMock.mockResolvedValue({ allowed: true });
    verifyMock.mockResolvedValue(true);
    sendMailMock.mockResolvedValue({ messageId: "msg_123" });
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      void request;
      return Response.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
      );
    });
  });

  it("sends email successfully when request and SMTP are valid", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/send-email", {
        method: "POST",
        body: JSON.stringify({
          to: "recipient@test.com",
          subject: "Test Subject",
          html: "<p>Test Content</p>",
        }),
      })
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, messageId: "msg_123" });
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "recipient@test.com",
        subject: "Test Subject",
        html: "<p>Test Content</p>",
      })
    );
  });

  it("fails if rate limited", async () => {
    rateLimitMock.mockResolvedValue({ allowed: false, retryAfterMs: 30000 });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/send-email", {
        method: "POST",
        body: JSON.stringify({
          to: "recipient@test.com",
          subject: "Test Subject",
          html: "<p>Test Content</p>",
        }),
      })
    );

    expect(response.status).toBe(429);
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("fails if payload validation fails", async () => {
    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/send-email", {
        method: "POST",
        body: JSON.stringify({
          to: "invalid-email",
          subject: "",
          html: "",
        }),
      })
    );

    expect(response.status).toBe(400);
    expect(sendMailMock).not.toHaveBeenCalled();
  });
});
