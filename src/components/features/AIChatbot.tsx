"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Headphones,
  Trash2,
  Check,
  CheckCheck,
  Reply,
  Smile,
} from "lucide-react";
import { useAuth, useLanguage } from "@/contexts";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import {
  getLocalBotResponse,
  wantsLiveSupport,
  needsHelpSuggestion,
} from "@/lib/localBot";
import {
  sendMessage,
  ChatMessage,
  toggleReaction,
  markMessagesAsSeen,
  deleteMessage,
} from "@/lib/chatUtils";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { toast } from "sonner";

type ChatMode = "bot" | "live";

interface LocalMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("bot");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // State for Local Bot (defined later with getInitialMessages)

  // State for Live Chat
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [liveUnread, setLiveUnread] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { language } = useLanguage();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showSupportButton, setShowSupportButton] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const QUICK_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

  // Initial state loaded from localStorage
  const getInitialMessages = (): LocalMessage[] => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("obour_local_chat");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [
      {
        id: "init",
        text: "Hi! I am your automated assistant. How can I help?",
        sender: "bot",
        timestamp: new Date().toISOString(),
      },
    ];
  };

  const [localMessages, setLocalMessages] =
    useState<LocalMessage[]>(getInitialMessages);

  // Note: Language-dependent greeting is set at initialization
  // If user changes language mid-session, new messages will use the current language

  // Save Local History
  useEffect(() => {
    if (localMessages.length > 0) {
      localStorage.setItem("obour_local_chat", JSON.stringify(localMessages));
    }
  }, [localMessages]);

  // Listen for external open trigger (from Navbar "Contact Support" link)
  useEffect(() => {
    const handleOpenChatbot = (event: CustomEvent<{ mode?: ChatMode }>) => {
      setIsOpen(true);
      if (event.detail?.mode) {
        setMode(event.detail.mode);
      }
      setLiveUnread(0);
    };

    window.addEventListener("openChatbot", handleOpenChatbot as EventListener);
    return () => {
      window.removeEventListener(
        "openChatbot",
        handleOpenChatbot as EventListener
      );
    };
  }, []);

  // Live Chat Listener - show badge on new message (NO auto-open)
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

      // Check for new admin message - show badge instead of auto-open
      if (msgs.length > prevMessageCount && prevMessageCount > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.senderId === "admin" && !isOpen) {
          // Just increment badge, don't auto-open
          setLiveUnread((prev) => prev + 1);
        }
      }

      prevMessageCount = msgs.length;
      setLiveMessages(msgs);
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  // Welcome Message Logic (Client-side check)
  useEffect(() => {
    if (isOpen && mode === "bot" && localMessages.length === 0) {
      // Small delay for natural feel
      const timer = setTimeout(() => {
        setLocalMessages([
          {
            id: "welcome-init",
            text:
              language === "ar"
                ? "مرحباً! أنا مساعدك الآلي. كيف يمكنني مساعدتك اليوم؟"
                : "Welcome! I am your automated assistant. How can I help you today?",
            sender: "bot",
            timestamp: new Date().toISOString(),
          },
        ]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mode, localMessages.length, language]);

  // Mark messages as seen when opening live mode
  useEffect(() => {
    if (isOpen && mode === "live" && user) {
      markMessagesAsSeen(user.uid, false)
        .then(() => setLiveUnread(0))
        .catch(console.error);
    }
  }, [isOpen, mode, user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, liveMessages, isOpen, mode]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");

    if (mode === "bot") {
      const userMsg: LocalMessage = {
        id: Date.now().toString(),
        text,
        sender: "user",
        timestamp: new Date().toISOString(),
      };
      setLocalMessages((prev) => [...prev, userMsg]);

      // PERSIST FOR ADMIN VISIBILITY
      if (user) {
        sendMessage(
          user.uid,
          text,
          user.uid,
          user.displayName || "User",
          false
        ).catch((e) => console.error("Failed to persist user msg", e));
      }

      // Check if user wants live support (explicit request)
      if (wantsLiveSupport(text)) {
        const confirmMsg: LocalMessage = {
          id: (Date.now() + 1).toString(),
          text:
            language === "ar"
              ? "بالتأكيد! سأحولك للدعم المباشر الآن. 🎧"
              : "Sure! Switching you to live support now. 🎧",
          sender: "bot",
          timestamp: new Date().toISOString(),
        };
        setLocalMessages((prev) => [...prev, confirmMsg]);

        if (user) {
          sendMessage(
            user.uid,
            confirmMsg.text,
            "bot",
            language === "ar" ? "بوت المعهد" : "College Bot",
            true
          ).catch((e) => console.error("Failed to persist bot msg", e));
        }

        setTimeout(() => setMode("live"), 1000);
        return;
      }

      // Check if user needs help suggestion (show button)
      if (needsHelpSuggestion(text)) {
        setShowSupportButton(true);
        const helpMsg: LocalMessage = {
          id: (Date.now() + 1).toString(),
          text:
            language === "ar"
              ? "أنا هنا لمساعدتك! 🙌\n\nيمكنني الإجابة على أسئلة عن:\n• المعهد والموقع\n• الأقسام والتخصصات\n• المصاريف\n• الامتحانات والنتائج\n\nإذا أردت التحدث مع موظف حقيقي، اضغط الزر أدناه 👇"
              : "I'm here to help you! 🙌\n\nI can answer questions about:\n• Institute & location\n• Departments & majors\n• Fees & tuition\n• Exams & results\n\nIf you need to talk to a real person, click the button below 👇",
          sender: "bot",
          timestamp: new Date().toISOString(),
        };
        setLocalMessages((prev) => [...prev, helpMsg]);

        if (user) {
          sendMessage(
            user.uid,
            helpMsg.text,
            "bot",
            language === "ar" ? "بوت المعهد" : "College Bot",
            true
          ).catch(console.error);
        }
        return;
      }

      setIsTyping(true);
      setShowSupportButton(false);

      // Simulate delay
      setTimeout(() => {
        const response = getLocalBotResponse(text);
        const botMsg: LocalMessage = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: "bot",
          timestamp: new Date().toISOString(),
        };
        setLocalMessages((prev) => [...prev, botMsg]);

        if (user) {
          sendMessage(
            user.uid,
            response,
            "bot",
            language === "ar" ? "بوت المعهد" : "College Bot",
            true
          ).catch(console.error);
        }

        setIsTyping(false);
      }, 800);
    } else {
      // Live Mode
      if (!user) {
        // Handle unauthenticated
        toast.error(
          language === "ar"
            ? "يجب عليك تسجيل الدخول أولاً"
            : "You must login first"
        );
        return;
      }
      try {
        await sendMessage(
          user.uid,
          text,
          user.uid,
          user.displayName || "Student",
          false,
          replyTo
            ? {
                id: replyTo.id,
                text: replyTo.text,
                senderName: replyTo.senderName || "Admin",
              }
            : undefined
        );
        setReplyTo(null); // Clear reply after sending
      } catch (err) {
        console.error("Failed to send message:", err);
        toast.error(
          language === "ar" ? "فشل إرسال الرسالة" : "Failed to send message"
        );
      }
    }
  };

  const clearHistory = () => {
    if (mode === "bot") {
      setShowClearModal(true);
    } else {
      // Live chat cannot be cleared
      // Just show info - handled in modal
      setShowClearModal(true);
    }
  };

  const confirmClearHistory = () => {
    if (mode === "bot") {
      // Re-inject welcome message
      const welcomeMsg: LocalMessage = {
        id: "welcome-" + Date.now(),
        text:
          language === "ar"
            ? "مرحباً! أنا مساعدك الآلي. كيف يمكنني مساعدتك اليوم؟"
            : "Welcome! I am your automated assistant. How can I help you today?",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setLocalMessages([welcomeMsg]);
      localStorage.setItem("obour_local_chat", JSON.stringify([welcomeMsg]));
    }
    setShowClearModal(false);
  };

  const formatTime = (
    timestamp:
      | { seconds: number; nanoseconds: number }
      | { toDate: () => Date }
      | string
      | null
      | undefined
  ) => {
    if (!timestamp) return "";
    let date: Date;

    if (typeof timestamp === "string") {
      date = new Date(timestamp);
    } else if (
      typeof timestamp === "object" &&
      timestamp !== null &&
      "toDate" in timestamp &&
      typeof timestamp.toDate === "function"
    ) {
      date = timestamp.toDate();
    } else if (
      typeof timestamp === "object" &&
      timestamp !== null &&
      "seconds" in timestamp &&
      typeof timestamp.seconds === "number"
    ) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      return "";
    }

    return date.toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setLiveUnread(0);
        }}
        className={cn(
          "fixed bottom-6 z-50 p-4 rounded-full shadow-2xl hover:scale-110 transition-transform animate-scale-in flex items-center gap-2",
          language === "ar" ? "left-6" : "right-6",
          isOpen ? "hidden" : "bg-primary text-primary-foreground"
        )}
      >
        <MessageSquare size={24} />
        {liveUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-bounce">
            {liveUnread}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "fixed bottom-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] bg-card border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-in-right",
            language === "ar" ? "left-6 animate-slide-in-left" : "right-6"
          )}
        >
          {/* Header */}
          <div className="bg-primary p-4 text-primary-foreground flex items-center justify-between shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-full">
                {mode === "bot" ? <Bot size={24} /> : <Headphones size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">
                  {mode === "bot"
                    ? language === "ar"
                      ? "المساعد الآلي"
                      : "Auto Bot"
                    : language === "ar"
                    ? "الدعم الفني"
                    : "Live Support"}
                </h3>
                <div className="flex items-center gap-1.5 opacity-80 text-xs">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      mode === "live"
                        ? "bg-green-400 animate-pulse"
                        : "bg-white"
                    )}
                  />
                  {mode === "bot"
                    ? language === "ar"
                      ? "يرد فوراً"
                      : "Instant Reply"
                    : language === "ar"
                    ? "متصل الآن"
                    : "Online"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearHistory}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="Clear History"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-2 gap-2 bg-muted/50">
            <button
              onClick={() => setMode("bot")}
              className={cn(
                "flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                mode === "bot"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:bg-background/50"
              )}
            >
              <Bot size={16} />
              {language === "ar" ? "بوت المعهد" : "College Bot"}
            </button>
            <button
              onClick={() => setMode("live")}
              className={cn(
                "flex-1 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                mode === "live"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:bg-background/50"
              )}
            >
              <Headphones size={16} />
              {language === "ar" ? "محادثة مباشرة" : "Live Chat"}
            </button>
          </div>

          {/* Messages Area */}
          <div
            className={cn(
              "flex-1 p-4 space-y-4 bg-muted/30 scroll-smooth pb-24",
              (mode === "live" && liveMessages.length === 0) ||
                (mode === "bot" && localMessages.length === 0)
                ? "overflow-hidden"
                : "overflow-y-auto"
            )}
          >
            {/* Added pb-24 for input space */}
            {mode === "bot" ? (
              <>
                <AnimatePresence mode="popLayout">
                  {localMessages.map((msg, idx) => (
                    <motion.div
                      key={msg.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                        delay: idx * 0.05,
                      }}
                      className={cn(
                        "flex flex-col max-w-[85%]",
                        msg.sender === "user"
                          ? "ml-auto items-end"
                          : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "p-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed",
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-card text-foreground rounded-bl-none"
                        )}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">
                        {formatTime(msg.timestamp)}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Human Handoff Button */}
                {showSupportButton && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={async () => {
                      // Get the last user message for context
                      const lastUserMsg = [...localMessages]
                        .reverse()
                        .find((m) => m.sender === "user");

                      // Switch to live mode
                      setMode("live");
                      setShowSupportButton(false);

                      // Send escalation message to support if user is logged in
                      if (user && lastUserMsg) {
                        try {
                          await sendMessage(
                            user.uid,
                            `[Escalated from Bot] ${lastUserMsg.text}`,
                            user.uid,
                            user.displayName || "User",
                            false
                          );
                          toast.success(
                            language === "ar"
                              ? "تم تحويلك للدعم الفني"
                              : "You've been connected to support"
                          );
                        } catch (err) {
                          console.error("Escalation failed:", err);
                        }
                      }
                    }}
                    className="mx-auto mt-4 px-6 py-3 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Headphones size={18} />
                    {language === "ar"
                      ? "تحدث مع موظف حقيقي"
                      : "Talk to a Real Person"}
                  </motion.button>
                )}
              </>
            ) : liveMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50 p-6 text-center">
                <Headphones size={48} className="mb-4" />
                <p>
                  {language === "ar"
                    ? "تحدث مع فريق الدعم مباشرة"
                    : "Chat with support directly"}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {liveMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      transition: { duration: 0.2 },
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={cn(
                      "flex flex-col max-w-[85%] group relative",
                      msg.senderId === user?.uid
                        ? "ml-auto items-end"
                        : "items-start"
                    )}
                  >
                    {/* Reply Preview */}
                    {msg.replyTo && (
                      <div className="text-[10px] bg-muted/50 px-2 py-1 rounded-lg mb-1 border-l-2 border-primary max-w-full truncate">
                        <span className="font-medium">
                          {msg.replyTo.senderName}:
                        </span>{" "}
                        {msg.replyTo.text.slice(0, 40)}...
                      </div>
                    )}

                    <div
                      className={cn(
                        "p-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed min-w-[60px] relative",
                        msg.senderId === user?.uid
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-card text-foreground rounded-bl-none"
                      )}
                    >
                      {msg.text}
                      {msg.senderId === user?.uid && (
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

                      {/* Reactions Display */}
                      {msg.reactions &&
                        Object.keys(msg.reactions).length > 0 && (
                          <div className="absolute -bottom-3 left-2 flex gap-0.5 bg-card rounded-full px-1.5 py-0.5 shadow-sm border border-border">
                            {Object.values(msg.reactions)
                              .slice(0, 3)
                              .map((emoji, i) => (
                                <span key={i} className="text-xs">
                                  {emoji}
                                </span>
                              ))}
                          </div>
                        )}
                    </div>

                    {/* Action Buttons (on hover) */}
                    <div
                      className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity flex gap-1",
                        msg.senderId === user?.uid ? "flex-row-reverse" : "",
                        msg.reactions && Object.keys(msg.reactions).length > 0
                          ? "mt-4"
                          : "mt-1"
                      )}
                    >
                      <button
                        onClick={() => setReplyTo(msg)}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                        title="Reply"
                      >
                        <Reply size={12} />
                      </button>
                      <button
                        onClick={() =>
                          setShowEmojiPicker(
                            showEmojiPicker === msg.id ? null : msg.id
                          )
                        }
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                        title="React"
                      >
                        <Smile size={12} />
                      </button>
                      {msg.senderId === user?.uid && !msg.isDeleted && (
                        <button
                          onClick={() => {
                            if (user) {
                              deleteMessage(user.uid, msg.id);
                              toast.info(
                                language === "ar"
                                  ? "تم حذف الرسالة"
                                  : "Message deleted"
                              );
                            }
                          }}
                          className="p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>

                    {/* Emoji Picker */}
                    {showEmojiPicker === msg.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-full mt-1 flex gap-1 bg-card p-1 rounded-lg shadow-lg border border-border z-10"
                      >
                        {QUICK_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              if (user) {
                                toggleReaction(
                                  user.uid,
                                  msg.id,
                                  user.uid,
                                  emoji
                                );
                              }
                              setShowEmojiPicker(null);
                            }}
                            className="hover:bg-muted p-1 rounded transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}

                    <span className="text-[10px] text-muted-foreground mt-1 px-1">
                      {formatTime(
                        msg.timestamp as {
                          seconds: number;
                          nanoseconds: number;
                        } | null
                      )}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {isTyping && (
              <div className="flex items-center gap-1 bg-card w-fit p-3 rounded-2xl rounded-bl-none animate-pulse">
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce animate-delay-100" />
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce animate-delay-200" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Floating Input Area */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border rounded-b-3xl">
            {/* Support Button (Floating above input if needed) */}
            {showSupportButton && mode === "bot" && (
              <button
                onClick={() => {
                  setMode("live");
                  setShowSupportButton(false);
                  const switchMsg: LocalMessage = {
                    id: Date.now().toString(),
                    text:
                      language === "ar"
                        ? "تم تحويلك للدعم المباشر. يمكنك الآن التحدث مع موظف! 🎧"
                        : "Switched to live support. You can now talk to an agent! 🎧",
                    sender: "bot",
                    timestamp: new Date().toISOString(),
                  };
                  setLocalMessages((prev) => [...prev, switchMsg]);
                }}
                className="w-full mb-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Headphones size={16} />
                {language === "ar" ? "تحدث مع موظف" : "Talk to Human"}
              </button>
            )}

            {/* Reply Preview */}
            {replyTo && (
              <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg mb-2 border-l-2 border-primary">
                <div className="text-xs truncate">
                  <span className="font-medium">
                    {language === "ar" ? "رد على:" : "Replying to:"}
                  </span>{" "}
                  {replyTo.text.slice(0, 50)}...
                </div>
                <button
                  onClick={() => setReplyTo(null)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  replyTo
                    ? language === "ar"
                      ? "اكتب ردك..."
                      : "Type your reply..."
                    : mode === "bot"
                    ? language === "ar"
                      ? "اكتب رسالتك..."
                      : "Type a message..."
                    : language === "ar"
                    ? "مراسلة الدعم..."
                    : "Message support..."
                }
                className="flex-1 bg-muted/50 hover:bg-muted focus:bg-background px-4 py-3 rounded-full border border-transparent focus:border-primary/20 outline-none transition-all text-sm placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={confirmClearHistory}
        title={language === "ar" ? "مسح المحادثة" : "Clear History"}
        message={
          mode === "bot"
            ? language === "ar"
              ? "هل أنت متأكد من مسح المحادثة؟"
              : "Are you sure you want to clear history?"
            : language === "ar"
            ? "لا يمكن مسح محادثة الدعم الفني من طرفك."
            : "Live support chat cannot be cleared from your side."
        }
        confirmText={
          mode === "bot"
            ? language === "ar"
              ? "مسح"
              : "Clear"
            : language === "ar"
            ? "حسناً"
            : "OK"
        }
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        type={mode === "bot" ? "warning" : "info"}
      />
    </>
  );
}
