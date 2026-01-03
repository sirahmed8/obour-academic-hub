"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send, Headphones, Bot, MessageSquare } from "lucide-react";
import { useAuth, useLanguage } from "@/contexts"; // Assumes you have these contexts
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { sendMessage, ChatMessage, markMessagesAsSeen } from "@/lib/chatUtils";
import { getLocalBotResponse, wantsLiveSupport } from "@/lib/localBot"; // Import from restored file
import { toast } from "sonner";
import Image from "next/image";

// Types for Local Bot Chat
interface LocalMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  suggestions?: string[];
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"bot" | "live">("bot"); // Default to bot
  const [isTyping, setIsTyping] = useState(false); // For bot typing effect

  // Local Chat State
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>(() => [
    {
      id: "init-1",
      text: "مرحباً! 👋 أنا المساعد الذكي لمنصة العبور. كيف يمكنني مساعدتك؟",
      sender: "bot",
      timestamp: new Date(),
      suggestions: ["المواد الدراسية", "أتحدث مع بشري"],
    },
  ]);

  // Live Chat State
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [liveUnread, setLiveUnread] = useState(0);

  // Common State
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { language } = useLanguage();

  // Update initial message language when language changes - REMOVED to avoid setState in effect loop
  // New messages will be in the correct language.

  // Listen for Live Updates (Admin Messages) regardless of mode
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `chats/${user.uid}/messages`),
      orderBy("timestamp", "asc")
    );

    let prevMessageCount = 0;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as ChatMessage)
      );

      // Notify if new message from admin
      if (msgs.length > prevMessageCount && prevMessageCount > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.senderId === "admin") {
          if (!isOpen || mode !== "live") {
            setLiveUnread((prev) => prev + 1);
            toast.info(
              language === "ar"
                ? "رسالة جديدة من الدعم"
                : "New message from support"
            );
          }
        }
      }

      prevMessageCount = msgs.length;
      setLiveMessages(msgs);
    });

    return () => unsubscribe();
  }, [user, isOpen, mode, language]);

  // Handle Mode Switching based on unread
  useEffect(() => {
    if (liveUnread > 0 && mode === "bot" && isOpen) {
      // Optional: Auto switch or just show badge. Let's just keep badge
    }
  }, [liveUnread, mode, isOpen]);

  // Scroll to bottom effect
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveMessages, localMessages, isOpen, mode]);

  const toggleChat = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState && user && mode === "live") {
      setLiveUnread(0);
      markMessagesAsSeen(user.uid, false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");

    if (mode === "bot") {
      // 1. Add User Message
      const userMsg: LocalMessage = {
        id: Date.now().toString(),
        text,
        sender: "user",
        timestamp: new Date(),
      };
      setLocalMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // 2. Check for "Live Support" intent
      if (wantsLiveSupport(text)) {
        setTimeout(() => {
          const botMsg: LocalMessage = {
            id: (Date.now() + 1).toString(),
            text:
              language === "ar"
                ? "جاري تحويلك للدعم المباشر..."
                : "Switching you to live support...",
            sender: "bot",
            timestamp: new Date(),
          };
          setLocalMessages((prev) => [...prev, botMsg]);
          setIsTyping(false);
          setTimeout(() => setMode("live"), 1000);
        }, 800);
        return;
      }

      // 3. Get Bot Response
      setTimeout(async () => {
        const response = await getLocalBotResponse(text, language);
        const botMsg: LocalMessage = {
          id: (Date.now() + 1).toString(),
          text: response.text,
          sender: "bot",
          timestamp: new Date(),
          suggestions: response.suggestions,
        };
        setLocalMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 1000);
    } else {
      // LIVE MODE
      if (!user) {
        toast.error("Please login first");
        return;
      }
      try {
        await sendMessage(
          user.uid,
          text,
          user.uid,
          user.displayName || "User",
          false
        );
      } catch {
        toast.error(language === "ar" ? "فشل الإرسال" : "Failed to send");
        setInput(text);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Render Helpers ---

  // Render Local Message
  const renderLocalMessage = (msg: LocalMessage) => {
    const isBot = msg.sender === "bot";
    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex gap-3 max-w-[85%]",
          !isBot ? "ml-auto flex-row-reverse" : "mr-auto"
        )}
      >
        {isBot && (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-primary" />
          </div>
        )}
        <div className="space-y-2">
          <div
            className={cn(
              "rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed",
              !isBot
                ? "bg-primary text-primary-foreground rounded-tr-none"
                : "bg-muted text-foreground rounded-tl-none border border-border/50"
            )}
          >
            {msg.text}
          </div>
          {/* Suggestions */}
          {isBot && msg.suggestions && (
            <div className="flex flex-wrap gap-2">
              {msg.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setInput(s);
                    // Trigger send immediately? OR let user handle it.
                    // Let's set input only for now, or maybe auto send is better UX?
                    // Let's auto send for smoother flow.
                    // But we can't easily call handleSend with new input due to closure/state.
                    // Better to just setInput for now.
                    // ACTUALLY, let's just cheat and call a separate helper if we want auto send.
                    // For simplicity: just setInput
                    setInput(s);
                  }}
                  className="text-xs bg-background border border-primary/20 hover:bg-primary/5 text-primary px-3 py-1.5 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  if (!user) return null;

  return (
    <>
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
              {liveUnread > 0 ? (
                <Headphones className="w-6 h-6 animate-pulse" />
              ) : (
                <MessageSquare className="w-6 h-6" />
              )}
              {liveUnread > 0 && (
                <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-background">
                  {liveUnread}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

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
                {mode === "bot" ? (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Headphones className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold">
                    {mode === "bot"
                      ? language === "ar"
                        ? "المساعد الذكي"
                        : "Smart Assistant"
                      : language === "ar"
                      ? "الدعم المباشر"
                      : "Live Support"}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {mode === "bot"
                      ? language === "ar"
                        ? "يعمل دائماً"
                        : "Always available"
                      : language === "ar"
                      ? "متصل الآن"
                      : "Online now"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Mode Toggle Button */}
                <button
                  onClick={() => setMode(mode === "bot" ? "live" : "bot")}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-full font-medium transition-colors border",
                    mode === "bot"
                      ? "bg-background hover:bg-muted border-border"
                      : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                  )}
                >
                  {mode === "bot"
                    ? language === "ar"
                      ? "تحدث لبشري"
                      : "Talk to Human"
                    : language === "ar"
                    ? "تحدث للبوت"
                    : "Talk to Bot"}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-muted rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5">
              {mode === "bot" ? (
                <>
                  {localMessages.map(renderLocalMessage)}
                  {isTyping && (
                    <div className="flex gap-2 items-center text-xs text-muted-foreground animate-pulse ml-2">
                      <Bot className="w-4 h-4" />
                      <span>Typing...</span>
                    </div>
                  )}
                </>
              ) : (
                /* LIVE CHAT RENDER (Simplified from previous) */
                <>
                  {liveMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground mt-10">
                      <Headphones className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>
                        {language === "ar"
                          ? "تحدث معنا مباشرة"
                          : "Chat with us directly"}
                      </p>
                    </div>
                  ) : (
                    liveMessages.map((msg) => {
                      const isUser = msg.senderId === user.uid;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            "flex gap-3 max-w-[85%]", // Reduced max-width
                            isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                          )}
                        >
                          {!isUser && (
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-1">
                              <Image
                                src="/obour-logo.png"
                                alt="Support"
                                width={16}
                                height={16}
                                className="object-contain"
                              />
                            </div>
                          )}
                          <div
                            className={cn(
                              "relative group",
                              isUser ? "items-end" : "items-start"
                            )}
                          >
                            <div
                              className={cn(
                                "rounded-2xl px-4 py-3 shadow-sm text-sm leading-relaxed",
                                isUser
                                  ? "bg-blue-600 text-white rounded-tr-none" // Distinct live chat color
                                  : "bg-white dark:bg-zinc-800 border border-border rounded-tl-none"
                              )}
                            >
                              {msg.text}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-background border-t border-border">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    mode === "bot"
                      ? language === "ar"
                        ? "اسأل البوت..."
                        : "Ask the bot..."
                      : language === "ar"
                      ? "اكتب للدعم..."
                      : "Type to support..."
                  }
                  className="flex-1 bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
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
