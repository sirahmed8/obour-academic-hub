import { beforeEach, describe, expect, it, vi } from "vitest";

const configMock = vi.fn();
const uploadStreamMock = vi.fn();
const getRequestContextMock = vi.fn();
const handleRouteErrorMock = vi.fn();
const rateLimitMock = vi.fn();
const withCorsMock = vi.fn((request: Request, response: Response) => {
  void request;
  return response;
});
const corsOptionsMock = vi.fn((request: Request) => {
  void request;
  return new Response(null, { status: 204 });
});

vi.mock("cloudinary", () => ({
  v2: {
    config: configMock,
    uploader: {
      upload_stream: uploadStreamMock,
    },
  },
}));

vi.mock("@/lib/server/cors", () => ({
  corsOptions: corsOptionsMock,
  withCors: withCorsMock,
}));

vi.mock("@/lib/server/auth", () => ({
  getRequestContext: getRequestContextMock,
  handleRouteError: handleRouteErrorMock,
}));

vi.mock("@/lib/server/rate-limit", () => ({
  rateLimit: rateLimitMock,
}));

describe("POST /api/upload", () => {
  const createUploadRequest = (
    file?: {
      name: string;
      size: number;
      type: string;
      arrayBuffer: () => Promise<ArrayBuffer>;
    } | null,
    headers?: HeadersInit
  ) =>
    ({
      headers: new Headers(headers),
      url: "http://localhost/api/upload",
      formData: async () => {
        return {
          get: (key: string) => (key === "file" ? (file ?? null) : null),
        };
      },
    }) as unknown as Request;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();

    getRequestContextMock.mockResolvedValue({
      uid: "student-1",
    });
    rateLimitMock.mockReturnValue({
      allowed: true,
      remaining: 9,
      retryAfterMs: 60_000,
    });
    handleRouteErrorMock.mockImplementation((request: Request, error: unknown) => {
      void request;
      const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof error.status === "number"
          ? error.status
          : 500;
      const message =
        error instanceof Error ? error.message : status === 401 ? "Unauthorized" : "Unknown error";

      return Response.json({ error: message }, { status });
    });
    uploadStreamMock.mockImplementation(
      (
        _options: Record<string, unknown>,
        callback: (error: Error | null, result?: { secure_url: string; bytes: number }) => void
      ) => ({
        end: vi.fn(() => {
          callback(null, {
            secure_url: "https://res.cloudinary.com/demo/image/upload/sample.png",
            bytes: 1024,
          });
        }),
      })
    );
  });

  it("returns 401 when authentication fails", async () => {
    getRequestContextMock.mockRejectedValueOnce(
      Object.assign(new Error("Unauthorized"), { status: 401 })
    );
    const { POST } = await import("./route");

    const response = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        body: new FormData(),
      })
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(rateLimitMock).not.toHaveBeenCalled();
  });

  it("returns 429 when the upload rate limit is exceeded", async () => {
    rateLimitMock.mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      retryAfterMs: 15_000,
    });
    const { POST } = await import("./route");

    const formData = new FormData();
    formData.append("file", new File(["hello"], "notes.txt", { type: "text/plain" }));

    const response = await POST(
      createUploadRequest(
        {
          name: "notes.txt",
          size: 5,
          type: "text/plain",
          arrayBuffer: async () => new TextEncoder().encode("hello").buffer,
        },
        {
          authorization: "Bearer token",
        }
      )
    );

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("15");
    expect(await response.json()).toEqual({
      error: "Too many upload attempts. Please try again shortly.",
    });
  });

  it("rejects unsupported mime types before reaching Cloudinary", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      createUploadRequest(
        {
          name: "archive.zip",
          size: 6,
          type: "application/zip",
          arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
        },
        {
          authorization: "Bearer token",
        }
      )
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Unsupported file type" });
    expect(uploadStreamMock).not.toHaveBeenCalled();
  });

  it("uploads supported files to Cloudinary with the expected folder and resource type", async () => {
    const { POST } = await import("./route");

    const response = await POST(
      createUploadRequest(
        {
          name: "avatar.png",
          size: 11,
          type: "image/png",
          arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer,
        },
        {
          authorization: "Bearer token",
        }
      )
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      url: "https://res.cloudinary.com/demo/image/upload/sample.png",
      name: "avatar.png",
      size: 1024,
      type: "image",
    });
    expect(uploadStreamMock).toHaveBeenCalledWith(
      {
        folder: "chatbot-uploads/student-1",
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
      },
      expect.any(Function)
    );
  });
});
