"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, Headphones, Bot, MessageSquare, Trash2 } from "lucide-react";
import { useAuth, useLanguage } from "@/contexts";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import {
  sendMessage,
  ChatMessage,
  markMessagesAsSeen,
  clearChatHistory,
} from "@/lib/chatUtils";
import { getLocalBotResponse, wantsLiveSupport } from "@/lib/localBot";
import { toast } from "sonner";
import Image from "next/image";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"bot" | "live">("bot");
  const [isTyping, setIsTyping] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Firestore Messages State (Single Source of Truth)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { language } = useLanguage();

  // 1. Listen for ALL Messages (User + Bot + Admin)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `chats/${user.uid}/messages`),
      orderBy("timestamp", "asc")
    );

    let prevCount = 0;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as ChatMessage)
      );

      // Check for new messages from Admin/Support
      if (msgs.length > prevCount && prevCount > 0) {
        const lastMsg = msgs[msgs.length - 1];
        // If message is from 'admin' and chat is closed or we are in bot mode (optional logic)
        // Actually, let's just notify if it's from 'admin'
        if (lastMsg.senderId === "admin" && !isOpen) {
          setUnreadCount((prev) => prev + 1);
          toast.info(
            language === "ar" ? "رد جديد من الدعم" : "New reply from support",
            {
              action: {
                label: language === "ar" ? "فتح" : "Open",
                onClick: () => setIsOpen(true),
              },
            }
          );
        }
      }

      setMessages(msgs);
      prevCount = msgs.length;
    });

    return () => unsubscribe();
  }, [user, isOpen, language]);

  // 2. Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  // 3. Handle Send (Unified)
  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend || !user) return;

    setInput("");

    // A. Send USER message to Firestore
    try {
      await sendMessage(
        user.uid,
        textToSend,
        user.uid, // User is sending
        user.displayName || "User",
        false
      );
    } catch {
      toast.error("Failed to send message");
      return;
    }

    // B. If in BOT mode, generate reply
    if (mode === "bot") {
      setIsTyping(true);

      // Check if user wants live support
      if (wantsLiveSupport(textToSend)) {
        setTimeout(async () => {
          await sendMessage(
            user.uid,
            language === "ar"
              ? "يبدو أنك تريد التحدث مع بشري. جاري تحويلك للدعم المباشر..."
              : "Createing ticket for live support...",
            "bot",
            "Smart Assistant"
          );
          setMode("live");
          setIsTyping(false);
        }, 1000);
        return;
      }

      // Get Bot Response
      setTimeout(async () => {
        const response = await getLocalBotResponse(textToSend, language);
        await sendMessage(
          user.uid,
          response.text,
          "bot", // Sender is Bot
          "Smart Assistant"
        );
        setIsTyping(false);
      }, 1200);
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
      toast.success(
        language === "ar" ? "تم مسح المحادثة" : "Chat history cleared"
      );
      setShowClearConfirm(false);
    } catch {
      toast.error("Failed to clear history");
    }
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen && unreadCount > 0 && user) {
      setUnreadCount(0);
      markMessagesAsSeen(user.uid, false);
    }
  };

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
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90 }}
              animate={{ rotate: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" className="relative">
              {unreadCount > 0 ? (
                <Headphones className="w-6 h-6 animate-pulse" />
              ) : (
                <MessageSquare className="w-6 h-6" />
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-background">
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
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-3">
                {/* Avatar: Changes based on mode */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    mode === "bot" ? "bg-primary/10" : "bg-green-500/10"
                  )}
                >
                  {mode === "bot" ? (
                    <Bot className="w-6 h-6 text-primary" />
                  ) : (
                    <Headphones className="w-6 h-6 text-green-600" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm">
                    {mode === "bot"
                      ? language === "ar"
                        ? "المساعد الذكي"
                        : "Smart Assistant"
                      : language === "ar"
                      ? "الدعم المباشر"
                      : "Live Support"}
                  </h3>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        mode === "bot"
                          ? "bg-primary"
                          : "bg-green-500 animate-pulse"
                      )}
                    />
                    {mode === "bot"
                      ? language === "ar"
                        ? "يعمل دائماً"
                        : "Always available"
                      : language === "ar"
                      ? "متصل الآن"
                      : "Online"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-full transition-colors"
                  title="Clear History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setMode(mode === "bot" ? "live" : "bot")}
                  className={cn(
                    "px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border transition-all",
                    mode === "bot"
                      ? "bg-background border-border hover:bg-muted"
                      : "bg-primary/10 border-primary/20 text-primary"
                  )}
                >
                  {mode === "bot" ? "LIVE" : "BOT"}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-muted rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-6 opacity-60">
                  {mode === "bot" ? (
                    <Bot className="w-12 h-12 mb-3" />
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

              {messages.map((msg) => {
                const isUser = msg.senderId === user.uid;
                const isBot = msg.senderId === "bot";
                const isAdmin = msg.senderId === "admin";

                // Profile Image Logic
                // User: User's photo or User Icon
                // Bot: Bot Icon
                // Admin: Support Icon/Logo

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    {/* Avatar Bubble */}
                    <div className="shrink-0">
                      {isUser ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border">
                          {user.photoURL ? (
                            <Image
                              src={user.photoURL}
                              alt="User"
                              width={32}
                              height={32}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center px-1 text-[10px] font-bold">
                              {user.displayName?.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                      ) : isBot ? (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                          <Headphones className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className="space-y-1">
                      <div
                        className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                          isUser
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-background border border-border rounded-tl-none"
                        )}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground block px-1">
                        {msg.senderName ||
                          (isBot ? "Bot" : isAdmin ? "Support" : "User")}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Auto-Suggestions (Only if last message is from Bot) */}
            {mode === "bot" &&
              messages.length > 0 &&
              messages[messages.length - 1].senderId === "bot" && (
                <div className="px-4 pb-2 bg-muted/5 flex overflow-x-auto gap-2 scrollbar-none">
                  {/* We can parse suggestions from the bot response? 
                         Since we don't store suggestions in Firestore schema properly yet (it's custom), 
                         we might lose them if we don't save them.
                         Idea: For now, just show generic suggestions or try to find them. 
                         Actually, let's hardcode some common ones or add 'suggestions' to ChatMessage schema?
                         The User didn't ask for schema change but "restore logic".
                         In the previous code, suggestions were local.
                         To keep it simple: Just show a static set of helpful chips?
                         OR: Infer from context?
                         Let's show a standard set that's always useful.
                     */}
                  {(language === "ar"
                    ? ["المواد الدراسية", "أتحدث مع بشري", "منصة العبور"]
                    : ["Subjects", "Talk to human", "About Platform"]
                  ).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="whitespace-nowrap bg-background border border-border text-[10px] px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shrink-0 shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

            {/* Input Area */}
            <div className="p-3 bg-background border-t border-border">
              <div className="flex gap-2">
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
                  className="flex-1 bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
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
