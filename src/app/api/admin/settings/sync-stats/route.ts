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

    // Get live document counts using highly efficient server-side count queries
    const [usersCountSnap, subjectsCountSnap, resourcesCountSnap] = await Promise.all([
      adminDb.collection("users").count().get(),
      adminDb.collection("subjects").count().get(),
      adminDb.collectionGroup("resources").count().get(),
    ]);

    const students = usersCountSnap.data().count;
    const subjects = subjectsCountSnap.data().count;
    const resources = resourcesCountSnap.data().count;
    const timestamp = new Date();

    // Update the settings/platform_stats document
    await adminDb.collection("settings").doc("platform_stats").set(
      {
        students,
        subjects,
        resources,
        lastSync: timestamp.toISOString(),
        lastSynced: timestamp.toISOString(),
        syncMethod: "server_count",
        updatedAt: timestamp,
      },
      { merge: true }
    );

    // Log the sync action
    await adminDb.collection("logs").add({
      action: "SYNC_STATS",
      details: `Administrator synchronized platform statistics: Students=${students}, Subjects=${subjects}, Resources=${resources}.`,
      timestamp,
      userId: context.uid,
      userEmail: context.email,
    });

    return withCors(
      request,
      NextResponse.json({
        success: true,
        stats: {
          students,
          subjects,
          resources,
        },
      })
    );
  } catch (error) {
    return handleRouteError(request, error);
  }
}
