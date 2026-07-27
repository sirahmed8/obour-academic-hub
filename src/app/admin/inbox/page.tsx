"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { useLanguage, useAuth } from "@/contexts";

import { toast } from "sonner";
import {
  sendMessage,
  markMessagesAsSeen,
  toggleReaction,
  deleteMessage,
  clearChatHistory,
} from "@/lib/chatUtils";
import { ChatSession, ChatMessage } from "@/types";
import { toDate } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { InboxLayout } from "@/components/features/inbox/InboxLayout";
import { ChatList } from "@/components/features/inbox/ChatList";
import { ChatWindow } from "@/components/features/inbox/ChatWindow";

export default function AdminInboxPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; sessionId: string | null }>({
    open: false,
    sessionId: null,
  });

  const { language } = useLanguage();
  const { user, hasPermission } = useAuth();
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  const canDelete = hasPermission("delete_chats");

  const handleDeleteSession = async () => {
    if (!deleteConfirm.sessionId) return;

    try {
      await clearChatHistory(deleteConfirm.sessionId);
      toast.success(language === "ar" ? "تم حذف المحادثة" : "Chat deleted successfully");
      if (selectedSessionId === deleteConfirm.sessionId) {
        setSelectedSessionId(null);
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error(language === "ar" ? "فشل حذف المحادثة" : "Failed to delete chat");
    } finally {
      setDeleteConfirm({ open: false, sessionId: null });
    }
  };

  // 1. Listen to Chat Sessions
  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "chats"), orderBy("lastMessageTime", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ userId: doc.id, ...doc.data() }) as ChatSession);
        setSessions(data);
        setLoadingSessions(false);
      },
      (error) => {
        console.error("Error fetching chat sessions:", error);
        toast.error("Failed to load chats");
        setLoadingSessions(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const timeA = a.lastMessageTime ? toDate(a.lastMessageTime).getTime() : 0;
    const timeB = b.lastMessageTime ? toDate(b.lastMessageTime).getTime() : 0;
    return timeB - timeA;
  });

  const togglePin = async (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    if (!db) return;
    try {
      await updateDoc(doc(db, "chats", session.userId), { isPinned: !session.isPinned });
      toast.success(session.isPinned ? "Chat unpinned" : "Chat pinned");
    } catch {
      toast.error("Failed to update chat");
    }
  };

  const toggleReadStatus = async (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    if (!db) return;
    try {
      const newCount = (session.adminUnreadCount || 0) > 0 ? 0 : 1;
      await updateDoc(doc(db, "chats", session.userId), { adminUnreadCount: newCount });
      toast.success(newCount === 0 ? "Marked as read" : "Marked as unread");
    } catch {
      toast.error("Failed to update status");
    }
  };

  // 2. Listen to Messages
  useEffect(() => {
    if (!db || !selectedSessionId) {
      // Just clear messages if needed, or let the loading state handle it.
      // But setting state here causes the lint error.
      // Actually, we can just return. The previous effect cleanup will stop the listener.
      // If we really want to clear messages, we should do it when selectedSessionId changes to null,
      // not inside the effect that watches it (although that's where we usually react).
      // A better pattern is to setMessages([]) where we setSelectedSessionId(null).
      // For now, removing the call to fix the lint error.
      return;
    }

    // setLoadingMessages(true); // Moved to handleSelectSession to avoid effect warning
    markMessagesAsSeen(selectedSessionId, true);

    const q = query(
      collection(db, `chats/${selectedSessionId}/messages`),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allMsgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as ChatMessage);
        setMessages(allMsgs);
        setLoadingMessages(false);
        // Mark as seen immediately when new messages arrive
        if (allMsgs.length > 0) {
          markMessagesAsSeen(selectedSessionId, true);
        }
      },
      (error) => {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
        setLoadingMessages(false);
      }
    );

    return () => unsubscribe();
  }, [selectedSessionId]);

  const handleSend = async (
    text?: string,
    attachment?: { url: string; name: string; size: number; type: "image" | "document" }
  ) => {
    const textToSend = text || input;
    if ((!textToSend.trim() && !attachment) || !selectedSessionId || !user) return;

    // Only clear input if text was provided (meaning it was not just an attachment)
    // Actually ChatInput clears its own input, but we sync state here.
    // If textOverride is passed, ChatInput clears local state. We must clear parent state.
    if (!text) {
      setInput("");
    }

    try {
      await sendMessage(
        selectedSessionId,
        textToSend,
        "admin",
        "Admin Support",
        true, // isAdmin = true
        replyTo
          ? {
              id: replyTo.id,
              text: replyTo.text,
              senderName: replyTo.senderName || "User",
              attachmentUrl: replyTo.attachmentUrl,
              attachmentType: replyTo.attachmentType,
            }
          : undefined,
        "live",
        attachment
      );
      setReplyTo(null);
    } catch (err) {
      toast.error("Failed to send message");
      console.error(err);
    }
  };

  return (
    <>
      <InboxLayout
        isChatSelected={!!selectedSessionId}
        sidebar={
          <ChatList
            sessions={sortedSessions}
            selectedSessionId={selectedSessionId}
            onSelectSession={(id) => {
              if (id !== selectedSessionId) {
                setLoadingMessages(true);
                setSelectedSessionId(id);
              }
            }}
            isLoading={loadingSessions}
            onTogglePin={togglePin}
            onToggleRead={toggleReadStatus}
            onDeleteSession={(id) => setDeleteConfirm({ open: true, sessionId: id })}
          />
        }
        chat={
          <ChatWindow
            session={sessions.find((s) => s.userId === selectedSessionId) || null}
            messages={messages}
            loadingMessages={loadingMessages}
            input={input}
            setInput={setInput}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            onSendMessage={handleSend}
            onBack={() => setSelectedSessionId(null)}
            onDeleteChat={() => {
              if (!canDelete) {
                toast.error(
                  language === "ar"
                    ? "ليس لديك صلاحية حذف المحادثات"
                    : "You don't have permission to delete chats"
                );
                return;
              }
              if (selectedSessionId) {
                setDeleteConfirm({ open: true, sessionId: selectedSessionId });
              }
            }}
            onDeleteMessage={(id) => {
              if (!canDelete) return;
              if (selectedSessionId) {
                deleteMessage(selectedSessionId, id);
              }
            }}
            onReaction={(msgId, emoji) => {
              if (selectedSessionId) {
                toggleReaction(selectedSessionId, msgId, "admin", emoji);
              }
            }}
            canDelete={canDelete}
          />
        }
      />

      <ConfirmationModal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, sessionId: null })}
        onConfirm={handleDeleteSession}
        title={language === "ar" ? "حذف المحادثة" : "Delete Chat"}
        message={
          language === "ar"
            ? "هل أنت متأكد من حذف هذا الشات للجميع؟"
            : "Are you sure you want to delete this chat for everyone?"
        }
        confirmText={language === "ar" ? "حذف" : "Delete"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        type="danger"
      />
    </>
  );
}
