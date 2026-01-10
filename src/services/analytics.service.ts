import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type ActivityType =
  | "PAGE_VIEW"
  | "SUBJECT_OPEN"
  | "FILE_OPEN"
  | "REPORT_ISSUE"
  | "RESOURCE_VIEW"
  | "OTHER";

interface ActivityLog {
  type: ActivityType;
  path?: string;
  details?: string;
  userId: string;
  metadata?: Record<string, unknown>;
}

export const analyticsService = {
  /**
   * Log a general user activity
   */
  async logActivity(data: ActivityLog) {
    if (!data.userId) return;

    try {
      await addDoc(collection(db, "analytics_logs"), {
        ...data,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Analytics Log Error:", error);
    }
  },

  /**
   * Log Page View
   */
  logPageView(userId: string, path: string) {
    return this.logActivity({
      userId,
      type: "PAGE_VIEW",
      path,
    });
  },

  /**
   * Log Subject Open
   */
  logSubjectOpen(userId: string, subjectId: string, subjectName: string) {
    return this.logActivity({
      userId,
      type: "SUBJECT_OPEN",
      details: subjectName,
      metadata: { subjectId },
      path: `/subject/${subjectId}`,
    });
  },

  /**
   * Log File/Resource Open
   */
  logFileOpen(userId: string, fileName: string, fileUrl: string, subjectId?: string) {
    return this.logActivity({
      userId,
      type: "FILE_OPEN",
      details: fileName,
      metadata: { fileUrl, subjectId },
      path: fileUrl,
    });
  },

  /**
   * Log Report Issue
   */
  logReport(userId: string, issueDetails: string) {
    return this.logActivity({
      userId,
      type: "REPORT_ISSUE",
      details: issueDetails,
    });
  },
};
