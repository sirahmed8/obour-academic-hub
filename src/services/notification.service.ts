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
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Notification as AppNotification } from "@/types";
import { getApiBaseUrl } from "@/lib/config";

/**
 * Notification Service - Handles all notification operations
 */
export const notificationService = {
  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return "denied";
    }
    return await Notification.requestPermission();
  },

  /**
   * Mock Email Notification
   */
  async sendEmailNotification(to: string[], subject: string, html: string) {
    try {
      const baseUrl = getApiBaseUrl();
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        console.warn("[Email Service] No user authenticated, cannot send email");
        return;
      }

      const response = await fetch(`${baseUrl}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ to, subject, html }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send email");
      }

      console.log("[Email Service] Email sent successfully");
    } catch (error) {
      console.error("[Email Service] Error sending email:", error);
      // Fallback log
      console.log(`[Email Service Fallback] To: [${to.join(", ")}], Subject: ${subject}`);
    }
  },

  /**
   * Subscribe to all notifications
   */
  // Wait, replace_json is better or replace_file_content with context?
  // I will replace the imports at top and the deleteByEntity method.
  // BUT I need to be careful not to delete Create.
  // I will use multi_replace. Or just replace the imports and then the function.
  // Replacing imports first.

  // Actually, I can do it in one go if I include enough context or use multi_replace.
  // Let's use multi_replace for safety.

  /**
   * Subscribe to all notifications (for filtering client-side as per current architecture)
   */
  /**
   * Subscribe to user's notifications (Targeted + All)
   */
  subscribeToUser(
    userId: string,
    onUpdate: (notifications: AppNotification[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    // Query for notifications where target is either the user ID or 'all'
    const q = query(
      collection(db, "notifications"),
      where("target", "in", [userId, "all"]),
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as AppNotification
        );
        onUpdate(notifications);
      },
      onError
    );
  },

  /**
   * Create a new notification
   */
  async create(
    data: {
      userId?: string; // Optional if target is used
      target?: "all" | "admins" | string;
      title: string;
      message: string;
      type?: string;
      link?: string;
      subjectId?: string;
      resourceId?: string;
      entityId?: string; // ID of the entity (e.g., taskId)
      entityType?: string; // Type of entity (e.g., "task")
      titleAr?: string;
      messageAr?: string;
      titleEn?: string;
      messageEn?: string;
    },
    shouldPushEmail: boolean = false
  ): Promise<string> {
    const docRef = await addDoc(collection(db, "notifications"), {
      ...data,
      readBy: [],
      createdAt: Timestamp.now(),
    });

    if (shouldPushEmail) {
      console.log("[Notification Service] SHOULD PUSH EMAIL:", data.title);
      // In a real app, query users where emailNotifications == true (or target-based)
      // and call this.sendEmailNotification(...)
    }

    return docRef.id;
  },

  /**
   * Delete notification by entity ID (e.g., when a task is uncompleted)
   */
  async deleteByEntity(entityId: string, userId: string): Promise<void> {
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
      console.error("Error deleting notification by entity:", error);
    }
  },

  /**
   * Mark notification as read for a specific user
   */
  async markAsRead(id: string, userId: string): Promise<void> {
    await updateDoc(doc(db, "notifications", id), {
      readBy: arrayUnion(userId),
    });
  },

  /**
   * Delete a notification
   */
  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, "notifications", id));
  },

  /**
   * Send a native browser notification
   */
  sendBrowserNotification(title: string, options?: NotificationOptions) {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification(title, {
        icon: "/obour-logo.png", // Ensure this path is correct
        badge: "/obour-logo.png",
        ...options,
      });
    }
  },
};
