import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, Timestamp } from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import { handleRouteError, requirePermission } from "@/lib/server/auth";
import { subjectPayloadSchema } from "@/lib/server/admin-schemas";
import { updatePlatformStats } from "@/lib/server/stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const subjectUpdateSchema = subjectPayloadSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  try {
    const context = await requirePermission(request, "manage_subjects");
    const { subjectId } = await params;
    const body = subjectUpdateSchema.parse(await request.json());

    await adminDb
      .collection("subjects")
      .doc(subjectId)
      .set(
        {
          ...body,
          updatedAt: Timestamp.now(),
          updatedBy: context.uid,
        },
        { merge: true }
      );

    return withCors(request, NextResponse.json({ success: true }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return withCors(
        request,
        NextResponse.json(
          { error: "Invalid subject payload", details: error.flatten() },
          { status: 400 }
        )
      );
    }

    return handleRouteError(request, error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  try {
    await requirePermission(request, "manage_subjects");
    const { subjectId } = await params;
    const subjectRef = adminDb.collection("subjects").doc(subjectId);

    // Get all nested resources under the subject
    const resourcesSnapshot = await subjectRef.collection("resources").get();

    // Create a batch to delete subject and all nested resources
    const batch = adminDb.batch();
    resourcesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    batch.delete(subjectRef);
    await batch.commit();

    // Update Platform Stats
    await updatePlatformStats("subjects", -1);

    return withCors(request, NextResponse.json({ success: true }));
  } catch (error) {
    return handleRouteError(request, error);
  }
}
