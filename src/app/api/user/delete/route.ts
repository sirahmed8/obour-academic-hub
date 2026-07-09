import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import { handleRouteError, getRequestContext } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function DELETE(request: Request) {
  try {
    const context = await getRequestContext(request);
    const uid = context.uid;

    if (!uid) {
      return withCors(request, NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }

    // 1. Delete Firestore records (including subcollections tasks and stats) and anonymize chat messages
    const userRef = adminDb.collection("users").doc(uid);
    const tasksSnapshot = await userRef.collection("tasks").get();
    const statsSnapshot = await userRef.collection("stats").get();
    const chatMessagesSnapshot = await adminDb
      .collection("global_chat")
      .where("uid", "==", uid)
      .get();

    let batch = adminDb.batch();
    let operationCount = 0;

    const commitBatchIfFull = async () => {
      if (operationCount >= 450) {
        await batch.commit();
        batch = adminDb.batch();
        operationCount = 0;
      }
    };

    // Delete all tasks
    tasksSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      operationCount++;
    });
    await commitBatchIfFull();

    // Delete all stats
    statsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
      operationCount++;
    });
    await commitBatchIfFull();

    // Anonymize chat messages
    chatMessagesSnapshot.forEach((docSnap) => {
      batch.update(docSnap.ref, {
        displayName: "Deleted User",
        uid: "deleted",
        role: "student",
      });
      operationCount++;
    });
    await commitBatchIfFull();

    batch.delete(userRef);
    operationCount++;
    await commitBatchIfFull();

    batch.delete(adminDb.collection("user_stats").doc(uid));
    operationCount++;

    if (operationCount > 0) {
      await batch.commit();
    }

    // 2. Delete from Auth
    await adminAuth.deleteUser(uid);

    // 3. Log the action (System log)
    await adminDb.collection("logs").add({
      action: "USER_SELF_DELETE",
      details: `User ${context.email} deleted their own account.`,
      timestamp: new Date().toISOString(),
      userId: "system",
      userEmail: context.email,
    });

    return withCors(request, NextResponse.json({ success: true }));
  } catch (error) {
    return handleRouteError(request, error);
  }
}
