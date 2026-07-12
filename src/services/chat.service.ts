import { collection, query, where, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Chat Service - Handles administrative chat operations and inbox monitoring.
 */
export class ChatService {
  private static instance: ChatService;

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Subscribe to global admin unread count across active chats.
   */
  subscribeToAdminUnreadCount(
    onUpdate: (count: number) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!db) return () => {};

    const chatQuery = query(collection(db, "chats"), where("adminUnreadCount", ">", 0));
    return onSnapshot(
      chatQuery,
      (snapshot) => {
        let count = 0;
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          count += data.adminUnreadCount || 0;
        });
        onUpdate(count);
      },
      onError
    );
  }
}
