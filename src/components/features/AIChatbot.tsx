"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import { useAuth, useLanguage } from "@/contexts";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { sendMessage, markMessagesAsSeen, clearChatHistory, toggleReaction } from "@/lib/chatUtils";
import { ChatMessage } from "@/types";
import { getLocalBotResponse } from "@/lib/bot";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ChatHeader } from "./chatbot/ChatHeader";
import { ChatMessages } from "./chatbot/ChatMessages";
import { ChatInput } from "./chatbot/ChatInput";

/**
 * AIChatbot - Main Chatbot Component
 * Refactored to use sub-components for better maintainability.
 */
export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"bot" | "live">("bot");
  const [isTyping, setIsTyping] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  // Interaction State
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  // Firestore Messages State
  // Firestore Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { user } = useAuth();
  // We need to cast user to any here or update the props in ChatMessages/AIChatbot to match.
  // Ideally, useAuth's user type should match what ChatMessages expects.
  // For now, ensuring we pass a compatible object or fixing prop types is key.
  // The lint error was "Type 'User' is missing properties...".
  // Let's assert user as any for the sub-component if types don't align, or better yet, fix the interface.
  // Looking at ChatMessages, it expects 'User' from 'firebase/auth' likely.
  // Let's check useAuth definition. It likely returns a local wrapper or firebase User.
  const { language } = useLanguage();

  // Listen for messages
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, `chats/${user.uid}/messages`), orderBy("timestamp", "asc"));

    let prevCount = 0;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as ChatMessage
      );

      if (msgs.length > prevCount && prevCount > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (
          lastMsg.senderId === "admin" ||
          (lastMsg.senderId === "bot" && lastMsg.context === "bot")
        ) {
          const isRelevantMode = lastMsg.context === mode;
          if (!isOpen || !isRelevantMode) {
            toast.info(
              lastMsg.senderId === "admin"
                ? language === "ar"
                  ? "رد جديد من الدعم"
                  : "New reply from support"
                : language === "ar"
                  ? "رد جديد من المساعد الذكي"
                  : "New reply from Bot",
              {
                action: {
                  label: language === "ar" ? "فتح" : "Open",
                  onClick: () => {
                    setIsOpen(true);
                    setMode(lastMsg.context === "bot" ? "bot" : "live");
                  },
                },
              }
            );
          }
        }
      }

      setMessages(msgs);
      prevCount = msgs.length;
    });

    return () => unsubscribe();
  }, [user, isOpen, language, mode]);

  // Filter messages by mode
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (mode === "bot") return m.context === "bot";
      return m.context === "live" || !m.context;
    });
  }, [messages, mode]);

  // Handle Send
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
      // Send User Message
      await sendMessage(
        user.uid,
        textToSend,
        user.uid,
        user.displayName || "User",
        false,
        replyTo
          ? {
              id: replyTo.id,
              text: replyTo.text,
              senderName: replyTo.senderName || "User",
            }
          : undefined,
        mode,
        attachment
      );

      // Bot Mode Response
      if (mode === "bot") {
        setIsTyping(true);

        try {
          // ALWAYS use LocalBot - external APIs are disabled for reliability
          const localResponse = await getLocalBotResponse(textToSend, language as "en" | "ar");
          let botResponse = localResponse.text;

          // If low confidence, append live support suggestion
          if (localResponse.confidence < 0.5) {
            botResponse +=
              "\n\n" +
              (language === "ar"
                ? "💬 هل تريد التحدث مع الدعم المباشر؟ اضغط على زر LIVE CHAT في الأعلى."
                : "💬 Would you like to talk to live support? Click the LIVE CHAT button above.");
          }

          // Send Bot Message
          await sendMessage(
            user.uid,
            botResponse,
            "bot",
            language === "ar" ? "مساعد العبور" : "Obour Bot",
            true,
            undefined,
            "bot"
          );
        } catch (error) {
          console.error("Bot Error:", error);
          const errorMessage = error instanceof Error ? error.message : "Unknown error";

          // Show error with report option
          toast.error(language === "ar" ? "حدث خطأ في الرد" : "Error getting response", {
            action: {
              label: language === "ar" ? "إبلاغ" : "Report",
              onClick: async () => {
                await reportError(errorMessage, textToSend);
              },
            },
          });
        } finally {
          setIsTyping(false);
          setStreamingText("");
        }
      }
    } catch (error) {
      console.error("Send Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      toast.error(language === "ar" ? "فشل الإرسال" : "Failed to send", {
        action: {
          label: language === "ar" ? "إبلاغ" : "Report",
          onClick: async () => {
            await reportError(errorMessage, textToSend, "chat_send_error");
          },
        },
      });
      if (!textOverride && !attachment) setInput(textToSend);
    }
  };

  const reportError = async (
    message: string,
    userInput?: string,
    type: string = "chatbot_error"
  ) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "system_errors"), {
        type,
        message,
        userId: user.uid,
        userEmail: user.email,
        model: "local",
        userInput,
        timestamp: serverTimestamp(),
        status: "open",
        userAgent: window.navigator.userAgent,
        url: window.location.href,
      });
      toast.success(
        language === "ar"
          ? "تم إرسال البلاغ بنجاح. شكراً لك!"
          : "Report sent successfully. Thank you!"
      );
    } catch {
      toast.error(language === "ar" ? "فشل إرسال البلاغ" : "Failed to send report");
    }
  };

  const handleClearHistory = async () => {
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
    setIsOpen((prev) => !prev);
    if (!isOpen && user) {
      markMessagesAsSeen(user.uid, false);
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
        onConfirm={handleClearHistory}
        title={language === "ar" ? "مسح المحادثة؟" : "Clear History?"}
        message={
          language === "ar"
            ? "سيتم حذف جميع الرسائل من السجل."
            : "This will delete all messages from your history."
        }
      />

      {/* Floating Button */}
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow w-14 h-14 flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" className="relative">
              <MessageSquare className="w-6 h-6" />
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
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden origin-bottom-right"
          >
            <ChatHeader
              mode={mode}
              setMode={setMode}
              setIsOpen={setIsOpen}
              onClearHistory={() => setShowClearConfirm(true)}
            />

            <ChatMessages
              messages={filteredMessages}
              streamingText={streamingText}
              isTyping={isTyping}
              mode={mode}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              user={user as any}
              onReply={setReplyTo}
              onReact={handleReaction}
              onSend={(text) => handleSend(text)}
            />

            <ChatInput
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              isTyping={isTyping}
              mode={mode}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
