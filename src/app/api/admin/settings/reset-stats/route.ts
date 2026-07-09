import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import { handleRouteError, requireOwner } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request) {
  try {
    const context = await requireOwner(request);

    // Reset stats in batches for performance and reliability
    const subjectsSnapshot = await adminDb.collection("subjects").get();
    const resourcesSnapshot = await adminDb.collectionGroup("resources").get();
    const logsSnapshot = await adminDb.collection("logs").get();
    const analyticsLogsSnapshot = await adminDb.collection("analytics_logs").get();
    const userStatsSnapshot = await adminDb.collection("user_stats").get();

    let batch = adminDb.batch();
    let operationCount = 0;

    const commitBatchIfFull = async () => {
      if (operationCount >= 450) {
        await batch.commit();
        batch = adminDb.batch();
        operationCount = 0;
      }
    };

    for (const doc of subjectsSnapshot.docs) {
      batch.update(doc.ref, { views: 0 });
      operationCount++;
      await commitBatchIfFull();
    }

    for (const doc of resourcesSnapshot.docs) {
      batch.update(doc.ref, { downloads: 0 });
      operationCount++;
      await commitBatchIfFull();
    }

    // Clear logs too as it's part of the stats reset
    for (const doc of logsSnapshot.docs) {
      batch.delete(doc.ref);
      operationCount++;
      await commitBatchIfFull();
    }

    // Clear analytics logs for deep reset
    for (const doc of analyticsLogsSnapshot.docs) {
      batch.delete(doc.ref);
      operationCount++;
      await commitBatchIfFull();
    }

    // Reset user stats to zero
    for (const doc of userStatsSnapshot.docs) {
      batch.update(doc.ref, {
        pageViews: 0,
        fileOpens: 0,
        subjectOpens: 0,
        totalActions: 0,
        lastActive: new Date(),
      });
      operationCount++;
      await commitBatchIfFull();
    }

    // Reset platform_stats in settings
    const statsRef = adminDb.collection("settings").doc("platform_stats");
    batch.set(statsRef, {
      students: 0,
      resources: 0,
      subjects: 0,
      updatedAt: new Date(),
    });
    operationCount++;
    await commitBatchIfFull();

    // Log the reset action
    const logRef = adminDb.collection("logs").doc();
    batch.set(logRef, {
      action: "RESET_STATS",
      details: "Administrator performed a full platform statistics reset.",
      timestamp: new Date(),
      userId: context.uid,
      userEmail: context.email,
    });
    operationCount++;

    if (operationCount > 0) {
      await batch.commit();
    }

    return withCors(request, NextResponse.json({ success: true }));
  } catch (error) {
    return handleRouteError(request, error);
  }
}
