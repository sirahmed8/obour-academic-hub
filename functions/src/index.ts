import { onDocumentDeleted, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { beforeUserCreated } from "firebase-functions/v2/identity";
import * as admin from "firebase-admin";
import { getFirestore, QueryDocumentSnapshot } from "firebase-admin/firestore";

admin.initializeApp();
const db = getFirestore();

// 1. Trigger: Cascade Delete User Data
export const cascadeDeleteUser = onDocumentDeleted("users/{uid}", async (event) => {
  const uid = event.params.uid;
  const batch = db.batch();

  const collectionsToDelete = ["tasks", "logs", "notifications", "chat_messages"];

  for (const collectionName of collectionsToDelete) {
    const snapshot = await db.collection(`users/${uid}/${collectionName}`).get();
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      batch.delete(doc.ref);
    });
  }

  await batch.commit();
  console.log(`Successfully deleted cascaded data for user ${uid}`);
});

// 2. Trigger: Calculate Trending Metrics on Q&A
export const recalculateQuestionTrending = onDocumentUpdated("questions/{id}", async (event) => {
  const after = event.data?.after.data();
  const before = event.data?.before.data();

  if (!after || !before) return;

  // Only recalculate if upvotes changed
  if (after.upvotes !== before.upvotes) {
    // Basic trending score: upvotes + some time decay factor
    const trendingScore = (after.upvotes || 0) * 1.5;
    await event.data?.after.ref.update({ trendingScore });
  }
});

// 3. Trigger: Block unauthorized signups / Set defaults
export const enforceStudentRole = beforeUserCreated((event) => {
  const email = event.data?.email || "";

  if (!email.endsWith("@obour.edu.eg") && !email.endsWith("@gmail.com")) {
    throw new Error("Only Obour Institute and Gmail addresses are allowed.");
  }

  return {
    customClaims: {
      role: "student",
      points: 0,
    },
  };
});

// 4. CRON Job: Reset Weekly Leaderboard (Runs every Sunday at midnight)
export const resetWeeklyLeaderboard = onSchedule("0 0 * * 0", async () => {
  console.log("Resetting weekly leaderboard...");

  const usersSnapshot = await db.collection("users").get();

  // Firestore batch has a limit of 500 operations
  let batch = db.batch();
  let count = 0;

  for (const doc of usersSnapshot.docs) {
    batch.update(doc.ref, { weeklyPoints: 0 });
    count++;

    if (count === 490) {
      await batch.commit();
      batch = db.batch();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
  }

  console.log("Weekly leaderboard reset complete.");
});
