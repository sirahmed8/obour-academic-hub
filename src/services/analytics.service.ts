import { db } from "@/lib/firebase";
import {
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  limit,
  Timestamp,
  doc,
  increment,
  writeBatch,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { errorLogger } from "@/lib/errorLogger";
import { toDate } from "@/lib/utils";

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

/**
 * Analytics Service - Handles all user activity logging and statistics.
 * Implements Summary-at-Write for performance.
 */
class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Log a general user activity with Summary-at-Write optimization
   */
  async logActivity(data: ActivityLog) {
    if (!data.userId || !db) return;

    // Prevent logging for null/anonymous users if they don't have write permissions
    // Note: Guest logging depends on Firestore Security Rules.
    // If rules are strict, we should skip logging to avoid console errors.
    const isGuest = data.userId === "guest" || data.userId.startsWith("guest_");

    try {
      const batch = writeBatch(db);

      // 1. Log the raw event for audit/deep analysis
      const logsRef = collection(db, "analytics_logs");
      const logRef = doc(logsRef);

      batch.set(logRef, {
        ...data,
        timestamp: serverTimestamp(),
        id: logRef.id,
      });

      // 2. Summary-at-Write: Increment counters (only for registered users)
      if (!isGuest) {
        const statsRef = doc(db, "user_stats", data.userId);
        const field =
          data.type === "PAGE_VIEW"
            ? "pageViews"
            : data.type === "FILE_OPEN"
              ? "fileOpens"
              : data.type === "SUBJECT_OPEN"
                ? "subjectOpens"
                : "totalActions";

        batch.set(
          statsRef,
          {
            [field]: increment(1),
            totalActions: increment(1),
            lastActive: serverTimestamp(),
          },
          { merge: true }
        );
      }

      await batch.commit();
    } catch (error: unknown) {
      // 🛡️ Silent fail on permission errors to keep console clean in production
      const firebaseError = error as { code?: string; message?: string };
      if (
        firebaseError?.code === "permission-denied" ||
        firebaseError?.message?.includes("permissions")
      ) {
        if (process.env.NODE_ENV === "development") {
          errorLogger.log(
            "[Analytics Service] Permission denied for activity log. Check Firestore rules.",
            "warning"
          );
        }
        return;
      }
      errorLogger.capture(error, { context: "Analytics Activity Log" });
    }
  }

  /**
   * Log Page View
   */
  logPageView(userId: string, path: string) {
    return this.logActivity({
      userId,
      type: "PAGE_VIEW",
      path,
    });
  }

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
  }

  /**
   * Log File/Resource Open
   */
  logFileOpen(userId: string, fileName: string, fileUrl: string, subjectId?: string) {
    return this.logActivity({
      userId,
      type: "FILE_OPEN",
      details: fileName,
      metadata: { fileUrl, subjectId, action: "open" },
      path: fileUrl,
    });
  }

  /**
   * Log File/Resource Download explicitly for file download tracking
   */
  logFileDownload(
    userId: string,
    fileName: string,
    fileUrl: string,
    subjectId?: string,
    resourceId?: string
  ) {
    return this.logActivity({
      userId,
      type: "FILE_OPEN",
      details: `[DOWNLOAD] ${fileName}`,
      metadata: { fileUrl, subjectId, resourceId, isDownload: true },
      path: fileUrl,
    });
  }

  /**
   * Log Report Issue
   */
  logReport(userId: string, issueDetails: string) {
    return this.logActivity({
      userId,
      type: "REPORT_ISSUE",
      details: issueDetails,
    });
  }

  /**
   * Get aggregated activity stats for a user (last 30 days)
   */
  async getUserActivityStats(userId: string) {
    if (!db) return { pageViews: 0, fileOpens: 0, subjectOpens: 0, totalActions: 0 };

    try {
      const statsDoc = await getDoc(doc(db, "user_stats", userId));
      if (statsDoc.exists()) {
        const data = statsDoc.data();
        return {
          pageViews: data.pageViews || 0,
          fileOpens: data.fileOpens || 0,
          subjectOpens: data.subjectOpens || 0,
          totalActions: data.totalActions || 0,
        };
      }
    } catch (err) {
      errorLogger.capture(err, { context: "AnalyticsService.getUserActivityStats", userId });
    }

    return { pageViews: 0, fileOpens: 0, subjectOpens: 0, totalActions: 0 };
  }

  /**
   * Subscribe to user activity stats in real-time
   */
  subscribeToUserActivityStats(
    userId: string,
    onUpdate: (stats: {
      pageViews: number;
      fileOpens: number;
      subjectOpens: number;
      totalActions: number;
    }) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!db || !userId) return () => {};
    return onSnapshot(
      doc(db, "user_stats", userId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          onUpdate({
            pageViews: data.pageViews || 0,
            fileOpens: data.fileOpens || 0,
            subjectOpens: data.subjectOpens || 0,
            totalActions: data.totalActions || 0,
          });
        } else {
          onUpdate({ pageViews: 0, fileOpens: 0, subjectOpens: 0, totalActions: 0 });
        }
      },
      (error) => {
        errorLogger.capture(error, {
          context: "AnalyticsService.subscribeToUserActivityStats",
          userId,
        });
        if (onError) onError(error);
      }
    );
  }

  /**
   * Subscribe to recent raw activity logs for admin monitoring (real-time stream)
   */
  subscribeToRecentActivities(
    limitCount: number = 50,
    onUpdate: (logs: Record<string, unknown>[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!db) return () => {};
    const q = query(
      collection(db, "analytics_logs"),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    return onSnapshot(
      q,
      (snapshot) => {
        const logs = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            timestamp: data.timestamp ? toDate(data.timestamp) : data.timestamp,
          };
        });
        onUpdate(logs);
      },
      (error) => {
        errorLogger.capture(error, { context: "AnalyticsService.subscribeToRecentActivities" });
        if (onError) onError(error);
      }
    );
  }

  /**
   * Get daily activity counts for heatmap (last 14 days)
   */
  async getDailyActivityData(userId: string) {
    if (!db) return [];
    try {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setHours(0, 0, 0, 0);
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const q = query(
        collection(db, "analytics_logs"),
        where("userId", "==", userId),
        where("timestamp", ">=", Timestamp.fromDate(fourteenDaysAgo)),
        orderBy("timestamp", "asc")
      );

      const snapshot = await getDocs(q);
      const dayCounts: Record<string, number> = {};

      snapshot.docs.forEach((doc) => {
        const tsData = doc.data().timestamp;
        if (!tsData) return;
        const validDate = toDate(tsData);
        if (isNaN(validDate.getTime())) return;
        const dateStr = validDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dayCounts[dateStr] = (dayCounts[dateStr] || 0) + 1;
      });

      return Object.entries(dayCounts).map(([name, value]) => ({ name, value }));
    } catch (error) {
      errorLogger.capture(error, { context: "AnalyticsService.getDailyActivityData", userId });
      return [];
    }
  }

  /**
   * Get top subjects by engagement
   */
  async getTopSubjects(userId: string) {
    if (!db) return [];
    try {
      const q = query(
        collection(db, "analytics_logs"),
        where("userId", "==", userId),
        where("type", "==", "SUBJECT_OPEN"),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const subjectCounts: Record<string, number> = {};

      snapshot.docs.forEach((doc) => {
        const name = doc.data().details || "Unknown";
        subjectCounts[name] = (subjectCounts[name] || 0) + 1;
      });

      return Object.entries(subjectCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    } catch (error) {
      errorLogger.capture(error, { context: "AnalyticsService.getTopSubjects", userId });
      return [];
    }
  }
}

export const analyticsService = AnalyticsService.getInstance();
