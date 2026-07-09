import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, Timestamp } from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import { handleRouteError, requirePermission } from "@/lib/server/auth";
import { notificationPayloadSchema } from "@/lib/server/admin-schemas";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request) {
  try {
    const context = await requirePermission(request, "manage_announcements");
    const body = notificationPayloadSchema.parse(await request.json());
    const docRef = await adminDb.collection("notifications").add({
      titleAr: body.titleAr,
      titleEn: body.titleEn,
      title: body.titleAr,
      messageAr: body.messageAr,
      messageEn: body.messageEn,
      message: body.messageAr,
      type: body.type,
      target: body.target,
      readBy: [],
      createdAt: Timestamp.now(),
      createdBy: context.uid,
    });

    return withCors(request, NextResponse.json({ success: true, id: docRef.id }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return withCors(
        request,
        NextResponse.json(
          { error: "Invalid notification payload", details: error.flatten() },
          { status: 400 }
        )
      );
    }

    return handleRouteError(request, error);
  }
}
