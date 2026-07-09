import { adminDb, FieldValue } from "./firebase-admin";

export async function updatePlatformStats(
  type: "students" | "subjects" | "resources",
  change: number
) {
  const statsRef = adminDb.collection("settings").doc("platform_stats");

  try {
    await statsRef.set(
      {
        [type]: FieldValue.increment(change),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error(`Failed to update platform stats (${type}):`, error);
    // Non-blocking, but we should probably log it properly in a real app
  }
}
