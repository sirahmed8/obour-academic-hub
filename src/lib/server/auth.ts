import "server-only";

import type { DecodedIdToken } from "firebase-admin/auth";
import type { DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/server/firebase-admin";
import { withCors } from "@/lib/server/cors";
import { logServerError, logServerWarning, sanitizeError } from "@/lib/server/error-sanitizer";
import type { UserPermission, UserRole } from "@/types";

type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  role?: UserRole;
  permissions?: UserPermission[];
  photoURL?: string;
  studentCode?: string;
  createdAt?: unknown;
  lastLogin?: unknown;
  subscriptionTier?: string;
  isVip?: boolean;
};

import { ApiError } from "@/lib/server/api-error";
export { ApiError };

export type RequestContext = {
  decodedToken: DecodedIdToken;
  profile: UserProfile | null;
  uid: string;
  email: string;
  role: UserRole;
  permissions: Set<UserPermission>;
  isOwner: boolean;
};

function getBearerToken(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized");
  }

  return authHeader.slice("Bearer ".length).trim();
}

function getOwnerEmail() {
  const envEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL;
  if (envEmail && envEmail.trim()) {
    return envEmail.trim().toLowerCase();
  }
  // Hardcoded fallback for the primary owner to ensure stability during environment setup
  return "a7medorabe7@gmail.com";
}

function getRole(profile: UserProfile | null, email: string): UserRole {
  const ownerEmail = getOwnerEmail();

  if (ownerEmail && email.toLowerCase() === ownerEmail) {
    return "owner";
  }

  // Treat any "owner" in firestore as "admin" if email doesn't match
  if (profile?.role === "owner") {
    return "admin";
  }

  return profile?.role ?? "student";
}

export async function getRequestContext(
  request: Request,
  options?: { allowMissingProfile?: boolean }
): Promise<RequestContext> {
  const token = getBearerToken(request);
  let decodedToken;
  try {
    const authInstance = adminAuth;
    if (!authInstance || typeof authInstance.verifyIdToken !== "function") {
      logServerError("[AUTH] Firebase Admin Auth service is missing or malformed", {
        hasInstance: !!authInstance,
        type: typeof authInstance?.verifyIdToken,
      });
      throw new ApiError(
        503,
        "Authentication service is currently unavailable. Please check server logs for service account configuration."
      );
    }
    decodedToken = await authInstance.verifyIdToken(token);
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const sanitized = sanitizeError(error);
    logServerError("Token verification failed", error, {
      message: sanitized.message,
      code: sanitized.code,
    });

    // If it's a "service unavailable" type error from Firebase, preserve the 503
    if (
      sanitized.code === "auth/service-unavailable" ||
      sanitized.message.includes("service account")
    ) {
      throw new ApiError(503, "Authentication service is currently unavailable.");
    }

    throw new ApiError(401, "Invalid or expired token");
  }
  const uid = decodedToken.uid;
  const email = decodedToken.email?.trim().toLowerCase();

  if (!email) {
    throw new ApiError(401, "Verified account email is required");
  }

  // Use custom claims for zero-read auth if available
  let role = decodedToken.role as UserRole;
  let permissionsArr = decodedToken.permissions as UserPermission[];
  let profile: UserProfile | null = null;
  let isOwner = false;

  // Force owner role if email matches NEXT_PUBLIC_OWNER_EMAIL or hardcoded primary developer regardless of current claims/profile
  const ownerEmail = getOwnerEmail();
  const primaryDev = "a7medorabe7@gmail.com";

  if (email === primaryDev || (ownerEmail && email === ownerEmail)) {
    role = "owner";
    isOwner = true;
  } else {
    // Fallback to Firestore only if claims are missing
    if (!role || !permissionsArr) {
      try {
        const dbInstance = adminDb;
        if (!dbInstance || typeof dbInstance.collection !== "function") {
          logServerWarning("Firestore DB service is unavailable (falling back to default roles)");
          profile = null;
        } else {
          const profileSnapshot = await dbInstance.collection("users").doc(uid).get();
          profile = profileSnapshot.exists ? (profileSnapshot.data() as UserProfile) : null;
        }
      } catch (dbError) {
        logServerWarning("Firestore profile fetch failed (falling back to default)", {
          uid,
          error: String(dbError),
        });
        profile = null;
      }

      if (!profile && !options?.allowMissingProfile) {
        // In emergency, allow login as student even if profile is missing
        role = "student";
        permissionsArr = [];
      } else {
        role = role || getRole(profile, email);
        permissionsArr = permissionsArr || (profile?.permissions ?? []);
      }
    }
    isOwner = role === "owner";
  }

  const permissions = new Set<UserPermission>(permissionsArr || []);

  return {
    decodedToken,
    profile,
    uid,
    email,
    role,
    permissions,
    isOwner,
  };
}

export async function requirePermission(request: Request, permission: UserPermission) {
  const context = await getRequestContext(request);

  if (context.isOwner || context.permissions.has(permission)) {
    return context;
  }

  throw new ApiError(403, "Forbidden");
}

export async function requireOwner(request: Request) {
  // Allow missing profile for owner in emergency/bootstrap failure
  const context = await getRequestContext(request, { allowMissingProfile: true });

  if (!context.isOwner) {
    throw new ApiError(403, "Forbidden");
  }

  return context;
}

export function assertCanManageUser(
  actor: RequestContext,
  target: Pick<UserProfile, "role" | "uid"> | null
) {
  if (actor.isOwner) {
    return;
  }

  if (!target) {
    throw new ApiError(404, "User not found");
  }

  if (target.uid === actor.uid) {
    throw new ApiError(403, "You cannot change your own role");
  }

  if (actor.role === "admin" && target.role === "student") {
    return;
  }

  throw new ApiError(403, "Forbidden");
}

export function mapDocs<T>(docs: QueryDocumentSnapshot<DocumentData>[]) {
  return docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() }) as T);
}

export async function syncCustomClaims(
  uid: string,
  role: UserRole,
  permissionsArr: UserPermission[]
) {
  try {
    const claims = {
      role,
      permissions: permissionsArr,
    };
    await adminAuth.setCustomUserClaims(uid, claims);
  } catch (error) {
    logServerError("Failed to sync custom claims for user " + uid, error);
    // We don't throw here to avoid failing the whole request,
    // as the next bootstrap will try to sync again if claims are missing.
  }
}

export function handleRouteError(request: Request, error: unknown) {
  if (error instanceof ApiError) {
    return withCors(request, NextResponse.json({ error: error.message }, { status: error.status }));
  }

  const sanitized = sanitizeError(error);
  // Log the full error for better production debugging
  console.error("[API ERROR] Full details:", {
    name: error instanceof Error ? error.name : "Unknown",
    message: sanitized.message,
    code: sanitized.code,
    stack: error instanceof Error ? error.stack : "No stack available",
    error: error,
  });
  logServerError("Unhandled API route error", error as Error);

  // Determine if it's a known initialization-related error
  const isInitError =
    sanitized.message.toLowerCase().includes("service account") ||
    sanitized.message.toLowerCase().includes("credential") ||
    sanitized.code === "auth/invalid-credential" ||
    sanitized.code === "app/invalid-credential";

  return withCors(
    request,
    NextResponse.json(
      {
        error: "Internal server error",
        message: sanitized.message,
        code: sanitized.code,
        hint: isInitError
          ? "Critical: Firebase Admin initialization failed. Please verify FIREBASE_SERVICE_ACCOUNT environment variable is correctly set and reachable."
          : process.env.NODE_ENV === "production"
            ? "Check server logs for details. If this persists, it may be a configuration issue."
            : undefined,
      },
      { status: 500 }
    )
  );
}
