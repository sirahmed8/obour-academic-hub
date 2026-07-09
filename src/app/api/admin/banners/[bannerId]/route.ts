import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, Timestamp } from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import { handleRouteError, requirePermission } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bannerUpdateSchema = z
  .object({
    textAr: z.string().trim().min(1).max(500).optional(),
    textEn: z.string().trim().min(1).max(500).optional(),
    type: z.enum(["info", "warning", "success", "urgent"]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bannerId: string }> }
) {
  try {
    const context = await requirePermission(request, "manage_announcements");
    const { bannerId } = await params;
    const body = bannerUpdateSchema.parse(await request.json());

    await adminDb
      .collection("banners")
      .doc(bannerId)
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
          { error: "Invalid banner payload", details: error.flatten() },
          { status: 400 }
        )
      );
    }

    return handleRouteError(request, error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ bannerId: string }> }
) {
  try {
    await requirePermission(request, "manage_announcements");
    const { bannerId } = await params;
    await adminDb.collection("banners").doc(bannerId).delete();

    return withCors(request, NextResponse.json({ success: true }));
  } catch (error) {
    return handleRouteError(request, error);
  }
}
