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
import { db } from "@/lib/firebase";
import { Notification as AppNotification } from "@/types";

/**
 * Notification Service - Handles all notification operations
 */
export const notificationService = {
  // ... (subscribeToAll remains same)
  // ... (create remains same, but we need to re-insert it or assume it's there.
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
  subscribeToAll(
    onUpdate: (notifications: AppNotification[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
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
  async create(data: {
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
  }): Promise<string> {
    const docRef = await addDoc(collection(db, "notifications"), {
      ...data,
      readBy: [],
      createdAt: Timestamp.now(),
    });
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
   * Request browser notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
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
