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
import { AddTodoModal } from "@/components/features/todo/AddTodoModal";

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
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [taskToEdit, setTaskToEdit] = useState<any>(undefined);

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
        false, // isAdmin
        replyTo
          ? {
              id: replyTo.id,
              text: replyTo.text,
              senderName: replyTo.senderName || "User",
            }
          : undefined,
        mode, // context
        attachment ? { ...attachment, type: attachment.type } : undefined
      );

      // Reset Input
      setInput("");
      setReplyTo(null);

      // 2. Handle Bot Response
      if (mode === "bot") {
        setIsTyping(true);
        try {
          const localResponse = await getLocalBotResponse(textToSend, language as "en" | "ar");
          const botResponse = localResponse.text;

          // Send Bot Message
          await sendMessage(
            user.uid,
            botResponse,
            "bot",
            language === "ar" ? "مساعد العبور" : "Obour Bot",
            true,
            undefined,
            "bot",
            undefined,
            {
              action: localResponse.action as "confirm_task" | "live_chat" | undefined,
              taskData: localResponse.taskData,
            }
          );
        } catch (error) {
          console.error("Bot Error:", error);
          // Send a fallback error message so user knows something went wrong
          try {
            await sendMessage(
              user.uid,
              language === "ar"
                ? "عذراً، حدث خطأ أثناء معالجة رسالتك. يرجى المحاولة مرة أخرى أو التواصل مع الدعم المباشر. 🔧"
                : "Sorry, an error occurred while processing your message. Please try again or contact live support. 🔧",
              "bot",
              language === "ar" ? "مساعد العبور" : "Obour Bot",
              true,
              undefined,
              "bot"
            );
          } catch (fallbackError) {
            console.error("Failed to send fallback message:", fallbackError);
            toast.error(
              language === "ar"
                ? "حدث خطأ، يرجى المحاولة مرة أخرى"
                : "An error occurred, please try again"
            );
          }
        } finally {
          setIsTyping(false);
          setStreamingText("");
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(language === "ar" ? "فشل إرسال الرسالة" : "Failed to send message");
    }
  };

  const handleTaskAction = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (action: "confirm" | "edit", taskData: any) => {
      if (!user) return;

      if (action === "edit") {
        setTaskToEdit(taskData);
        setIsTaskModalOpen(true);
      } else {
        try {
          await addDoc(collection(db, `users/${user.uid}/tasks`), {
            ...taskData,
            userId: user.uid,
            completed: false,
            createdAt: serverTimestamp(),
            orderIndex: 0,
          });
          // The bot message is now sent via onSuccess in AddTodoModal
          toast.success(language === "ar" ? "تم إضافة المهمة" : "Task added");
        } catch (error) {
          console.error(error);
          toast.error("Failed to create task");
        }
      }
    },
    [user, language]
  );

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
        className="fixed bottom-6 right-6 z-50 p-4 bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
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
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white/10 dark:bg-black/10 backdrop-blur-xl backdrop-saturate-150 border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden origin-bottom-right supports-[backdrop-filter]:bg-white/5 supports-[backdrop-filter]:dark:bg-black/10"
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
              onTaskAction={handleTaskAction}
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

      <AddTodoModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        initialData={taskToEdit}
        onSuccess={() => {
          if (user) {
            sendMessage(
              user.uid,
              language === "ar" ? "تم إنشاء المهمة بنجاح ✅" : "Task created successfully ✅",
              "bot",
              language === "ar" ? "مساعد العبور" : "Obour Bot",
              true,
              undefined,
              "bot"
            );
          }
        }}
      />
    </>
  );
}
