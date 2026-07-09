import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, adminAuth, FieldValue, Timestamp } from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import {
  assertCanManageUser,
  handleRouteError,
  requirePermission,
  syncCustomClaims,
} from "@/lib/server/auth";
import { userUpdateSchema } from "@/lib/server/admin-schemas";
import type { UserPermission, UserRole } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_ADMIN_PERMISSIONS: UserPermission[] = [
  "manage_subjects",
  "manage_resources",
  "send_notifications",
  "manage_announcements",
];

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const context = await requirePermission(request, "manage_users");
    const { uid } = await params;
    const body = userUpdateSchema.parse(await request.json());

    const userRef = adminDb.collection("users").doc(uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return withCors(request, NextResponse.json({ error: "User not found" }, { status: 404 }));
    }

    const targetUser = { uid, ...(userSnapshot.data() ?? {}) } as {
      uid: string;
      role?: "student" | "admin" | "owner";
      permissions?: UserPermission[];
    };

    assertCanManageUser(context, targetUser);

    // SECURITY: Only owner can promote to admin/owner or demote an admin
    const isRoleChange = body.role !== undefined && body.role !== targetUser.role;
    const isTargetAdminOrOwner = targetUser.role === "admin" || targetUser.role === "owner";
    const isNewRoleAdminOrOwner = body.role === "admin" || body.role === "owner";

    if (isRoleChange && (isTargetAdminOrOwner || isNewRoleAdminOrOwner) && !context.isOwner) {
      return withCors(
        request,
        NextResponse.json({ error: "Only the owner can manage admin roles" }, { status: 403 })
      );
    }

    if (body.permissions && (body.role ?? targetUser.role) !== "admin" && !context.isOwner) {
      return withCors(
        request,
        NextResponse.json({ error: "Permissions can only be assigned to admins" }, { status: 400 })
      );
    }

    const update: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
      updatedBy: context.uid,
    };

    if (body.displayName !== undefined) {
      update.displayName = body.displayName;
    }

    if (body.studentCode !== undefined) {
      update.studentCode = body.studentCode || FieldValue.delete();
    }

    if (body.role !== undefined) {
      update.role = body.role;

      if (body.role === "student") {
        update.permissions = [];
      }

      if (body.role === "admin" && body.permissions === undefined) {
        update.permissions =
          targetUser.permissions && targetUser.permissions.length > 0
            ? targetUser.permissions
            : DEFAULT_ADMIN_PERMISSIONS;
      }
    }

    if (body.permissions !== undefined) {
      update.permissions = body.permissions;
    }

    await userRef.set(update, { merge: true });

    // Sync Custom Claims to Firebase Auth for real-time permission updates
    const finalRole = (update.role as UserRole) || targetUser.role || "student";
    const finalPermissions =
      (update.permissions as UserPermission[]) || targetUser.permissions || [];
    await syncCustomClaims(uid, finalRole, finalPermissions);

    return withCors(request, NextResponse.json({ success: true }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return withCors(
        request,
        NextResponse.json(
          { error: "Invalid user payload", details: error.flatten() },
          { status: 400 }
        )
      );
    }

    return handleRouteError(request, error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const context = await requirePermission(request, "manage_users");
    const { uid } = await params;

    if (uid === context.uid) {
      return withCors(
        request,
        NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
      );
    }

    const userRef = adminDb.collection("users").doc(uid);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.exists) {
      return withCors(
        request,
        NextResponse.json({ error: "User not found in database" }, { status: 404 })
      );
    }

    const targetUser = { uid, ...(userSnapshot.data() ?? {}) } as {
      uid: string;
      role?: "student" | "admin" | "owner";
      permissions?: UserPermission[];
    };

    assertCanManageUser(context, targetUser);

    // SECURITY: Only the owner can delete another admin or owner
    const isTargetAdminOrOwner = targetUser.role === "admin" || targetUser.role === "owner";
    if (isTargetAdminOrOwner && !context.isOwner) {
      return withCors(
        request,
        NextResponse.json(
          { error: "Only the owner can delete admin/owner accounts" },
          { status: 403 }
        )
      );
    }

    // 1. Delete from Firebase Authentication
    try {
      await adminAuth.deleteUser(uid);
    } catch (error) {
      const authError = error as { code?: string };
      if (authError?.code === "auth/user-not-found") {
        console.warn(
          `User ${uid} not found in Firebase Auth, proceeding to delete Firestore data.`
        );
      } else {
        throw error;
      }
    }

    // 2. Delete Firestore records (including subcollections tasks, stats) and anonymize chat messages
    const tasksSnapshot = await userRef.collection("tasks").get();
    const statsSnapshot = await userRef.collection("stats").get();
    const chatMessagesSnapshot = await adminDb
      .collection("global_chat")
      .where("uid", "==", uid)
      .get();

    let batch = adminDb.batch();
    let operationCount = 0;

    const commitBatchIfFull = async () => {
      if (operationCount >= 450) {
        await batch.commit();
        batch = adminDb.batch();
        operationCount = 0;
      }
    };

    // Delete all tasks
    tasksSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      operationCount++;
    });
    await commitBatchIfFull();

    // Delete all stats
    statsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      operationCount++;
    });
    await commitBatchIfFull();

    // Anonymize chat messages
    chatMessagesSnapshot.forEach((docSnap) => {
      batch.update(docSnap.ref, {
        displayName: "Deleted User",
        uid: "deleted",
        role: "student",
      });
      operationCount++;
    });
    await commitBatchIfFull();

    batch.delete(userRef);
    operationCount++;
    await commitBatchIfFull();

    batch.delete(adminDb.collection("user_stats").doc(uid));
    operationCount++;

    if (operationCount > 0) {
      await batch.commit();
    }

    // Log the deletion action
    await adminDb.collection("logs").add({
      action: "DELETE_USER",
      details: `Administrator deleted user account: ${targetUser.uid} (${targetUser.role || "student"}).`,
      timestamp: new Date(),
      userId: context.uid,
      userEmail: context.email,
    });

    return withCors(request, NextResponse.json({ success: true }));
  } catch (error) {
    return handleRouteError(request, error);
  }
}
