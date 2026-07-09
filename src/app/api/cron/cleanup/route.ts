import { NextResponse } from "next/server";
import { adminDb, Timestamp } from "@/lib/server/firebase-admin";
import { logServerError, logServerInfo } from "@/lib/server/error-sanitizer";
import crypto from "crypto";

import { withCors, corsOptions } from "@/lib/server/cors";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

/**
 * GET /api/cron/cleanup
 * Triggered by Vercel Cron to clean up old data.
 */
export async function GET(request: Request) {
  // 1. Verify Authorization
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    const expectedAuth = `Bearer ${cronSecret}`;
    const providedAuth = authHeader || "";
    // Avoid timing attacks
    const bufferExpected = Buffer.from(expectedAuth);
    const bufferProvided = Buffer.from(providedAuth);
    if (
      bufferExpected.length !== bufferProvided.length ||
      !crypto.timingSafeEqual(bufferExpected, bufferProvided)
    ) {
      return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
  } else if (authHeader) {
    return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  const results: Record<string, number> = {};

  try {
    // 2. Define Thresholds
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoTs = Timestamp.fromDate(thirtyDaysAgo);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    const fourteenDaysAgoTs = Timestamp.fromDate(fourteenDaysAgo);

    // 3. Cleanup analytics_logs (> 30 days)
    const analyticsQuery = await adminDb
      .collection("analytics_logs")
      .where("timestamp", "<", thirtyDaysAgoTs)
      .limit(500) // Batch limit for stability
      .get();

    if (!analyticsQuery.empty) {
      const batch = adminDb.batch();
      analyticsQuery.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      results.analytics_logs_deleted = analyticsQuery.size;
    } else {
      results.analytics_logs_deleted = 0;
    }

    // 4. Cleanup old notifications
    const notifQuery = await adminDb
      .collection("notifications")
      .where("createdAt", "<", fourteenDaysAgoTs)
      .limit(500)
      .get();

    if (!notifQuery.empty) {
      const batch = adminDb.batch();
      notifQuery.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      results.notifications_deleted = notifQuery.size;
    } else {
      results.notifications_deleted = 0;
    }

    logServerInfo("Cron Cleanup Completed", { results });
    return withCors(request, NextResponse.json({ status: "success", results }));
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    logServerError("Cron Cleanup Failed", error, { action: "cron_cleanup" });
    return withCors(
      request,
      NextResponse.json({ status: "error", error: errorMsg }, { status: 500 })
    );
  }
}
