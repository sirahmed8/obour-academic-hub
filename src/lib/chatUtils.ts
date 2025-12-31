import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc, setDoc, increment } from 'firebase/firestore';

// Types
export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  timestamp: any; // Firestore Timestamp
  status: 'sent' | 'delivered' | 'seen';
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  reactions?: Record<string, string>; // userId -> emoji
  isDeleted?: boolean;
  type?: 'text' | 'image' | 'system';
}

export interface ChatSession {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: any;
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
  replyTo?: ChatMessage['replyTo']
) => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  const chatRef = doc(db, 'chats', chatId);

  // 1. Add Message
  await addDoc(messagesRef, {
    text,
    senderId,
    timestamp: serverTimestamp(),
    status: 'sent',
    replyTo: replyTo || null,
    reactions: {},
    isDeleted: false,
    type: 'text'
  });

  // 2. Update Chat Session Metadata
  const chatUpdate: any = {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
    isTyping: false
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

export const markMessagesAsSeen = async (chatId: string, isAdmin: boolean) => {
  const chatRef = doc(db, 'chats', chatId);
  
  // Reset relevant unread count
  const update = isAdmin 
    ? { adminUnreadCount: 0 } 
    : { unreadCount: 0 };
    
  await updateDoc(chatRef, update);
  
  // Note: Updating individual message 'status' to 'seen' would usually happen 
  // in a Cloud Function to avoid N writes from the client, 
  // but for small scale we can do it or rely on the aggregate 'unreadCount' for UI.
};

export const toggleReaction = async (chatId: string, messageId: string, userId: string, emoji: string) => {
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
    text: '🚫 This message was deleted' 
  });
};
