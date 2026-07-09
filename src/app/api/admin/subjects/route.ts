import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, Timestamp } from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import { handleRouteError, requirePermission } from "@/lib/server/auth";
import { subjectPayloadSchema } from "@/lib/server/admin-schemas";
import { updatePlatformStats } from "@/lib/server/stats";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request) {
  try {
    const context = await requirePermission(request, "manage_subjects");
    const body = subjectPayloadSchema.parse(await request.json());
    const subjectCount = (await adminDb.collection("subjects").count().get()).data().count;

    const subjectRef = await adminDb.collection("subjects").add({
      ...body,
      createdAt: Timestamp.now(),
      createdBy: context.uid,
      orderIndex: body.orderIndex ?? subjectCount,
    });

    // Update Platform Stats
    await updatePlatformStats("subjects", 1);

    await adminDb.collection("notifications").add({
      titleAr: "🏫 مادة جديدة",
      titleEn: "🏫 New Subject",
      title: "🏫 مادة جديدة",
      messageAr: `تم إضافة مادة جديدة: ${body.nameAr || body.name}`,
      messageEn: `New subject added: ${body.name}`,
      message: `تم إضافة مادة جديدة: ${body.nameAr || body.name}`,
      type: "info",
      target: "all",
      subjectId: subjectRef.id,
      readBy: [],
      createdAt: Timestamp.now(),
      createdBy: context.uid,
    });

    return withCors(request, NextResponse.json({ success: true, id: subjectRef.id }));
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
