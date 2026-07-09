import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, Timestamp } from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import { handleRouteError, requirePermission } from "@/lib/server/auth";
import { resourcePayloadSchema } from "@/lib/server/admin-schemas";
import { updatePlatformStats } from "@/lib/server/stats";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request) {
  try {
    const context = await requirePermission(request, "manage_resources");
    const body = resourcePayloadSchema.parse(await request.json());
    const { subjectId, ...resourceData } = body;

    const resourceRef = await adminDb
      .collection("subjects")
      .doc(subjectId)
      .collection("resources")
      .add({
        ...resourceData,
        createdAt: Timestamp.now(),
        createdBy: context.uid,
      });

    // Update Platform Stats
    await updatePlatformStats("resources", 1);

    const subjectSnapshot = await adminDb.collection("subjects").doc(subjectId).get();
    const subjectData = subjectSnapshot.data() as { name?: string; nameAr?: string } | undefined;
    const subjectName = subjectData?.name || "Subject";
    const subjectNameAr = subjectData?.nameAr || subjectName;

    await adminDb.collection("notifications").add({
      titleAr: "📚 مصدر جديد",
      titleEn: "📚 New Resource",
      title: "📚 مصدر جديد",
      messageAr: `تم إضافة ${body.type === "pdf" ? "ملف" : "مورد"} جديد: "${body.titleAr || body.title}" في مادة ${subjectNameAr}`,
      messageEn: `New ${body.type === "pdf" ? "file" : "resource"} "${body.title}" added to ${subjectName}`,
      message: `تم إضافة ${body.type === "pdf" ? "ملف" : "مورد"} جديد: "${body.titleAr || body.title}"`,
      type: "info",
      target: "all",
      subjectId,
      resourceId: resourceRef.id,
      readBy: [],
      createdAt: Timestamp.now(),
      createdBy: context.uid,
    });

    return withCors(request, NextResponse.json({ success: true, id: resourceRef.id }));
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
