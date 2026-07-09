import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  arrayUnion,
  Timestamp,
  Unsubscribe,
  getDocs,
  where,
  writeBatch,
  limit as firestoreLimit,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Notification as AppNotification } from "@/types";
import { apiFetch } from "@/lib/api-client";
import { errorLogger } from "@/lib/errorLogger";

/**
 * Notification Service - Handles all notification operations
 */
/**
 * Notification Service - Handles all notification operations
 */
class NotificationService {
  /**
   * Transforms Firestore document data into a typed Notification object.
   */
  private transformNotification(doc: QueryDocumentSnapshot<DocumentData>): AppNotification {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.() || data.createdAt,
    } as AppNotification;
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      errorLogger.log("This browser does not support desktop notification", "info");
      return "denied";
    }
    return await window.Notification.requestPermission();
  }

  /**
   * Mock Email Notification
   */
  async sendEmailNotification(to: string[], subject: string, html: string) {
    try {
      await apiFetch("/api/send-email", {
        method: "POST",
        body: { to, subject, html },
      });

      console.log("[Email Service] Email sent successfully");
    } catch (error) {
      errorLogger.capture(error, { context: "Email Service", to, subject });
      // Fallback log
      errorLogger.log(
        `[Email Service Fallback] To: [${to.join(", ")}], Subject: ${subject}`,
        "info"
      );
    }
  }

  /**
   * Subscribe to user's notifications (Targeted + All) - with pagination
   * Limits to most recent 50 notifications for performance
   */
  subscribeToUser(
    userId: string,
    onUpdate: (notifications: AppNotification[]) => void,
    onError?: (error: Error) => void,
    options?: { includeAdminTarget?: boolean; limit?: number }
  ): Unsubscribe {
    if (!db) {
      errorLogger.log(
        "Firestore 'db' is not initialized. Notification subscription skipped.",
        "warning"
      );
      return () => {};
    }

    const targets = options?.includeAdminTarget ? [userId, "all", "admins"] : [userId, "all"];
    const notificationLimit = options?.limit || 50;

    const q = query(
      collection(db, "notifications"),
      where("target", "in", targets),
      orderBy("createdAt", "desc"),
      firestoreLimit(notificationLimit)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((d) => this.transformNotification(d));
        onUpdate(notifications);
      },
      onError
    );
  }

  /**
   * Create a new notification
   */
  async create(
    data: {
      userId?: string;
      target?: "all" | "admins" | string;
      title: string;
      message: string;
      type?: string;
      link?: string;
      subjectId?: string;
      resourceId?: string;
      entityId?: string;
      entityType?: string;
      titleAr?: string;
      messageAr?: string;
      titleEn?: string;
      messageEn?: string;
    },
    shouldPushEmail: boolean = false
  ): Promise<string> {
    if (!db) {
      errorLogger.log("Firestore 'db' is not initialized. Cannot create notification.", "error");
      return "db-not-init";
    }

    const { ...notificationData } = data;

    const docRef = await addDoc(collection(db, "notifications"), {
      ...notificationData,
      readBy: [],
      createdAt: Timestamp.now(),
    });

    if (shouldPushEmail) {
      console.log("[Notification Service] SHOULD PUSH EMAIL:", data.title);
    }

    return docRef.id;
  }

  /**
   * Delete notification by entity ID
   */
  async deleteByEntity(entityId: string, userId: string): Promise<void> {
    if (!db) return;

    try {
      const q = query(
        collection(db, "notifications"),
        where("entityId", "==", entityId),
        where("target", "==", userId)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (error) {
      errorLogger.capture(error, { context: "Delete Notification By Entity", entityId });
    }
  }

  /**
   * Mark notification as read for a specific user
   */
  async markAsRead(id: string, userId: string): Promise<void> {
    if (!db) return;
    await updateDoc(doc(db, "notifications", id), {
      readBy: arrayUnion(userId),
    });
  }

  /**
   * Delete a notification
   */
  async delete(id: string): Promise<void> {
    if (!db) return;
    await deleteDoc(doc(db, "notifications", id));
  }

  /**
   * Send a native browser notification
   */
  sendBrowserNotification(title: string, options?: NotificationOptions) {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (window.Notification.permission === "granted") {
      new window.Notification(title, {
        icon: "/obour-logo.png",
        badge: "/obour-logo.png",
        ...options,
      });
    }
  }
}

export const notificationService = new NotificationService();
