"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Headphones } from "lucide-react";
import { useAuth, useLanguage } from "@/contexts";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc } from "firebase/firestore";
import { sendMessage, markMessagesAsSeen, clearChatHistory, toggleReaction } from "@/lib/chatUtils";
import { ChatMessage } from "@/types";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ChatMessages } from "./chatbot/ChatMessages";
import { ChatInput } from "./chatbot/ChatInput";

/**
 * LiveSupportChat - Live Support Chat Component
 * Simplified version for live human support only (bot removed).
 */
export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Interaction State
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  // Firestore Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { user } = useAuth();
  const { language } = useLanguage();

  // Listen for messages (live support only)
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, `chats/${user.uid}/messages`), orderBy("timestamp", "asc"));

    let prevCount = 0;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(
        (docSnapshot) =>
          ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }) as ChatMessage
      );

      // Filter only live support messages
      const liveMessages = msgs.filter((m) => m.context === "live" || !m.context);

      if (liveMessages.length > prevCount && prevCount > 0) {
        const lastMsg = liveMessages[liveMessages.length - 1];
        if (lastMsg.senderId === "admin") {
          if (!isOpen) {
            toast.info(language === "ar" ? "رد جديد من الدعم" : "New reply from support", {
              action: {
                label: language === "ar" ? "فتح" : "Open",
                onClick: () => {
                  setIsOpen(true);
                },
              },
            });
          }
        }
      }

      setMessages(liveMessages);
      prevCount = liveMessages.length;
    });

    return () => unsubscribe();
  }, [user, isOpen, language]);

  // Listen to Chat Session (Unread Count)
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "chats", user.uid), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setUnreadCount(data.unreadCount || 0);
      }
    });
    return () => unsub();
  }, [user]);

  // Handle Send (live support only)
  const handleSend = async (
    textOverride?: string,
    attachment?: {
      url: string;
      name: string;
      size: number;
      type: "image" | "document";
    }
  ) => {
    const textToSend = textOverride || input;
    if ((!textToSend.trim() && !attachment) || !user) return;

    if (!textOverride) {
      setInput("");
      setReplyTo(null);
    }

    try {
      // Send User Message to Live Support
      await sendMessage(
        user.uid,
        textToSend,
        user.uid,
        user.displayName || "User",
        false, // isAdmin
        replyTo
          ? {
              id: replyTo.id,
              text: replyTo.text,
              senderName: replyTo.senderName || "User",
            }
          : undefined,
        "live", // always live context
        attachment ? { ...attachment, type: attachment.type } : undefined
      );

      // Reset Input
      setInput("");
      setReplyTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(language === "ar" ? "فشل إرسال الرسالة" : "Failed to send message");
    }
  };

  const confirmClearChat = async () => {
    if (!user) return;
    try {
      await clearChatHistory(user.uid);
      toast.success(language === "ar" ? "تم مسح المحادثة" : "Chat history cleared");
      setShowClearConfirm(false);
    } catch {
      toast.error("Failed to clear history");
    }
  };

  const toggleChat = () => {
    if (!isOpen) {
      // Opening...
      setIsOpen(true);
      if (user && unreadCount > 0) {
        markMessagesAsSeen(user.uid, false);
      }
    } else {
      // Closing...
      setIsOpen(false);
    }
  };

  const handleReaction = useCallback(
    async (msg: ChatMessage, emoji: string) => {
      if (!user) return;
      await toggleReaction(user.uid, msg.id, user.uid, emoji);
    },
    [user]
  );

  if (!user) return null;

  return (
    <>
      <ConfirmationModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={confirmClearChat}
        title={language === "ar" ? "مسح المحادثة" : "Clear Chat History"}
        message={
          language === "ar"
            ? "هل أنت متأكد أنك تريد مسح جميع الرسائل؟ لا يمكن التراجع عن هذا الإجراء."
            : "Are you sure you want to clear all messages? This action cannot be undone."
        }
        confirmText={language === "ar" ? "مسح" : "Clear"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
      />
      {/* Floating Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 p-4 bg-green-600 text-white rounded-full shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/30 transition-all"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" className="relative">
              <Headphones className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="glass-container fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white/70 dark:bg-black/40 backdrop-blur-xl backdrop-saturate-150 border border-green-500/20 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden origin-bottom-right"
          >
            {/* Header - Simplified Live Support Only */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-green-600/10 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shadow-inner">
                  <Headphones className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {language === "ar" ? "الدعم المباشر" : "Live Support"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {language === "ar" ? "متصل الآن" : "Online"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-full transition-colors"
                  title={language === "ar" ? "مسح السجل" : "Clear History"}
                  aria-label={language === "ar" ? "مسح السجل" : "Clear history"}
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-muted rounded-full"
                  aria-label={language === "ar" ? "إغلاق" : "Close"}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <ChatMessages
              messages={messages}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              user={user as any}
              onReply={setReplyTo}
              onReact={handleReaction}
            />

            <ChatInput
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
