"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  writeBatch,
} from "firebase/firestore";
import { useLanguage, useAuth } from "@/contexts";
import { AppShell } from "@/components/layout/AppShell";
import {
  MessageSquare,
  Send,
  Check,
  CheckCheck,
  Trash2,
  Search,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ChatSession,
  ChatMessage,
  sendMessage,
  markMessagesAsSeen,
} from "@/lib/chatUtils";
import Image from "next/image";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function AdminInboxPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();
  const { user } = useAuth();

  // 1. Listen to Chat Sessions (Users who messaged)
  useEffect(() => {
    // We listen to the 'chats' collection
    const q = query(
      collection(db, "chats"),
      orderBy("lastMessageTime", "desc")
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) =>
            ({
              userId: doc.id,
              ...doc.data(),
            } as ChatSession)
        );
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

  // 2. Listen to Messages for Selected Session
  useEffect(() => {
    if (!selectedSessionId) {
      return;
    }

    // Mark as seen immediately when opening
    markMessagesAsSeen(selectedSessionId, true);

    const q = query(
      collection(db, `chats/${selectedSessionId}/messages`),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as ChatMessage)
        );
        setMessages(msgs);
      },
      (error) => {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      }
    );

    return () => unsubscribe();
  }, [selectedSessionId]);

  // Auto-scroll
  useEffect(() => {
    if (selectedSessionId) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedSessionId]);

  const handleSend = async () => {
    if (!input.trim() || !selectedSessionId || !user) return;

    const text = input.trim();
    setInput("");

    // Optimistic UI update could happen here, but Firestore listener is fast enough usually
    try {
      await sendMessage(
        selectedSessionId,
        text,
        "admin",
        "Admin Support",
        true
      );
    } catch (err) {
      toast.error("Failed to send message");
      console.error(err);
    }
  };

  const deleteChatForEveryone = async () => {
    if (!selectedSessionId) return;
    setShowDeleteModal(true);
  };

  const confirmDeleteChat = async () => {
    if (!selectedSessionId) return;
    setShowDeleteModal(false);

    const batch = writeBatch(db);

    messages.forEach((msg) => {
      const ref = doc(db, `chats/${selectedSessionId}/messages`, msg.id);
      batch.delete(ref);
    });

    const sessionRef = doc(db, "chats", selectedSessionId);
    batch.delete(sessionRef);

    await batch.commit();
    toast.success(language === "ar" ? "تم حذف المحادثة" : "Chat deleted");
    setMessages([]);
    setSelectedSessionId(null);
  };

  const formatTime = (timestamp: unknown) => {
    if (!timestamp) return "";
    let date: Date;
    if (
      typeof timestamp === "object" &&
      timestamp !== null &&
      "toDate" in timestamp
    ) {
      date = (timestamp as { toDate: () => Date }).toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp as string | number);
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const selectedSession = sessions.find((s) => s.userId === selectedSessionId);

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-theme(spacing.20))] max-w-[1600px] mx-auto overflow-hidden bg-background">
        {/* Sidebar - Chat List */}
        <div
          className={cn(
            "w-full lg:w-96 border-r border-border flex flex-col bg-card",
            selectedSessionId ? "hidden lg:flex" : "flex"
          )}
        >
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h1 className="font-bold text-xl flex items-center gap-2">
              <MessageSquare className="text-primary" />
              {t("admin.inbox")}
            </h1>
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
              {sessions.reduce((acc, s) => acc + (s.adminUnreadCount || 0), 0)}{" "}
              New
            </div>
          </div>

          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                placeholder={language === "ar" ? "بحث..." : "Search users..."}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-muted/50 border-none text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingSessions ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No active chats
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.userId}
                  onClick={() => {
                    setMessages([]);
                    setSelectedSessionId(session.userId);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border/50",
                    selectedSessionId === session.userId &&
                      "bg-primary/5 border-l-4 border-l-primary"
                  )}
                >
                  <Image
                    src={`https://ui-avatars.com/api/?name=${
                      session.userName || "User"
                    }&background=random`}
                    alt={session.userName}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold truncate text-sm">
                        {session.userName}
                      </h3>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTime(session.lastMessageTime)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm truncate",
                        (session.adminUnreadCount || 0) > 0
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground"
                      )}
                    >
                      {session.lastMessage}
                    </p>
                  </div>
                  {(session.adminUnreadCount || 0) > 0 && (
                    <div className="min-w-[20px] h-5 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-bold px-1.5 animate-pulse">
                      {session.adminUnreadCount}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div
          className={cn(
            "flex-1 flex flex-col bg-muted/10 h-full",
            !selectedSessionId ? "hidden lg:flex" : "flex"
          )}
        >
          {selectedSessionId ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-border bg-card flex items-center px-6 justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setMessages([]);
                      setSelectedSessionId(null);
                    }}
                    className="lg:hidden p-2 -ml-2 hover:bg-muted rounded-full"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <Image
                    src={`https://ui-avatars.com/api/?name=${
                      selectedSession?.userName || "User"
                    }&background=random`}
                    alt="User"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <h2 className="font-bold leading-tight">
                      {selectedSession?.userName}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedSession?.userEmail}
                    </p>
                  </div>
                </div>

                <button
                  onClick={deleteChatForEveryone}
                  title="Delete chat for everyone"
                  className="p-2 text-destructive bg-destructive/10 rounded-xl hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/10">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[70%]",
                      msg.senderId === "admin"
                        ? "ml-auto items-end"
                        : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "p-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed min-w-[80px]",
                        msg.senderId === "admin"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-card text-foreground rounded-bl-none"
                      )}
                    >
                      {msg.text}
                      {msg.senderId === "admin" && (
                        <div className="flex justify-end mt-1">
                          {msg.status === "seen" ? (
                            <CheckCheck size={14} className="text-blue-200" />
                          ) : msg.status === "delivered" ? (
                            <CheckCheck size={14} className="opacity-70" />
                          ) : (
                            <Check size={14} className="opacity-70" />
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-card border-t border-border">
                <div className="flex items-center gap-3 max-w-4xl mx-auto">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 bg-muted/50 px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={40} className="opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Admin Chat Dashboard
              </h3>
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteChat}
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
    </AppShell>
  );
}
