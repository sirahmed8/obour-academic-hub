"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useAuth, useLanguage } from "@/contexts";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc } from "firebase/firestore";
import {
  sendMessage,
  markMessagesAsSeen,
  clearChatHistory,
  toggleReaction,
  deleteMessage,
} from "@/lib/chatUtils";
import { ChatMessage } from "@/types";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ChatMessages } from "./chatbot/ChatMessages";
import { ChatInput } from "./chatbot/ChatInput";
import { Headphones } from "lucide-react";
import { motion as m } from "framer-motion";

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

  // Refs to track state inside effect without triggering re-subscription
  const isOpenRef = useRef(isOpen);
  const languageRef = useRef(language);

  // Update refs when state changes
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

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
          // Use ref to check if open, avoiding effect re-run
          if (!isOpenRef.current) {
            const currentLang = languageRef.current;
            toast.info(currentLang === "ar" ? "رد جديد من الدعم" : "New reply from support", {
              action: {
                label: currentLang === "ar" ? "فتح" : "Open",
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
  }, [user]); // Removed isOpen and language from dependencies

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
              attachmentUrl: replyTo.attachmentUrl,
              attachmentType: replyTo.attachmentType,
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

  const handleDeleteMessage = async (msgId: string) => {
    if (!user) return;
    try {
      await deleteMessage(user.uid, msgId);
      toast.success(language === "ar" ? "تم حذف الرسالة" : "Message deleted");
    } catch {
      toast.error(language === "ar" ? "فشل حذف الرسالة" : "Failed to delete message");
    }
  };

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
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="fixed bottom-6 right-6 z-200 p-4 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 duration-200 ease-out sm:w-16 sm:h-16 w-14 h-14 flex items-center justify-center"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <m.div
                className="text-white"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Headphones className="w-7 h-7" />
              </m.div>
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed bottom-24 right-6 z-200 w-[380px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-8rem)] rounded-2xl flex flex-col overflow-hidden origin-bottom-right shadow-2xl glass-premium"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shadow-inner text-primary">
                  <Headphones className="w-6 h-6" />
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
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors active:scale-95"
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
              onDelete={handleDeleteMessage}
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
