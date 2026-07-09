import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, adminStorage, Timestamp } from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import { handleRouteError, requirePermission } from "@/lib/server/auth";
import { logServerError } from "@/lib/server/error-sanitizer";
import { resourcePayloadSchema } from "@/lib/server/admin-schemas";
import { updatePlatformStats } from "@/lib/server/stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    const context = await requirePermission(request, "manage_resources");
    const { resourceId } = await params;
    const body = resourcePayloadSchema.parse(await request.json());
    const { subjectId, ...resourceData } = body;

    await adminDb
      .collection("subjects")
      .doc(subjectId)
      .collection("resources")
      .doc(resourceId)
      .set(
        {
          ...resourceData,
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
          { error: "Invalid resource payload", details: error.flatten() },
          { status: 400 }
        )
      );
    }

    return handleRouteError(request, error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ resourceId: string }> }
) {
  try {
    await requirePermission(request, "manage_resources");
    const { resourceId } = await params;
    const url = new URL(request.url);
    const subjectId = url.searchParams.get("subjectId");

    if (!subjectId) {
      return withCors(
        request,
        NextResponse.json({ error: "subjectId is required" }, { status: 400 })
      );
    }

    const resourceRef = adminDb
      .collection("subjects")
      .doc(subjectId)
      .collection("resources")
      .doc(resourceId);

    const resourceSnapshot = await resourceRef.get();

    if (resourceSnapshot.exists) {
      const data = resourceSnapshot.data();
      const fileUrl = data?.url;

      // If it's a Firebase Storage URL, attempt to delete the file
      if (fileUrl && typeof fileUrl === "string") {
        try {
          const parsedUrl = new URL(fileUrl);
          if (parsedUrl.hostname === "firebasestorage.googleapis.com") {
            // Expected path format: /v0/b/<bucket>/o/<objectPath>
            const objectPathIndex = parsedUrl.pathname.indexOf("/o/");
            if (objectPathIndex !== -1) {
              const objectPathWithPrefix = parsedUrl.pathname.substring(objectPathIndex + 3); // after "/o/"
              const decodedObjectPath = decodeURIComponent(objectPathWithPrefix);

              if (decodedObjectPath) {
                await adminStorage.bucket().file(decodedObjectPath).delete();
              }
            }
          }
        } catch (storageError) {
          logServerError("Failed to delete storage file:", storageError, {
            route: "/api/admin/resources/[resourceId]",
            resourceId,
          });
        }
      }

      await resourceRef.delete();

      // Update Platform Stats
      await updatePlatformStats("resources", -1);
    }

    return withCors(request, NextResponse.json({ success: true }));
  } catch (error) {
    return handleRouteError(request, error);
  }
}
