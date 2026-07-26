"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore";
import { toast } from "sonner";
import { useAuth, useLanguage, useSolidMode } from "@/contexts";
import { db } from "@/lib/firebase";
import { apiFetch } from "@/lib/api-client";
import {
  clearChatHistory,
  deleteMessage,
  markMessagesAsSeen,
  sendMessage,
  toggleReaction,
} from "@/lib/chatUtils";
import { ChatMessage, SiteSettings, User } from "@/types";

type CoreMessage = {
  role: "user" | "assistant" | "system";
  content: string | Array<{ type: "text"; text: string } | { type: "image"; image: string | URL }>;
};

export type ChatbotMode = "live" | "bot";

export type ChatbotAttachment = {
  url: string;
  name: string;
  size: number;
  type: "image" | "document";
};

export interface AIChatbotController {
  aiEnabled: boolean;
  chatbotEnabled: boolean;
  confirmClearChat: () => Promise<void>;
  handleDeleteMessage: (msgId: string) => Promise<void>;
  handleReaction: (msg: ChatMessage, emoji: string) => Promise<void>;
  handleSend: (textOverride?: string, attachment?: ChatbotAttachment) => Promise<void>;
  input: string;
  isBtnHovered: boolean;
  isGenerating: boolean;
  isGeneratingWelcome: boolean;
  isOpen: boolean;
  isSolid: boolean;
  language: string;
  messages: ChatMessage[];
  mode: ChatbotMode;
  replyTo: ChatMessage | null;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setIsBtnHovered: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMode: (mode: ChatbotMode) => void;
  setReplyTo: React.Dispatch<React.SetStateAction<ChatMessage | null>>;
  setShowClearConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  showClearConfirm: boolean;
  toggleChat: () => void;
  unreadCount: number;
  user: User | null;
}

export function useAIChatbot(): AIChatbotController {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("chatbot-isOpen") === "true";
    }
    return false;
  });
  const [input, setInput] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mode, setInternalMode] = useState<ChatbotMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chatbot-mode");
      if (stored === "live" || stored === "bot") return stored;
    }
    return "bot";
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingWelcome, setIsGeneratingWelcome] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const messages = mode === "bot" ? aiMessages : liveMessages;

  const welcomeFetchedRef = useRef(false);

  const { user } = useAuth();
  const { language } = useLanguage();
  const { isSolid } = useSolidMode();

  const languageRef = useRef(language);
  const inputRef = useRef(input);
  const replyToRef = useRef(replyTo);
  const modeRef = useRef(mode);
  const messagesRef = useRef(messages);

  const aiChatId = user?.uid ?? "guest";
  const liveChatId = `${user?.uid ?? "guest"}_support`;
  const currentChatId = mode === "bot" ? aiChatId : liveChatId;

  const setModeAndClear = useCallback(
    (newMode: ChatbotMode) => {
      setInternalMode(newMode);
      if (typeof window !== "undefined") {
        localStorage.setItem("chatbot-mode", newMode);
      }
      if (newMode === "live") {
        setIsGeneratingWelcome(false);
        if (user) {
          markMessagesAsSeen(liveChatId, false);
        }
      }
    },
    [user, liveChatId]
  );

  const toggleChat = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    // Clearing unread immediately on open if in live mode
    if (nextOpen && mode === "live" && unreadCount > 0 && user) {
      markMessagesAsSeen(liveChatId, false);
    }
  };

  // Keep refs in sync for closure consistency
  inputRef.current = input;
  replyToRef.current = replyTo;
  modeRef.current = mode;
  messagesRef.current = messages;

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatbot-isOpen", String(isOpen));
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOpenChatbot = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;

      setIsOpen(true);

      if (detail?.mode === "live") {
        setInternalMode("live");
      } else if (detail?.mode === "fill" && detail.message) {
        setInternalMode("live");
        setInput(detail.message);
      }
    };

    window.addEventListener("openChatbot", handleOpenChatbot);
    return () => {
      window.removeEventListener("openChatbot", handleOpenChatbot);
    };
  }, []);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    if (!db) return;
    const settingsRef = doc(db!, "settings", "global");
    const unsubscribe = onSnapshot(
      settingsRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          return;
        }

        const data = docSnap.data() as SiteSettings;
        setAiEnabled(data.aiEnabled ?? true);
        setChatbotEnabled(data.chatbotEnabled ?? true);
        if (data.aiEnabled === false) {
          setInternalMode("live");
        }
      },
      (error) => {
        console.error("AIChatbot: Settings listener error", error);
        setAiEnabled(true);
        setChatbotEnabled(true);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db || mode === "bot") {
      return;
    }

    const messagesQuery = query(
      collection(db!, `chats/${currentChatId}/messages`),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const nextMessages = snapshot.docs.map(
        (docSnapshot) =>
          ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }) as ChatMessage
      );
      setLiveMessages(nextMessages);
    });

    return () => unsubscribe();
  }, [currentChatId, mode, user]);

  useEffect(() => {
    if (isOpen && mode === "bot" && !welcomeFetchedRef.current) {
      welcomeFetchedRef.current = true;

      const cacheKey = `obour_ai_welcome_${user?.uid || "guest"}_${language}`;
      let cachedText: string | null = null;

      if (typeof window !== "undefined") {
        try {
          const raw = sessionStorage.getItem(cacheKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            // Cache valid for 30 minutes (1800000 ms)
            if (parsed.timestamp && Date.now() - parsed.timestamp < 30 * 60 * 1000) {
              cachedText = parsed.text;
            }
          }
        } catch {
          // Legacy string cache fallback
          const raw = sessionStorage.getItem(cacheKey);
          if (raw && !raw.startsWith("{")) cachedText = raw;
        }
      }

      if (cachedText) {
        setAiMessages((prev) => {
          if (prev.length === 0) {
            return [
              {
                id: "ai-welcome-cached",
                text: cachedText!,
                senderId: "bot",
                senderName: language === "ar" ? "المساعد الذكي" : "AI Assistant",
                timestamp: null,
                status: "sent",
                context: "bot",
                role: "assistant",
              } as unknown as ChatMessage,
            ];
          }
          return prev;
        });
        return;
      }

      setIsGeneratingWelcome(true);
      const userName =
        user?.displayName?.split(" ")[0] || (language === "ar" ? "يا طالبنا" : "Student");
      const prompt =
        language === "ar"
          ? `بصفتك المساعد الذكي لمعاهد العبور، رحب بالطالب "${userName}" بتحية قصيرة ومحفزة جداً (سطر واحد) واعرض مساعدتك في أي استفسار أكاديمي أو جدول أو مادة.`
          : `As the Obour Institutes AI Assistant, give student "${userName}" a short, warm, encouraging welcome greeting (1 sentence) and offer help with any academic question or schedule.`;

      apiFetch<{ content: string }>("/api/chat", {
        method: "POST",
        body: {
          messages: [{ role: "user", content: prompt }],
        },
      })
        .then((data) => {
          const welcomeText =
            data.content?.replace(/\[SUGGESTIONS:.*?\]/g, "").trim() ||
            (language === "ar"
              ? `أهلاً بك يا ${userName}! 🎓 أنا المساعد الذكي لمعاهد العبور، كيف يمكنني مساعدتك اليوم؟`
              : `Welcome ${userName}! 🎓 I'm your Obour AI Assistant. How can I help you today?`);

          try {
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({ text: welcomeText, timestamp: Date.now() })
            );
          } catch {}

          setAiMessages((prev) => {
            if (prev.length === 0 || (prev.length === 1 && prev[0].id === "ai-welcome-cached")) {
              return [
                {
                  id: "ai-welcome-" + Date.now(),
                  text: welcomeText,
                  senderId: "bot",
                  senderName: language === "ar" ? "المساعد الذكي" : "AI Assistant",
                  timestamp: null,
                  status: "sent",
                  context: "bot",
                  role: "assistant",
                } as unknown as ChatMessage,
              ];
            }
            return prev;
          });
        })
        .catch((err) => {
          console.error("Failed to generate AI welcome:", err);
          const fallbackText =
            language === "ar"
              ? `أهلاً بك يا ${userName}! 🎓 كيف يمكنني مساعدتك اليوم في دراستك؟`
              : `Welcome ${userName}! 🎓 How can I assist you with your studies today?`;
          setAiMessages(() => [
            {
              id: "ai-welcome-fallback",
              text: fallbackText,
              senderId: "bot",
              senderName: language === "ar" ? "المساعد الذكي" : "AI Assistant",
              timestamp: null,
              status: "sent",
              context: "bot",
              role: "assistant",
            } as unknown as ChatMessage,
          ]);
        })
        .finally(() => {
          setIsGeneratingWelcome(false);
        });
    }
  }, [isOpen, mode, language, user]);

  useEffect(() => {
    if (!user || !db || mode === "live") {
      return;
    }

    const liveMessagesQuery = query(
      collection(db!, `chats/${liveChatId}/messages`),
      orderBy("timestamp", "asc")
    );

    let isInitialLoad = true;

    const unsubscribe = onSnapshot(liveMessagesQuery, (snapshot) => {
      const nextMessages = snapshot.docs.map((docSnapshot) => docSnapshot.data() as ChatMessage);

      if (!isInitialLoad && nextMessages.length > 0) {
        const lastMessage = nextMessages[nextMessages.length - 1];
        if (lastMessage?.senderId === "admin") {
          const currentLanguage = languageRef.current;
          toast.info(
            currentLanguage === "ar" ? "رسالة جديدة من الدعم الفني" : "New message from Support",
            {
              action: {
                label: currentLanguage === "ar" ? "فتح" : "Open",
                onClick: () => setModeAndClear("live"),
              },
              duration: 5000,
            }
          );
        }
      }

      isInitialLoad = false;
    });

    return () => unsubscribe();
  }, [liveChatId, mode, setModeAndClear, user]);

  useEffect(() => {
    if (!user || !db) {
      return;
    }

    const settingsDoc = doc(db!, "chats", liveChatId);
    const unsubscribe = onSnapshot(settingsDoc, (docSnapshot) => {
      if (!docSnapshot.exists()) {
        return;
      }

      const data = docSnapshot.data();
      setUnreadCount(data.unreadCount || 0);
    });

    return () => unsubscribe();
  }, [liveChatId, user]);

  useEffect(() => {
    if (isOpen && unreadCount > 0 && user) {
      markMessagesAsSeen(liveChatId, false);
    }
  }, [isOpen, user, liveChatId, unreadCount]);

  const confirmClearChat = useCallback(async () => {
    if (mode === "bot") {
      setAiMessages([]);
      welcomeFetchedRef.current = false;
      const cacheKey = `obour_ai_welcome_${user?.uid || "guest"}_${language}`;
      try {
        sessionStorage.removeItem(cacheKey);
      } catch {}
      toast.success(language === "ar" ? "تم مسح المحادثة" : "Chat history cleared");
      setShowClearConfirm(false);
      return;
    }

    if (!user) return;

    try {
      await clearChatHistory(currentChatId);
      toast.success(language === "ar" ? "تم مسح المحادثة" : "Chat history cleared");
      setShowClearConfirm(false);
    } catch {
      toast.error("Failed to clear history");
    }
  }, [currentChatId, language, mode, user]);

  const handleSend = useCallback(
    async (textOverride?: string, attachment?: ChatbotAttachment) => {
      const textToSend = textOverride || inputRef.current;
      if ((!textToSend.trim() && !attachment) || !user) {
        return;
      }

      if (!textOverride) {
        setInput("");
        setReplyTo(null);
      }

      try {
        await sendMessage(
          currentChatId,
          textToSend,
          user.uid,
          user.displayName || "User",
          false,
          replyToRef.current
            ? {
                id: replyToRef.current.id,
                text: replyToRef.current.text || "",
                senderName: replyToRef.current.senderName || "User",
                attachmentUrl: replyToRef.current.attachmentUrl || undefined,
                attachmentType: replyToRef.current.attachmentType || undefined,
              }
            : undefined,
          modeRef.current === "bot" ? "bot" : "live",
          attachment ? { ...attachment, type: attachment.type } : undefined,
          modeRef.current === "bot" ? { isAI: true, taskData: { title: "AI Chat" } } : undefined,
          user.photoURL
        );

        if (modeRef.current === "bot") {
          const userLocalMsg = {
            id: "user-" + Date.now(),
            text: textToSend,
            senderId: user.uid,
            senderName: user.displayName || "User",
            timestamp: null,
            status: "sent",
            context: "bot",
            role: "user",
          } as unknown as ChatMessage;
          setAiMessages((prev) => [...prev, userLocalMsg]);

          setIsGenerating(true);
          try {
            const history = messagesRef.current.slice(-5).map((message): CoreMessage => {
              const role = (message.senderId === user.uid ? "user" : "assistant") as
                | "user"
                | "assistant";
              let textContent = message.text || "";

              if (!textContent && message.attachmentType === "image") {
                textContent = "[User sent an image]";
              } else if (!textContent && message.attachmentType === "file") {
                textContent = "[User sent a file]";
              }

              if (!textContent) {
                textContent = ".";
              }

              return { role, content: textContent };
            });

            let processedAttachment = attachment;
            let currentMessageContent:
              | string
              | Array<{ type: "text"; text: string } | { type: "image"; image: string | URL }> =
              textToSend;

            if (attachment && attachment.type === "image") {
              try {
                if (attachment.url.startsWith("data:")) {
                  processedAttachment = attachment;
                } else {
                  const response = await fetch(attachment.url);
                  const blob = await response.blob();
                  const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                  });
                  processedAttachment = { ...attachment, url: base64 };
                }
              } catch (error) {
                console.error("Failed to convert image to base64:", error);
              }
            }

            if (processedAttachment?.url && processedAttachment.type === "image") {
              currentMessageContent = [
                { type: "image", image: processedAttachment.url },
                { type: "text", text: textToSend || " " },
              ];

              if (replyToRef.current) {
                const replyText = `Replying to ${replyToRef.current.senderName || "User"}: "${replyToRef.current.text?.substring(0, 50)}..."\n\n`;
                const textPart = currentMessageContent.find((part) => part.type === "text");
                if (textPart) {
                  textPart.text = replyText + (textToSend || " ");
                }
              }
            } else {
              if (replyToRef.current) {
                const replyText = `Replying to ${replyToRef.current.senderName || "User"}: "${replyToRef.current.text?.substring(0, 50)}..."\n\n`;
                currentMessageContent = replyText + textToSend;
              }

              if (!currentMessageContent) {
                currentMessageContent = ".";
              }
            }

            const currentMessage: CoreMessage = {
              role: "user",
              content: currentMessageContent,
            };

            const data = await apiFetch<{ content: string }>("/api/chat", {
              method: "POST",
              body: {
                messages: [...history, currentMessage],
                model: "balanced",
              },
            });

            const isEnglishInput =
              /[a-zA-Z]/.test(textToSend) && !/[\u0600-\u06FF]/.test(textToSend);
            const responseText =
              data?.content?.trim() ||
              (isEnglishInput
                ? "I'm sorry, I couldn't generate a response right now. Please try asking again."
                : "عذراً، لم أتمكن من الحصول على إجابة الآن. يرجى المحاولة مرة أخرى.");

            const botLocalMsg = {
              id: "bot-" + Date.now(),
              text: responseText,
              senderId: "bot",
              senderName: languageRef.current === "ar" ? "المساعد الذكي" : "AI Assistant",
              timestamp: null,
              status: "sent",
              context: "bot",
              role: "assistant",
            } as unknown as ChatMessage;
            setAiMessages((prev) => [...prev, botLocalMsg]);

            await sendMessage(
              currentChatId,
              responseText,
              "bot",
              "AI Assistant",
              false,
              undefined,
              "bot"
            );
          } catch (error) {
            console.error("AI Chatbot Error:", error);
            const isEnglishInput =
              /[a-zA-Z]/.test(textToSend) && !/[\u0600-\u06FF]/.test(textToSend);
            const errorText = isEnglishInput
              ? "Sorry, a temporary connection error occurred. Please try again in a moment."
              : "عذراً، حدث خطأ مؤقت في الاتصال. يرجى المحاولة مرة أخرى بعد لحظات.";

            const errLocalMsg = {
              id: "err-" + Date.now(),
              text: errorText,
              senderId: "bot",
              senderName: languageRef.current === "ar" ? "المساعد الذكي" : "AI Assistant",
              timestamp: null,
              status: "sent",
              context: "bot",
              role: "assistant",
            } as unknown as ChatMessage;
            setAiMessages((prev) => [...prev, errLocalMsg]);
          } finally {
            setIsGenerating(false);
          }
        }

        setInput("");
        setReplyTo(null);
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error(language === "ar" ? "فشل إرسال الرسالة" : "Failed to send message");
        setIsGenerating(false);
      }
    },
    [currentChatId, user, language]
  );

  const handleReaction = useCallback(
    async (message: ChatMessage, emoji: string) => {
      if (!user) {
        return;
      }

      await toggleReaction(currentChatId, message.id, user.uid, emoji);
    },
    [currentChatId, user]
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      if (!user) {
        return;
      }

      try {
        await deleteMessage(currentChatId, messageId);
        toast.success(languageRef.current === "ar" ? "تم حذف الرسالة" : "Message deleted");
      } catch {
        toast.error(languageRef.current === "ar" ? "فشل حذف الرسالة" : "Failed to delete message");
      }
    },
    [currentChatId, user]
  );

  return {
    aiEnabled,
    chatbotEnabled,
    confirmClearChat,
    handleDeleteMessage,
    handleReaction,
    handleSend,
    input,
    isBtnHovered,
    isGenerating,
    isGeneratingWelcome,
    isOpen,
    isSolid,
    language,
    messages,
    mode,
    replyTo,
    setInput,
    setIsBtnHovered,
    setIsOpen,
    setMode: setModeAndClear,
    setReplyTo,
    setShowClearConfirm,
    showClearConfirm,
    toggleChat,
    unreadCount,
    user,
  };
}
