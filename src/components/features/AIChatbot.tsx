"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Send,
  Headphones,
  Bot,
  MessageSquare,
  Trash2,
  Sparkles,
  Zap,
  ChevronDown,
} from "lucide-react";
import { useAuth, useLanguage } from "@/contexts";
import { cn } from "@/lib/utils";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { sendMessage, markMessagesAsSeen, clearChatHistory, toggleReaction } from "@/lib/chatUtils";
import { ChatMessage } from "@/types";
import { getLocalBotResponse } from "@/lib/localBot";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { QuickReplies } from "@/components/ui/QuickReplies";
import { QUICK_REPLIES } from "@/lib/quickReplies";
import { FileUpload } from "@/components/features/FileUpload";
import { ChatMessageItem } from "@/components/chat/ChatMessage";

// AI Model types - All FREE via OpenRouter
type AIModel = "local" | "thinking" | "balanced" | "flash";

const AI_MODEL_INFO = {
  local: {
    name: { en: "Smart Bot", ar: "البوت الذكي" },
    icon: Bot,
    description: { en: "Instant responses", ar: "ردود فورية" },
    color: "text-primary",
  },
  thinking: {
    name: { en: "Thinking", ar: "تفكير" },
    icon: Zap,
    description: { en: "Deep reasoning", ar: "تفكير عميق" },
    color: "text-purple-500",
  },
  balanced: {
    name: { en: "Balanced", ar: "متوازن" },
    icon: Bot,
    description: { en: "Best for most tasks", ar: "الأفضل لمعظم المهام" },
    color: "text-green-500",
  },
  flash: {
    name: { en: "Flash", ar: "سريع" },
    icon: Sparkles,
    description: { en: "Fast responses", ar: "ردود سريعة" },
    color: "text-blue-500",
  },
};

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"bot" | "live">("bot");
  const [isTyping, setIsTyping] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  // AI Model selection (persisted in localStorage)
  const [aiModel, setAiModel] = useState<AIModel>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("ai-model") as AIModel) || "local";
    }
    return "local";
  });

  // Interaction State
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  // Firestore Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { language } = useLanguage();

  // Persist AI model selection
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ai-model", aiModel);
    }
  }, [aiModel]);

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

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredMessages, isOpen, isTyping, replyTo, streamingText]);

  // Get AI response from API with streaming
  const getAIResponse = async (userMessage: string): Promise<string> => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Not authenticated");

    // Build conversation history for context
    const recentMessages = filteredMessages.slice(-6).map((m) => ({
      role: m.senderId === user?.uid ? "user" : "assistant",
      content: m.text,
    }));

    // Add current message
    recentMessages.push({ role: "user", content: userMessage });

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: recentMessages,
        model: aiModel === "local" ? "balanced" : aiModel,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Stream the response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamingText(fullText);
      }
    }

    setStreamingText("");
    return fullText;
  };

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

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      // Bot Mode Response
      if (mode === "bot") {
        setIsTyping(true);

        try {
          let botResponse: string;

          if (aiModel === "local") {
            // Try local bot first
            const localResponse = await getLocalBotResponse(textToSend, language as "en" | "ar");

            // If local bot has low confidence, fallback to AI
            if (localResponse.confidence < 0.5) {
              try {
                botResponse = await getAIResponse(textToSend);
              } catch {
                // If AI fails, use local response anyway
                botResponse = localResponse.text;
              }
            } else {
              botResponse = localResponse.text;
            }
          } else {
            // Direct AI response
            botResponse = await getAIResponse(textToSend);
          }

          // Send Bot Message
          await sendMessage(
            user.uid,
            botResponse,
            "bot",
            aiModel === "local"
              ? "Obour Bot"
              : AI_MODEL_INFO[aiModel].name[language as "en" | "ar"],
            true,
            undefined,
            "bot"
          );
        } catch (error) {
          console.error("Bot Error:", error);
          toast.error(language === "ar" ? "حدث خطأ في الرد" : "Error getting response");
        } finally {
          setIsTyping(false);
          setStreamingText("");
        }
      }
    } catch (error) {
      console.error("Send Error:", error);
      toast.error(language === "ar" ? "فشل الإرسال" : "Failed to send");
      if (!textOverride && !attachment) setInput(textToSend);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

  const CurrentModelIcon = AI_MODEL_INFO[aiModel].icon;

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
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-inner",
                    mode === "bot" ? "bg-primary/10" : "bg-green-500/10"
                  )}
                >
                  <AnimatePresence mode="wait">
                    {mode === "bot" ? (
                      <motion.div
                        key="bot-icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <CurrentModelIcon className={cn("w-6 h-6", AI_MODEL_INFO[aiModel].color)} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="live-icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Headphones className="w-6 h-6 text-green-600" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <h3 className="font-bold text-sm">
                    {mode === "bot"
                      ? AI_MODEL_INFO[aiModel].name[language as "en" | "ar"]
                      : language === "ar"
                        ? "الدعم المباشر"
                        : "Live Support"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        mode === "bot" ? "bg-primary" : "bg-green-500 animate-pulse"
                      )}
                    />
                    {mode === "bot"
                      ? AI_MODEL_INFO[aiModel].description[language as "en" | "ar"]
                      : language === "ar"
                        ? "متصل الآن"
                        : "Online"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* AI Model Selector (only in bot mode) */}
                {mode === "bot" && (
                  <div className="relative">
                    <button
                      onClick={() => setShowModelPicker(!showModelPicker)}
                      className="p-2 hover:bg-muted rounded-full transition-colors flex items-center gap-1"
                      title="Select AI Model"
                    >
                      <CurrentModelIcon className={cn("w-4 h-4", AI_MODEL_INFO[aiModel].color)} />
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    <AnimatePresence>
                      {showModelPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 top-full mt-1 bg-background border border-border rounded-xl shadow-xl p-2 min-w-[180px] z-50"
                        >
                          {(
                            Object.entries(AI_MODEL_INFO) as [
                              AIModel,
                              (typeof AI_MODEL_INFO)[AIModel],
                            ][]
                          ).map(([key, info]) => {
                            const Icon = info.icon;
                            return (
                              <button
                                key={key}
                                onClick={() => {
                                  setAiModel(key);
                                  setShowModelPicker(false);
                                }}
                                className={cn(
                                  "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                                  aiModel === key ? "bg-primary/10" : "hover:bg-muted"
                                )}
                              >
                                <Icon className={cn("w-5 h-5", info.color)} />
                                <div className="text-left">
                                  <p className="text-sm font-medium">
                                    {info.name[language as "en" | "ar"]}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {info.description[language as "en" | "ar"]}
                                  </p>
                                </div>
                                {aiModel === key && <span className="ml-auto text-primary">✓</span>}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-full transition-colors"
                  title={language === "ar" ? "مسح السجل" : "Clear History"}
                  aria-label={language === "ar" ? "مسح السجل" : "Clear history"}
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="h-6 w-px bg-border mx-1" />

                <button
                  onClick={() => setMode(mode === "bot" ? "live" : "bot")}
                  className={cn(
                    "px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border transition-all",
                    mode === "bot"
                      ? "bg-background border-border hover:bg-muted"
                      : "bg-green-50 border-green-200 text-green-700 font-bold"
                  )}
                >
                  {mode === "bot"
                    ? language === "ar"
                      ? "تحدث لبشري"
                      : "LIVE CHAT"
                    : language === "ar"
                      ? "البوت"
                      : "BOT"}
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

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5 scrollbar-thin scrollbar-thumb-border">
              {filteredMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-6 opacity-60">
                  {mode === "bot" ? (
                    <CurrentModelIcon className="w-12 h-12 mb-3" />
                  ) : (
                    <Headphones className="w-12 h-12 mb-3" />
                  )}
                  <p className="text-sm">
                    {language === "ar"
                      ? "لا توجد رسائل بعد. ابدأ المحادثة!"
                      : "No messages yet. Start chatting!"}
                  </p>
                </div>
              )}

              {filteredMessages.map((msg) => (
                <ChatMessageItem
                  key={msg.id}
                  message={msg}
                  user={user}
                  isUser={msg.senderId === user.uid}
                  onReply={setReplyTo}
                  onReact={handleReaction}
                />
              ))}

              {/* Streaming Text Display */}
              {streamingText && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 self-end mb-1">
                    <CurrentModelIcon className={cn("w-3 h-3", AI_MODEL_INFO[aiModel].color)} />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none shadow-sm text-sm">
                    {streamingText}
                    <span className="inline-block w-1.5 h-4 bg-primary/50 ml-1 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Typing Indicator */}
              {isTyping && !streamingText && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 self-end mb-1">
                    <CurrentModelIcon className={cn("w-3 h-3", AI_MODEL_INFO[aiModel].color)} />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-sm">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {mode === "bot" && filteredMessages.length === 0 && (
              <QuickReplies
                replies={QUICK_REPLIES}
                onSelect={(query) => {
                  handleSend(query);
                }}
                language={language as "en" | "ar"}
              />
            )}

            {/* Input Area */}
            <div className="p-3 bg-background border-t border-border">
              {/* Reply Preview */}
              <AnimatePresence>
                {replyTo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded-lg mb-2 border-l-2 border-primary"
                  >
                    <div className="truncate">
                      <span className="font-bold mr-1">
                        {language === "ar" ? "الرد على" : "Replying to"}:
                      </span>
                      {replyTo.text}
                    </div>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="p-1 hover:bg-background rounded-full"
                      aria-label={language === "ar" ? "إلغاء الرد" : "Cancel reply"}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 items-end">
                <FileUpload
                  onFileUploaded={(attachment) => handleSend(undefined, attachment)}
                  language={language as "en" | "ar"}
                />
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    mode === "bot"
                      ? language === "ar"
                        ? "اسأل المساعد الذكي..."
                        : "Ask the Smart Assistant..."
                      : language === "ar"
                        ? "اكتب لفريق الدعم..."
                        : "Message Support..."
                  }
                  className="flex-1 bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 max-h-24 min-h-[44px]"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md h-[44px] flex items-center justify-center"
                  aria-label={language === "ar" ? "إرسال" : "Send"}
                >
                  <Send className="w-5 h-5 rtl:-scale-x-100" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
