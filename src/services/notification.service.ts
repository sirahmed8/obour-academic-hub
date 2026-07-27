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
  DocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Notification as AppNotification } from "@/types";
import { apiFetch } from "@/lib/api-client";
import { errorLogger } from "@/lib/errorLogger";
import { toDate } from "@/lib/utils";

/**
 * Notification Service - Handles all notification operations
 */
class NotificationService {
  /**
   * Transforms Firestore document data into a typed Notification object.
   */
  private transformNotification(snapshot: DocumentSnapshot<DocumentData>): AppNotification {
    const data = snapshot.data() || {};
    return {
      ...data,
      id: snapshot.id,
      createdAt: data.createdAt ? toDate(data.createdAt) : data.createdAt,
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
    try {
      return await window.Notification.requestPermission();
    } catch (error) {
      errorLogger.capture(error, { context: "NotificationService.requestPermission" });
      return "denied";
    }
  }

  /**
   * Send Email Notification via API endpoint
   */
  async sendEmailNotification(to: string[], subject: string, html: string) {
    try {
      await apiFetch("/api/send-email", {
        method: "POST",
        body: { to, subject, html },
      });
    } catch (error) {
      errorLogger.capture(error, { context: "Email Service", to, subject });
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
      (error) => {
        errorLogger.capture(error, { context: "NotificationService.subscribeToUser", userId });
        if (onError) onError(error);
      }
    );
  }

  /**
   * Subscribe to all notifications (for Admin dashboard monitoring)
   */
  subscribeToAllNotifications(
    onUpdate: (notifications: AppNotification[]) => void,
    onError?: (error: Error) => void,
    limitCount: number = 50
  ): Unsubscribe {
    if (!db) return () => {};

    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
      firestoreLimit(limitCount)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((d) => this.transformNotification(d));
        onUpdate(notifications);
      },
      (error) => {
        errorLogger.capture(error, { context: "NotificationService.subscribeToAllNotifications" });
        if (onError) onError(error);
      }
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

    try {
      const { ...notificationData } = data;

      const docRef = await addDoc(collection(db, "notifications"), {
        ...notificationData,
        readBy: [],
        createdAt: Timestamp.now(),
      });

      if (shouldPushEmail) {
        errorLogger.log(`[Notification Service] Email requested for: ${data.title}`, "info");
      }

      return docRef.id;
    } catch (error) {
      errorLogger.capture(error, { context: "NotificationService.create", data });
      throw error;
    }
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
    try {
      await updateDoc(doc(db, "notifications", id), {
        readBy: arrayUnion(userId),
      });
    } catch (error) {
      errorLogger.capture(error, { context: "NotificationService.markAsRead", id, userId });
    }
  }

  /**
   * Mark all targeted notifications as read for a specific user
   */
  async markAllAsRead(userId: string, includeAdmin: boolean = false): Promise<void> {
    if (!db || !userId) return;
    try {
      const targets = includeAdmin ? [userId, "all", "admins"] : [userId, "all"];
      const q = query(collection(db, "notifications"), where("target", "in", targets));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (!data.readBy || !data.readBy.includes(userId)) {
          batch.update(d.ref, {
            readBy: arrayUnion(userId),
          });
        }
      });
      await batch.commit();
    } catch (error) {
      errorLogger.capture(error, { context: "NotificationService.markAllAsRead", userId });
    }
  }

  /**
   * Delete a notification
   */
  async delete(id: string): Promise<void> {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (error) {
      errorLogger.capture(error, { context: "NotificationService.delete", id });
    }
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
