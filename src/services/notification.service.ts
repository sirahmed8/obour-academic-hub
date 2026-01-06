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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Notification } from "@/types";

/**
 * Notification Service - Handles all notification operations
 */
export const notificationService = {
  /**
   * Subscribe to all notifications (for filtering client-side as per current architecture)
   */
  subscribeToAll(
    onUpdate: (notifications: Notification[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Notification);
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
};
