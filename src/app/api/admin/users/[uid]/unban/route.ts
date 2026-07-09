import { NextResponse } from "next/server";
import { adminAuth, adminDb, Timestamp } from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import { assertCanManageUser, handleRouteError, requirePermission } from "@/lib/server/auth";
import type { UserPermission } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function PUT(request: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const context = await requirePermission(request, "manage_users");
    const { uid } = await params;

    // Fetch user and assert can manage
    const userRef = adminDb.collection("users").doc(uid);
    const userSnapshot = await userRef.get();
    if (!userSnapshot.exists) {
      return withCors(request, NextResponse.json({ error: "User not found" }, { status: 404 }));
    }

    const targetUser = { uid, ...(userSnapshot.data() ?? {}) } as {
      uid: string;
      role?: "student" | "admin" | "owner" | "moderator";
      permissions?: UserPermission[];
    };

    assertCanManageUser(context, targetUser);

    // 1. Update user document
    await userRef.update({
      status: "active",
      updatedAt: Timestamp.now(),
    });

    // 2. Enable user in Firebase Auth
    await adminAuth.updateUser(uid, {
      disabled: false,
    });

    return withCors(request, NextResponse.json({ success: true }));
  } catch (error) {
    return handleRouteError(request, error);
  }
}
