import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb, Timestamp } from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import { handleRouteError, requirePermission } from "@/lib/server/auth";
import { bannerPayloadSchema } from "@/lib/server/admin-schemas";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request) {
  try {
    const context = await requirePermission(request, "manage_announcements");
    const body = bannerPayloadSchema.parse(await request.json());
    const bannerRef = await adminDb.collection("banners").add({
      ...body,
      createdAt: Timestamp.now(),
      createdBy: context.uid,
    });

    await adminDb.collection("notifications").add({
      titleAr:
        body.type === "urgent"
          ? "🚨 إعلان عاجل"
          : body.type === "warning"
            ? "⚠️ تنبيه"
            : body.type === "success"
              ? "✅ أخبار سارة"
              : "📢 إعلان جديد",
      titleEn:
        body.type === "urgent"
          ? "🚨 Urgent Announcement"
          : body.type === "warning"
            ? "⚠️ Warning"
            : body.type === "success"
              ? "✅ Good News"
              : "📢 New Announcement",
      title:
        body.type === "urgent"
          ? "🚨 إعلان عاجل"
          : body.type === "warning"
            ? "⚠️ تنبيه"
            : body.type === "success"
              ? "✅ أخبار سارة"
              : "📢 إعلان جديد",
      messageAr: body.textAr,
      messageEn: body.textEn,
      message: body.textAr,
      type: body.type,
      target: "all",
      bannerId: bannerRef.id,
      readBy: [],
      createdAt: Timestamp.now(),
      createdBy: context.uid,
    });

    return withCors(request, NextResponse.json({ success: true, id: bannerRef.id }));
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
