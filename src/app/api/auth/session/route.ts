import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/server/firebase-admin";
import { logServerError, logServerInfo, logServerWarning } from "@/lib/server/error-sanitizer";
import { withCors, corsOptions } from "@/lib/server/cors";
import { handleRouteError, ApiError } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request) {
  const startTime = Date.now();
  logServerInfo("Session POST started");

  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    logServerInfo("Session request from IP", { ip });

    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      logServerWarning("Missing or invalid Authorization header");
      return withCors(request, NextResponse.json({ error: "Missing token" }, { status: 401 }));
    }

    const { rateLimit } = await import("@/lib/server/rate-limit");
    const limiter = await rateLimit({
      key: `api:auth:session:${ip}`,
      limit: 10,
      windowMs: 60_000,
    });

    if (!limiter.allowed) {
      return withCors(
        request,
        NextResponse.json(
          { error: "Too many requests" },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)),
            },
          }
        )
      );
    }

    const idToken = authHeader.split("Bearer ")[1]?.trim();
    if (!idToken) {
      logServerWarning("Empty Bearer token");
      return withCors(
        request,
        NextResponse.json({ error: "Invalid token format" }, { status: 401 })
      );
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const isProduction = process.env.NODE_ENV === "production";

    logServerInfo("Authentication environment check", {
      hasSA: !!process.env.FIREBASE_SERVICE_ACCOUNT,
      hasProject: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      saLength: (process.env.FIREBASE_SERVICE_ACCOUNT || "").length,
      nodeEnv: process.env.NODE_ENV,
    });

    const auth = adminAuth;
    let sessionCookie: string;

    try {
      logServerInfo("Creating session cookie");
      sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
      logServerInfo("Session cookie created successfully");
    } catch (authError: unknown) {
      // Handle ApiError from the lazy service proxy (e.g., 503 Service Unavailable)
      const isApiError = (err: unknown): err is ApiError =>
        err instanceof ApiError ||
        (!!err &&
          typeof err === "object" &&
          "status" in err &&
          "message" in err &&
          typeof (err as { status: unknown }).status === "number" &&
          typeof (err as { message: unknown }).message === "string");

      if (isApiError(authError)) {
        logServerError("Service error during session creation", authError, {
          status: authError.status,
          message: authError.message,
        });
        return withCors(
          request,
          NextResponse.json(
            {
              error: authError.status === 503 ? "Service unavailable" : "Session creation failed",
              code: authError.status === 503 ? "auth/initialization-error" : "auth/internal-error",
              details: authError.message,
            },
            { status: authError.status }
          )
        );
      }

      const errorObj = authError as { message?: string; code?: string; status?: number };
      const errorStr = errorObj?.message || String(authError);
      const errorCode = errorObj?.code;

      logServerError("Session cookie creation error", authError, {
        message: errorStr,
        code: errorCode,
      });

      // Special handling for expired/invalid tokens
      if (
        errorCode === "auth/argument-error" ||
        errorCode === "auth/id-token-expired" ||
        errorStr.includes("expired")
      ) {
        return withCors(
          request,
          NextResponse.json(
            {
              error: "Invalid or expired token",
              code: errorCode,
              details: "The provided ID token is invalid or has expired.",
            },
            { status: 401 }
          )
        );
      }

      // Detect "unauthenticated" or "insufficient permissions" which usually means missing/invalid SA
      if (
        errorCode === "auth/insufficient-permission" ||
        errorStr.includes("credential") ||
        errorStr.includes("permission")
      ) {
        logServerError("CRITICAL: Firebase Admin credentials issue detected", authError);
        return withCors(
          request,
          NextResponse.json(
            {
              error: "Service unavailable",
              code: "auth/initialization-error",
              details:
                "The server is not properly configured to handle authentication sessions. This usually means the Firebase Service Account is missing or invalid.",
            },
            { status: 503 }
          )
        );
      }

      logServerError("Firebase session cookie creation failed", authError as Error);
      return withCors(
        request,
        NextResponse.json(
          {
            error: "Internal session error",
            details: isProduction
              ? "An unexpected error occurred during session creation."
              : errorStr,
          },
          { status: 500 }
        )
      );
    }

    const response = NextResponse.json({ status: "success" });

    response.cookies.set("__session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: isProduction,
      path: "/",
      sameSite: "lax",
    });

    logServerInfo("Response prepared with cookie", {
      durationMs: Date.now() - startTime,
    });
    return withCors(request, response);
  } catch (error: unknown) {
    return handleRouteError(request, error);
  }
}

export async function DELETE(request: Request) {
  const response = NextResponse.json({ status: "success" });
  response.cookies.set("__session", "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
  return withCors(request, response);
}
