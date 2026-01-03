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
export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  timestamp: { seconds: number; nanoseconds: number } | null; // Firestore Timestamp
  status: "sent" | "delivered" | "seen";
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  reactions?: Record<string, string>; // userId -> emoji
  isDeleted?: boolean;
  type?: "text" | "image" | "system";
}

export interface ChatSession {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: { seconds: number; nanoseconds: number } | null;
  unreadCount: number; // For User (how many admin messages they haven't seen)
  adminUnreadCount: number; // For Admin (how many user messages admin hasn't seen)
  isTyping?: boolean;
}

// Helpers
export const sendMessage = async (
  chatId: string,
  text: string,
  senderId: string,
  senderName: string,
  isAdmin: boolean = false,
  replyTo?: ChatMessage["replyTo"]
) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const chatRef = doc(db, "chats", chatId);

  // Filter profanity before saving
  const filteredText = filterProfanity(text);

  // 1. Add Message
  await addDoc(messagesRef, {
    text: filteredText,
    senderId,
    senderName, // Include sender name for display
    timestamp: serverTimestamp(),
    status: "sent",
    replyTo: replyTo || null,
    reactions: {},
    isDeleted: false,
    type: "text",
  });

  // 2. Update Chat Session Metadata
  const chatUpdate: Record<string, unknown> = {
    lastMessage: filteredText,
    lastMessageTime: serverTimestamp(),
    isTyping: false,
  };

  // Increment unread counts
  if (isAdmin) {
    chatUpdate.unreadCount = increment(1); // User has 1 new message
  } else {
    chatUpdate.adminUnreadCount = increment(1); // Admin has 1 new message
    // Ensure basic info is set if it's the first message
    chatUpdate.userId = chatId;
    chatUpdate.userName = senderName;
  }

  // Use setDoc with merge to handle creation if it doesn't exist
  await setDoc(chatRef, chatUpdate, { merge: true });
};

// Mark messages as seen (both session count and individual messages)
export const markMessagesAsSeen = async (chatId: string, isAdmin: boolean) => {
  const chatRef = doc(db, "chats", chatId);

  // 1. Reset relevant unread count on the session
  const update = isAdmin ? { adminUnreadCount: 0 } : { unreadCount: 0 };
  await updateDoc(chatRef, update);

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
      : data.senderId === "admin";

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
  batch.update(chatRef, {
    lastMessage: "",
    lastMessageTime: null,
    unreadCount: 0,
    adminUnreadCount: 0,
  });

  await batch.commit();
};
