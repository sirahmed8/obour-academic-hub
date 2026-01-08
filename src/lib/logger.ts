import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export async function logError(
  error: unknown,
  context: string,
  userId?: string,
  metadata: Record<string, any> = {}
) {
  try {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : null;

    await addDoc(collection(db, "error_logs"), {
      userId: userId || "guest",
      context,
      message: errorMsg,
      stack: errorStack,
      timestamp: serverTimestamp(),
      metadata,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "server",
      url: typeof window !== "undefined" ? window.location.href : "server",
    });

    // Also log to console in non-production
    if (process.env.NODE_ENV !== "production") {
      console.error(`[Logger] Error in ${context}:`, error);
    }
  } catch (loggingError) {
    console.error("Failed to log error to Firestore:", loggingError);
  }
}
