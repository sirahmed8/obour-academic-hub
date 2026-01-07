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
import { ChatMessage } from "@/types";

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
  additionalData?: { action?: "confirm_task" | "live_chat"; taskData?: any }
) => {
  if (!text.trim() && !attachment && !additionalData?.taskData) return;

  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const timestamp = serverTimestamp();

  // Filter profanity before saving for the message content
  const filteredText = filterProfanity(text);

  // 1. Add Message
  await addDoc(messagesRef, {
    text: filteredText,
    senderId,
    senderName,
    timestamp,
    status: isAdmin ? "seen" : "sent", // Admin msgs are seen by definition (by admin)
    replyTo: replyTo || null, // Ensure explicit null if undefined
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
    ...(additionalData || {}),
  });

  // 2. Update Chat Session Metadata
  const chatRef = doc(db, "chats", chatId);

  // Only update notification counts if it is NOT a bot message (unless we want to track bot usage?)
  // For now, let's track everything but maybe distinguishing in UI is better.
  const updateData: Record<string, unknown> = {
    lastMessage: filteredText, // Use filtered text for last message
    lastMessageTime: timestamp,
    userName: senderName, // Keep name updated
    isTyping: false, // Ensure isTyping is reset
  };

  if (!isAdmin) {
    if (context === "live") {
      updateData.adminUnreadCount = increment(1);
    }
    // Ensure basic info is set if it's the first message from user
    updateData.userId = chatId;
    updateData.userName = senderName;
    // We might want to track separate unread counts for bot?
    // updateData.botUnreadCount = increment(1);
  } else {
    updateData.unreadCount = increment(1);
  }

  // Use setDoc with merge to handle creation if it doesn't exist
  await setDoc(chatRef, updateData, { merge: true });
};

// Mark messages as seen (both session count and individual messages)
export const markMessagesAsSeen = async (chatId: string, isAdmin: boolean) => {
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
    const isMessageFromOther = isAdmin ? data.senderId !== "admin" : data.senderId === "admin";

    if (isMessageFromOther) {
      batch.update(docSnapshot.ref, { status: "seen" });
      hasUpdates = true;
    }
  });

  if (hasUpdates) {
    await batch.commit();
  }
};

export const toggleReaction = async (
  chatId: string,
  messageId: string,
  userId: string,
  emoji: string
) => {
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
  const msgRef = doc(db, `chats/${chatId}/messages`, messageId);
  await updateDoc(msgRef, {
    isDeleted: true,
    text: "🚫 This message was deleted",
  });
};

export const clearChatHistory = async (userId: string) => {
  const messagesRef = collection(db, "chats", userId, "messages");
  const snapshot = await getDocs(messagesRef);
  const batch = writeBatch(db);

  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Reset session metadata
  const chatRef = doc(db, "chats", userId);
  batch.set(
    chatRef,
    {
      lastMessage: "",
      lastMessageTime: null,
      unreadCount: 0,
      adminUnreadCount: 0,
    },
    { merge: true }
  );

  await batch.commit();
};
