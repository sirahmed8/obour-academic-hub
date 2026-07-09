import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  setDoc,
  increment,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { filterProfanity } from "./profanityFilter";

// Types
import { ChatMessage, TodoTask } from "@/types";

// Helpers
// Add context to the function signature
export const sendMessage = async (
  chatId: string,
  text: string,
  senderId: string,
  senderName: string,
  isAdmin: boolean = false,
  replyTo: ChatMessage["replyTo"] = undefined,
  context: "bot" | "live" = "live",
  attachment?: { url: string; name: string; size: number; type: string },
  additionalData?: {
    action?: "confirm_task" | "live_chat";
    taskData?: Partial<TodoTask>;
    isAI?: boolean;
  },
  userImage?: string
) => {
  if (!db) return;
  if (!text.trim() && !attachment && !additionalData?.taskData) return;

  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const timestamp = serverTimestamp();

  // Filter profanity before saving for the message content
  const filteredText = filterProfanity(text);

  // Filter out undefined values from additionalData (Firestore doesn't accept undefined)
  const cleanAdditionalData: Record<string, unknown> = {};
  if (additionalData) {
    if (additionalData.action !== undefined) {
      cleanAdditionalData.action = additionalData.action;
    }
    if (additionalData.taskData !== undefined) {
      cleanAdditionalData.taskData = additionalData.taskData;
    }
    if (additionalData.isAI !== undefined) {
      cleanAdditionalData.isAI = additionalData.isAI;
    }
  }

  // 1. Add Message
  await addDoc(messagesRef, {
    text: filteredText,
    senderId,
    senderName,
    timestamp,
    status: "sent",
    replyTo: replyTo
      ? {
          id: replyTo.id,
          text: replyTo.text || "",
          senderName: replyTo.senderName || "User",
          attachmentUrl: replyTo.attachmentUrl || null,
          attachmentType: replyTo.attachmentType || null,
        }
      : null,
    reactions: {},
    isDeleted: false,
    type: attachment ? (attachment.type.startsWith("image") ? "image" : "file") : "text",
    context, // Save the context
    ...(attachment
      ? {
          attachmentUrl: attachment.url,
          attachmentName: attachment.name,
          attachmentSize: attachment.size,
          attachmentType: attachment.type,
        }
      : {}),
    ...cleanAdditionalData,
  });

  // 2. Update Chat Session Metadata
  const chatRef = doc(db, "chats", chatId);

  // Only update notification counts if it is NOT a bot message (unless we want to track bot usage?)
  // For now, let's track everything but maybe distinguishing in UI is better.
  const updateData: Record<string, unknown> = {
    lastMessage: filteredText, // Use filtered text for last message
    lastMessageTime: timestamp,
    isTyping: false, // Ensure isTyping is reset
  };
  const isBotSender = senderId === "bot";

  if (!isAdmin) {
    if (context === "live" && !isBotSender) {
      updateData.adminUnreadCount = increment(1);
    }

    if (!isBotSender) {
      updateData.userId = chatId;
      updateData.userName = senderName;
      if (userImage) {
        updateData.userImage = userImage;
      }
    }
  } else {
    updateData.unreadCount = increment(1);
    // When admin sends a message, it means they've seen current user messages
    updateData.adminUnreadCount = 0;
  }

  // Use setDoc with merge to handle creation if it doesn't exist
  await setDoc(chatRef, updateData, { merge: true });
};

// Mark messages as seen (both session count and individual messages)
export const markMessagesAsSeen = async (chatId: string, isAdmin: boolean) => {
  if (!db) return;
  const chatRef = doc(db, "chats", chatId);

  // 1. Reset relevant unread count on the session
  const update = isAdmin ? { adminUnreadCount: 0 } : { unreadCount: 0 };
  // Use setDoc with merge to safely update or create if missing (prevent 'No document to update')
  await setDoc(chatRef, update, { merge: true });

  // 2. Mark individual messages as seen (Client-side implementation)
  // Query messages where sender is NOT the current viewer (isAdmin ? user : admin)
  // and status is NOT 'seen'.

  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(
    messagesRef,
    // We want messages sent by the 'other' party that are not yet seen
    where("status", "!=", "seen")
    // Note: In a real app we'd also filter by senderId != currentUser.uid
    // But here we rely on the fact that if isAdmin calls this, they want to mark User messages as seen.
  );

  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  let hasUpdates = false;

  snapshot.docs.forEach((docSnapshot) => {
    const data = docSnapshot.data() as ChatMessage;
    // Only mark as seen if the sender is NOT the person viewing it
    // If isAdmin is true, we want to mark messages sent by user (senderId !== 'admin')
    // If isAdmin is false, we want to mark messages sent by 'admin'
    const isMessageFromOther = isAdmin
      ? data.senderId !== "admin"
      : data.senderId === "admin" || data.senderId === "bot";

    if (isMessageFromOther) {
      batch.update(docSnapshot.ref, { status: "seen" });
      hasUpdates = true;
    }
  });

  if (hasUpdates) {
    await batch.commit();
  }
};

// Simplified read-reset logic for students
export const resetUserUnreadCount = async (userId: string) => {
  if (!db) return;
  const chatRef = doc(db, "chats", `${userId}_support`);
  await setDoc(chatRef, { unreadCount: 0 }, { merge: true });
};

export const toggleReaction = async (
  chatId: string,
  messageId: string,
  userId: string,
  emoji: string
) => {
  if (!db) return;
  const msgRef = doc(db, `chats/${chatId}/messages`, messageId);
  const msgSnap = await getDoc(msgRef);

  if (msgSnap.exists()) {
    const data = msgSnap.data();
    const reactions = data.reactions || {};

    if (reactions[userId] === emoji) {
      delete reactions[userId]; // Remove if clicked again
    } else {
      reactions[userId] = emoji; // Add/Update
    }

    await updateDoc(msgRef, { reactions });
  }
};

export const deleteMessage = async (chatId: string, messageId: string) => {
  if (!db) return;
  const msgRef = doc(db, `chats/${chatId}/messages`, messageId);
  await updateDoc(msgRef, {
    isDeleted: true,
    text: "🚫 This message was deleted",
  });
};

export const clearChatHistory = async (userId: string) => {
  if (!db) return;
  const messagesRef = collection(db, "chats", userId, "messages");
  const snapshot = await getDocs(messagesRef);
  const batch = writeBatch(db);

  snapshot.docs.forEach((docSnapshot) => {
    batch.delete(docSnapshot.ref);
  });

  // Delete the entire chat session document so it doesn't appear in admin inbox
  const chatRef = doc(db, "chats", userId);
  batch.delete(chatRef);

  await batch.commit();
};
