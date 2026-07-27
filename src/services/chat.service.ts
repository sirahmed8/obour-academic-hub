import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  Unsubscribe,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChatMessage, ChatSession, TodoTask } from "@/types";
import { errorLogger } from "@/lib/errorLogger";
import { toDate } from "@/lib/utils";
import {
  sendMessage as sendChatMessage,
  markMessagesAsSeen as markChatMessagesAsSeen,
  deleteMessage as deleteChatMessage,
  clearChatHistory as clearUserChatHistory,
} from "@/lib/chatUtils";

/**
 * Chat Service - Handles administrative & user chat operations, inbox monitoring, and real-time streams.
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
      (error) => {
        errorLogger.capture(error, { context: "ChatService.subscribeToAdminUnreadCount" });
        if (onError) onError(error);
      }
    );
  }

  /**
   * Subscribe to all active chat sessions (for admin inbox)
   */
  subscribeToChatSessions(
    onUpdate: (sessions: ChatSession[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!db) return () => {};

    const chatQuery = query(collection(db, "chats"), orderBy("lastMessageTime", "desc"));
    return onSnapshot(
      chatQuery,
      (snapshot) => {
        const sessions: ChatSession[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId || doc.id,
            userName: data.userName || data.displayName || "Student",
            userEmail: data.userEmail || "",
            lastMessage: data.lastMessage || "",
            lastMessageTime: data.lastMessageTime ? toDate(data.lastMessageTime) : null,
            unreadCount: data.unreadCount || 0,
            adminUnreadCount: data.adminUnreadCount || 0,
            isTyping: data.isTyping || false,
            isPinned: data.isPinned || false,
            userImage: data.userImage,
          };
        });
        onUpdate(sessions);
      },
      (error) => {
        errorLogger.capture(error, { context: "ChatService.subscribeToChatSessions" });
        if (onError) onError(error);
      }
    );
  }

  /**
   * Subscribe to messages in a specific chat room/session
   */
  subscribeToRoomMessages(
    chatId: string,
    onUpdate: (messages: ChatMessage[]) => void,
    onError?: (error: Error) => void,
    limitCount: number = 100
  ): Unsubscribe {
    if (!db || !chatId) return () => {};

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"), firestoreLimit(limitCount));

    return onSnapshot(
      q,
      (snapshot) => {
        const messages: ChatMessage[] = snapshot.docs.map(
          (doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            return {
              id: doc.id,
              text: data.text || "",
              senderId: data.senderId || "",
              senderName: data.senderName || "",
              timestamp: data.timestamp
                ? toDate(data.timestamp)
                : data.createdAt
                  ? toDate(data.createdAt)
                  : null,
              status: data.status || "sent",
              replyTo: data.replyTo || undefined,
              reactions: data.reactions || {},
              isDeleted: data.isDeleted || false,
              type: data.type || "text",
              context: data.context || "live",
              attachmentUrl: data.attachmentUrl,
              attachmentName: data.attachmentName,
              attachmentSize: data.attachmentSize,
              attachmentType: data.attachmentType,
              role: data.role,
              action: data.action,
              taskData: data.taskData,
              seenBy: data.seenBy,
            };
          }
        );
        onUpdate(messages);
      },
      (error) => {
        errorLogger.capture(error, { context: "ChatService.subscribeToRoomMessages", chatId });
        if (onError) onError(error);
      }
    );
  }

  /**
   * Subscribe to global community room messages (chat_messages collection)
   */
  subscribeToGlobalChatMessages(
    roomId: string = "global",
    onUpdate: (messages: ChatMessage[]) => void,
    onError?: (error: Error) => void,
    limitCount: number = 50
  ): Unsubscribe {
    if (!db) return () => {};

    const q = query(
      collection(db, "chat_messages"),
      where("roomId", "==", roomId),
      orderBy("createdAt", "asc"),
      firestoreLimit(limitCount)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const messages: ChatMessage[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            timestamp: data.timestamp
              ? toDate(data.timestamp)
              : data.createdAt
                ? toDate(data.createdAt)
                : null,
          } as ChatMessage;
        });
        onUpdate(messages);
      },
      (err) => {
        errorLogger.capture(err, { context: "ChatService.subscribeToGlobalChatMessages", roomId });
        if (onError) onError(err);
      }
    );
  }

  /**
   * Send a message to a chat room
   */
  async sendMessage(
    chatId: string,
    text: string,
    senderId: string,
    senderName: string,
    isAdmin: boolean = false,
    replyTo?: ChatMessage["replyTo"],
    context: "bot" | "live" = "live",
    attachment?: { url: string; name: string; size: number; type: string },
    additionalData?: {
      action?: "confirm_task" | "live_chat";
      taskData?: Partial<TodoTask>;
      isAI?: boolean;
    },
    userImage?: string
  ): Promise<void> {
    try {
      await sendChatMessage(
        chatId,
        text,
        senderId,
        senderName,
        isAdmin,
        replyTo,
        context,
        attachment,
        additionalData,
        userImage
      );
    } catch (error) {
      errorLogger.capture(error, { context: "ChatService.sendMessage", chatId, senderId });
      throw error;
    }
  }

  /**
   * Mark messages as seen in a chat room
   */
  async markAsSeen(chatId: string, isAdmin: boolean): Promise<void> {
    try {
      await markChatMessagesAsSeen(chatId, isAdmin);
    } catch (error) {
      errorLogger.capture(error, { context: "ChatService.markAsSeen", chatId, isAdmin });
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(chatId: string, messageId: string): Promise<void> {
    try {
      await deleteChatMessage(chatId, messageId);
    } catch (error) {
      errorLogger.capture(error, { context: "ChatService.deleteMessage", chatId, messageId });
      throw error;
    }
  }

  /**
   * Clear chat history
   */
  async clearHistory(userId: string): Promise<void> {
    try {
      await clearUserChatHistory(userId);
    } catch (error) {
      errorLogger.capture(error, { context: "ChatService.clearHistory", userId });
      throw error;
    }
  }
}

export const chatService = ChatService.getInstance();
