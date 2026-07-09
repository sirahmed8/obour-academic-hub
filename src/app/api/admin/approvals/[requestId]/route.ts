import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, Timestamp } from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import { getRequestContext, handleRouteError } from "@/lib/server/auth";
import { approvalUpdateSchema } from "@/lib/server/admin-schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const context = await getRequestContext(request);
    const canManageApproval =
      context.isOwner ||
      context.permissions.has("manage_subjects") ||
      context.permissions.has("manage_users");

    if (!canManageApproval) {
      return withCors(request, NextResponse.json({ error: "Forbidden" }, { status: 403 }));
    }

    const body = approvalUpdateSchema.parse(await request.json());
    const { requestId } = await params;

    await adminDb
      .collection("admin_approvals")
      .doc(requestId)
      .set(
        {
          status: body.status,
          ...(body.status === "approved"
            ? { approvedBy: context.uid, approvedAt: Timestamp.now() }
            : { rejectedBy: context.uid, rejectedAt: Timestamp.now() }),
        },
        { merge: true }
      );

    return withCors(request, NextResponse.json({ success: true }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return withCors(
        request,
        NextResponse.json(
          { error: "Invalid approval payload", details: error.flatten() },
          { status: 400 }
        )
      );
    }

    return handleRouteError(request, error);
  }
}
