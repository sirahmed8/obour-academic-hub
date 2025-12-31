"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Headphones,
  Trash2,
  Check,
  CheckCheck,
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
import { sendMessage, ChatMessage } from "@/lib/chatUtils";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

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

  // Live Chat Listener
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `chats/${user.uid}/messages`),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as ChatMessage)
      );
      setLiveMessages(msgs);

      // Calculate unread (simple version: count Admin messages since last view)
      if (!isOpen && msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.senderId !== user.uid) {
          setLiveUnread((prev) => prev + 1);
        }
      }
    });

    return () => unsubscribe();
  }, [user, isOpen]);

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
        setIsTyping(false);
      }, 800);
    } else {
      // Live Mode
      if (!user) {
        // Handle unauthenticated
        return;
      }
      try {
        await sendMessage(
          user.uid,
          text,
          user.uid,
          user.displayName || "Student",
          false // isAdmin = false for user
        );
      } catch (err) {
        console.error("Failed to send", err);
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
      setLocalMessages([]);
      localStorage.removeItem("obour_local_chat");
    }
    setShowClearModal(false);
  };

  const formatTime = (
    isoString: string | { toDate: () => Date } | null | undefined
  ) => {
    if (!isoString) return "";
    // Handle Firestore Timestamp
    const date =
      typeof isoString === "object" && "toDate" in isoString
        ? isoString.toDate()
        : new Date(isoString as string);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 scroll-smooth">
            {mode === "bot" ? (
              localMessages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%] animate-scale-in",
                    msg.sender === "user" ? "ml-auto items-end" : "items-start"
                  )}
                  style={{ animationDelay: `${idx * 50}ms` }}
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
                </div>
              ))
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
              liveMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%] animate-scale-in",
                    msg.senderId === user?.uid
                      ? "ml-auto items-end"
                      : "items-start"
                  )}
                >
                  <div
                    className={cn(
                      "p-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed min-w-[60px]",
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
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))
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

          {/* Input Area */}
          <div className="p-3 bg-card border-t border-border space-y-2">
            {/* Support Button */}
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
                className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Headphones size={18} />
                {language === "ar"
                  ? "تحدث مع موظف حقيقي"
                  : "Talk to a real person"}
              </button>
            )}
            {/* Input */}
            <div className="flex items-center gap-2 bg-muted p-1 rounded-full">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={
                  mode === "bot"
                    ? language === "ar"
                      ? "اسأل البوت..."
                      : "Ask the bot..."
                    : language === "ar"
                    ? "اكتب للدعم..."
                    : "Message support..."
                }
                className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2.5 bg-primary text-primary-foreground rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send size={18} />
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
