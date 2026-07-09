import { NextResponse } from "next/server";
import { adminDb, Timestamp } from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import { handleRouteError, requireOwner, syncCustomClaims } from "@/lib/server/auth";
import type { UserPermission } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_ADMIN_PERMISSIONS: UserPermission[] = [
  "manage_subjects",
  "manage_resources",
  "send_notifications",
  "manage_announcements",
];

async function syncUserRole(
  email: string,
  role: "admin" | "moderator" | "student",
  customPermissions?: UserPermission[],
  uid?: string
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userDoc: any = null;

  if (uid) {
    const docRef = adminDb.collection("users").doc(uid);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      userDoc = docSnap;
    }
  }

  if (!userDoc) {
    const snapshot = await adminDb.collection("users").where("email", "==", email).limit(1).get();
    userDoc = snapshot.docs[0];
  }

  if (!userDoc) {
    return;
  }

  const permissions =
    role === "admin"
      ? customPermissions || DEFAULT_ADMIN_PERMISSIONS
      : role === "moderator"
        ? customPermissions || []
        : [];

  await userDoc.ref.set(
    {
      role,
      permissions,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );

  await syncCustomClaims(userDoc.id, role, permissions);
}

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function PUT(request: Request, { params }: { params: Promise<{ email: string }> }) {
  try {
    const context = await requireOwner(request);
    const { email } = await params;
    const normalizedEmail = decodeURIComponent(email).trim().toLowerCase();

    // Parse body if provided
    let body = { role: "admin", permissions: DEFAULT_ADMIN_PERMISSIONS };
    try {
      const parsedBody = await request.json();
      if (parsedBody && parsedBody.role) {
        body = parsedBody;
      }
    } catch {
      // Ignored if no body is passed
    }

    const { role, permissions } = body;

    await adminDb
      .collection("whitelisted_admins")
      .doc(normalizedEmail)
      .set({
        email: normalizedEmail,
        role: role === "moderator" ? "moderator" : "admin",
        permissions: permissions || (role === "moderator" ? [] : DEFAULT_ADMIN_PERMISSIONS),
        addedBy: context.uid,
        addedAt: Timestamp.now(),
      });

    await syncUserRole(normalizedEmail, role as "admin" | "moderator", permissions);

    return withCors(request, NextResponse.json({ success: true }));
  } catch (error) {
    return handleRouteError(request, error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ email: string }> }) {
  try {
    await requireOwner(request);
    const { email } = await params;
    const normalizedEmail = decodeURIComponent(email).trim().toLowerCase();
    const ownerEmail = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "a7medorabe7@gmail.com")
      .trim()
      .toLowerCase();

    if (ownerEmail && normalizedEmail === ownerEmail) {
      return withCors(
        request,
        NextResponse.json({ error: "Owner access cannot be removed" }, { status: 400 })
      );
    }

    // Try to get uid from request URL search parameters safely
    let uid: string | undefined;
    try {
      // Provide a dummy base URL in case request.url is relative in some serverless environments
      const url = new URL(request.url, "http://localhost");
      uid = url.searchParams.get("uid") || undefined;
    } catch {
      // Ignored
    }

    await adminDb.collection("whitelisted_admins").doc(normalizedEmail).delete();
    await syncUserRole(normalizedEmail, "student", undefined, uid);

    return withCors(request, NextResponse.json({ success: true }));
  } catch (error) {
    return handleRouteError(request, error);
  }
}
