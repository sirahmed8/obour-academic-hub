import { NextResponse } from "next/server";
import {
  adminDb,
  Timestamp,
  getAdminApp,
  getAdminAuth,
  getAdminDb,
} from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import { getRequestContext, handleRouteError, syncCustomClaims } from "@/lib/server/auth";
import { logServerInfo, logServerError, logServerWarning } from "@/lib/server/error-sanitizer";
import { rateLimit } from "@/lib/server/rate-limit";
import { DEFAULT_ADMIN_PERMISSIONS } from "@/lib/constants";
// import { updatePlatformStats } from "@/lib/server/stats";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function GET(request: Request) {
  const diagnostics: Record<string, unknown> = {};

  try {
    const saEnv = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.SERVICE_ACCOUNT_KEY || "";
    diagnostics.saEnvExists = saEnv.length > 0;
    diagnostics.saEnvLength = saEnv.length;
    diagnostics.saEnvStartsWith = saEnv.trim().substring(0, 5);
    diagnostics.saEnvEndsWith = saEnv.trim().substring(Math.max(0, saEnv.trim().length - 5));

    // Test initialization
    try {
      const app = getAdminApp();
      diagnostics.appInitialized = !!app;
      diagnostics.appName = app ? app.name : null;
    } catch (appErr) {
      diagnostics.appInitError = appErr instanceof Error ? appErr.message : String(appErr);
    }

    try {
      const authInstance = getAdminAuth();
      diagnostics.authInitialized = !!authInstance;
    } catch (authErr) {
      diagnostics.authInitError = authErr instanceof Error ? authErr.message : String(authErr);
    }

    try {
      const dbInstance = getAdminDb();
      diagnostics.dbInitialized = !!dbInstance;
      const testRef = dbInstance.collection("test-conn").doc("test");
      diagnostics.dbRefCreated = !!testRef;
    } catch (dbErr) {
      diagnostics.dbInitError = dbErr instanceof Error ? dbErr.message : String(dbErr);
    }
  } catch (err) {
    diagnostics.globalError = err instanceof Error ? err.message : String(err);
  }

  return withCors(
    request,
    NextResponse.json({
      status: "alive",
      runtime: "nodejs",
      timestamp: new Date().toISOString(),
      diagnostics,
    })
  );
}

export async function POST(request: Request) {
  const corsJson = (body: unknown, init?: ResponseInit) =>
    withCors(request, NextResponse.json(body, init));

  try {
    const context = await getRequestContext(request, { allowMissingProfile: true });

    if (!context.uid) {
      logServerWarning("Bootstrap authentication failed: missing UID", {
        route: "/api/auth/bootstrap",
      });
      return corsJson({ error: "Authentication failed" }, { status: 401 });
    }

    const limiter = await rateLimit({
      key: `api:auth:bootstrap:${context.uid}`,
      limit: 10,
      windowMs: 60_000,
    });

    if (!limiter.allowed) {
      return corsJson(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)),
          },
        }
      );
    }

    logServerInfo("User bootstrap process started", {
      route: "/api/auth/bootstrap",
      userId: context.uid,
    });

    // Check if user document exists
    const userDoc = await adminDb.collection("users").doc(context.uid).get();
    const existingData = userDoc.exists ? userDoc.data() : null;

    const role = existingData?.role || "student";
    let permissions = existingData?.permissions || [];
    const isNewUser = !userDoc.exists;

    // Apply default permissions if a new user or missing permissions
    if (isNewUser || permissions.length === 0) {
      if (role === "admin") {
        permissions = DEFAULT_ADMIN_PERMISSIONS;
      } else {
        permissions = ["view_resources"];
      }
    }

    // Ensure custom claims are synced
    try {
      await syncCustomClaims(context.uid, role, permissions);
    } catch (claimError) {
      logServerError("Failed to sync custom claims during bootstrap", claimError, {
        userId: context.uid,
      });
    }

    // Prepare profile documentation
    const nowTimestamp = Timestamp.now();
    const userPayload = {
      uid: context.uid,
      email: context.email,
      displayName: context.decodedToken.name || context.email.split("@")[0],
      photoURL: context.decodedToken.picture || "",
      role,
      permissions,
      lastLogin: nowTimestamp,
      lastLoginAt: nowTimestamp,
      status: "online",
      ...(isNewUser && {
        createdAt: nowTimestamp,
        onboardingCompleted: false,
      }),
    };

    // Save/Update user in Firestore
    try {
      await adminDb.collection("users").doc(context.uid).set(userPayload, { merge: true });

      logServerInfo("User document saved successfully", {
        userId: context.uid,
      });
    } catch (dbError) {
      logServerError("Failed to save user data during bootstrap", dbError, {
        userId: context.uid,
      });
      // Continue anyway, as claims are synced and UI might still work
    }

    return corsJson({
      status: "success",
      profile: {
        ...userPayload,
        lastLogin: userPayload.lastLogin.toDate().toISOString(),
        lastLoginAt: userPayload.lastLoginAt.toDate().toISOString(),
        createdAt: isNewUser
          ? userPayload.createdAt?.toDate().toISOString()
          : existingData?.createdAt?.toDate
            ? existingData.createdAt.toDate().toISOString()
            : existingData?.createdAt
              ? new Date(existingData.createdAt).toISOString()
              : nowTimestamp.toDate().toISOString(),
      },
      isNewUser,
    });
  } catch (error) {
    return handleRouteError(request, error);
  }
}
