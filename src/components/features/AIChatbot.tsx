"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, Headphones } from "lucide-react";
import { useAuth, useLanguage, useSolidMode } from "@/contexts";
import { SiteSettings } from "@/types";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc } from "firebase/firestore";
import { sendMessage, clearChatHistory, toggleReaction, deleteMessage } from "@/lib/chatUtils";
import { ChatMessage } from "@/types";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ChatMessages } from "./chatbot/ChatMessages";
import { ChatInput } from "./chatbot/ChatInput";
import { getApiBaseUrl } from "@/lib/config";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import infoAnim from "react-useanimations/lib/info/info.json";

// Local definition to avoid import issues
type CoreMessage = {
  role: "user" | "assistant" | "system";
  content: string | Array<{ type: "text"; text: string } | { type: "image"; image: string | URL }>;
};

/**
 * LiveSupportChat - Live Support Chat Component
 * Simplified version for live human support only (bot removed).
 */
export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  // AI State
  const [mode, setMode] = useState<"live" | "bot">("bot"); // Default to bot
  const [isGenerating, setIsGenerating] = useState(false); // Validating network request
  const [aiEnabled, setAiEnabled] = useState(true); // Global AI Toggle state

  // Interaction State
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  // Firestore Messages State
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { user } = useAuth();
  const { language } = useLanguage();
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const { isSolid } = useSolidMode();

  // Refs to track state inside effect without triggering re-subscription
  const isOpenRef = useRef(isOpen);
  const languageRef = useRef(language);

  // Determine Chat ID based on mode
  // Determine Chat ID based on mode
  // Legacy history (mostly AI) is in user.uid -> So "bot" gets user.uid
  // Live Support get a new separate ID -> user.uid_support
  const currentChatId = mode === "bot" ? (user?.uid ?? "guest") : `${user?.uid ?? "guest"}_support`;

  // Update refs when state changes
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Listen for Custom Event to Open Chatbot (e.g. from Profile Menu)
  useEffect(() => {
    const handleOpenChatbot = (event: Event) => {
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail;

      setIsOpen(true);

      if (detail?.mode === "live") {
        setMode("live");
      } else if (detail?.mode === "fill" && detail.message) {
        setMode("live"); // Contact support implies live
        setInput(detail.message);
        // Do NOT send automatically
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

  // Listen for Global Settings (AI Toggle)
  useEffect(() => {
    const settingsRef = doc(db, "settings", "global");
    const unsubscribe = onSnapshot(
      settingsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SiteSettings;
          setAiEnabled(data.aiEnabled ?? true);
          // Force Live mode if AI is disabled
          if (data.aiEnabled === false) {
            setMode("live");
          }
        }
      },
      (error) => {
        console.error("AIChatbot: Settings listener error", error);
        // Fallback: assume AI is enabled if we can't read settings
        setAiEnabled(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Listen for messages (Based on Mode -> Chat ID)
  useEffect(() => {
    if (!user) return;

    // Separate collections for AI and Live
    const q = query(collection(db, `chats/${currentChatId}/messages`), orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(
        (docSnapshot) =>
          ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }) as ChatMessage
      );

      // Notification Logic: Auto-switch to Live if admin replies
      // We only duplicate this check for 'live' mode notifications when in 'bot' mode
      // BUT now we have separate listeners. So we need to listen to LIVE chat even if in BOT mode.
      // We'll handle that in a separate effect below.

      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user, currentChatId]);

  // Background Listener for Live Chat Notifications (when in Bot mode)
  useEffect(() => {
    if (!user || mode === "live") return;

    const q = query(collection(db, `chats/${user.uid}/messages`), orderBy("timestamp", "asc"));

    // Initial load flag to prevent notification on first mount
    let isInitialLoad = true;

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => d.data() as ChatMessage);

      if (!isInitialLoad && msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg?.senderId === "admin") {
          const currentLang = languageRef.current;
          toast.info(
            currentLang === "ar" ? "رسالة جديدة من الدعم الفني" : "New message from Support",
            {
              action: {
                label: currentLang === "ar" ? "فتح" : "Open",
                onClick: () => setMode("live"),
              },
              duration: 5000,
            }
          );
        }
      }
      isInitialLoad = false;
    });

    return () => unsubscribe();
  }, [user, mode]);

  // Listen to Chat Session (Unread Count - Only for Live)
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "chats", user.uid), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setUnreadCount(data.unreadCount || 0);
      }
    });

    // Auto-switch to Live checking
    if (isOpen && unreadCount > 0 && mode === "bot") {
      // Only if user interaction logic requires it, but simpler to let them click toast
      // or user request: "click on the chatbot it open to the live support"
    }

    return () => unsub();
  }, [user, isOpen, unreadCount, mode]);

  // Auto-switch to Live Mode if opening with unread admin messages
  useEffect(() => {
    if (isOpen && unreadCount > 0 && mode === "bot") {
      setMode("live");
    }
  }, [isOpen, unreadCount, mode]);

  const confirmClearChat = async () => {
    if (!user) return;
    try {
      await clearChatHistory(currentChatId);
      toast.success(language === "ar" ? "تم مسح المحادثة" : "Chat history cleared");
      setShowClearConfirm(false);
    } catch {
      toast.error("Failed to clear history");
    }
  };

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      // Auto-switch logic in effect
    } else {
      setIsOpen(false);
    }
  };

  const handleSend = async (
    textOverride?: string,
    attachment?: {
      url: string;
      name: string;
      size: number;
      type: "image" | "document";
    }
  ) => {
    console.log("handleSend CALLED with:", { textOverride, attachment });
    const textToSend = textOverride || input;
    if ((!textToSend.trim() && !attachment) || !user) return;

    if (!textOverride) {
      setInput("");
      setReplyTo(null);
    }

    try {
      // 1. Save User Message
      await sendMessage(
        currentChatId,
        textToSend,
        user.uid,
        user.displayName || "User",
        false, // isAdmin
        replyTo
          ? {
              id: replyTo.id,
              text: replyTo.text || "",
              senderName: replyTo.senderName || "User",
              attachmentUrl: replyTo.attachmentUrl || undefined,
              attachmentType: replyTo.attachmentType || undefined,
            }
          : undefined,
        "live", // Context is always 'live' relative to the session type now
        attachment ? { ...attachment, type: attachment.type } : undefined,
        // Add metadata for AI session
        currentChatId.endsWith("_ai") ? { isAI: true, taskData: { title: "AI Chat" } } : undefined,
        user.photoURL
      );

      // 2. If Bot Mode, Trigger AI
      if (mode === "bot") {
        setIsGenerating(true);
        try {
          // Radical Fix: Prepare history as strictly TEXT-ONLY Strings to satisfy validation
          // We intentionally flatten everything to avoid "expected string, received array" errors
          const history = messages.slice(-5).map((m): CoreMessage => {
            const role = (m.senderId === user?.uid ? "user" : "assistant") as "user" | "assistant";

            // Force content to be string.
            // If manual "replyTo" text helps context, prepend it here as string.
            let textContent = m.text || "";
            if (m.replyTo) {
              // Context handled via text prepend if needed logic was here
            }

            // Handle "Image sent" placeholder
            if (!textContent && m.attachmentType === "image") {
              textContent = "[User sent an image]";
            } else if (!textContent && m.attachmentType === "file") {
              textContent = "[User sent a file]";
            }

            // Fallback for empty messages (shouldn't happen but for safety)
            if (!textContent) textContent = ".";

            return { role, content: textContent };
          });

          // Convert attachment to Base64 (Keep existing logic)
          let processedAttachment = attachment;
          let currentMessageContent:
            | string
            | Array<{ type: "text"; text: string } | { type: "image"; image: string | URL }> =
            textToSend;

          if (attachment && attachment.url.startsWith("blob:")) {
            try {
              const response = await fetch(attachment.url);
              const blob = await response.blob();
              const base64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
              processedAttachment = { ...attachment, url: base64 };
            } catch (err) {
              console.error("Failed to convert blob to base64:", err);
            }
          }

          // Strict Content Formatting for Current Message
          if (processedAttachment?.url && processedAttachment.type === "image") {
            // ONLY use Array if there is an image
            currentMessageContent = [
              { type: "image", image: processedAttachment.url },
              { type: "text", text: textToSend || " " }, // Ensure text part exists
            ];
            // If replying, we can prepend context to text part if needed, but keeping it simple is safer
            if (replyTo) {
              const replyText = `Replying to ${replyTo.senderName || "User"}: "${replyTo.text?.substring(0, 50)}..."\n\n`;
              const textPart = (
                currentMessageContent as Array<{ type: "text"; text: string }>
              ).find((p) => p.type === "text");
              if (textPart) {
                textPart.text = replyText + (textToSend || " ");
              }
            }
          } else {
            // Text Only -> Force String
            if (replyTo) {
              const replyText = `Replying to ${replyTo.senderName || "User"}: "${replyTo.text?.substring(0, 50)}..."\n\n`;
              currentMessageContent = replyText + textToSend;
            }
            // Ensure it's not empty
            if (!currentMessageContent) currentMessageContent = ".";
          }

          const currentMessage: CoreMessage = {
            role: "user",
            content: currentMessageContent,
          };

          // Restore history (cleaned) + current message
          // Restore history (cleaned) + current message
          const payloadMessages = [...history, currentMessage];
          console.log("AI PAYLOAD (Client):", JSON.stringify(payloadMessages, null, 2));

          const baseUrl = getApiBaseUrl();
          const response = await fetch(`${baseUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: payloadMessages,
              model: "balanced",
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("AI Error Details:", errorData);
            throw new Error(errorData.error || "AI Request Failed");
          }

          const data = await response.json();

          // Save Bot Response
          await sendMessage(
            currentChatId,
            data.content,
            "bot",
            "AI Assistant",
            false,
            undefined,
            "bot"
          );
        } catch (e) {
          console.error(e);
          await sendMessage(
            currentChatId,
            language === "ar" ? "عذراً، حدث خطأ." : "Sorry, error occurred.",
            "bot",
            "AI Assistant",
            false,
            undefined,
            "bot"
          );
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
        onMouseEnter={() => setIsBtnHovered(true)}
        onMouseLeave={() => setIsBtnHovered(false)}
        aria-label={
          isOpen
            ? language === "ar"
              ? "إغلاق المحادثة"
              : "Close chat"
            : language === "ar"
            ? "فتح المحادثة"
            : "Open chat"
        }
        className={cn(
          "fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 rounded-2xl shadow-2xl flex items-center justify-center z-50 transition-all duration-300 group overflow-hidden box-border border-0 outline-none ring-0 bg-linear-to-tr from-primary via-purple-500 to-indigo-600 text-primary-foreground hover:shadow-primary/50"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.2 }}
              className="dark:text-black"
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.2 }}
              className="relative dark:text-zinc-950"
            >
              <div className="flex items-center justify-center">
                <AnimatedIcon
                  icon={infoAnim}
                  size={32}
                  useAnimation
                  active={isBtnHovered}
                  className="brightness-0 invert dark:invert-0"
                />
              </div>
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
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{
              opacity: 1,
              filter: "blur(0px)",
              transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
            }}
            exit={{
              opacity: 0,
              filter: "blur(10px)",
              transition: { duration: 0.2, ease: "easeIn" },
            }}
            className={cn(
              "fixed bottom-24 z-200 w-[420px] max-w-[calc(100vw-2rem)] h-[650px] max-h-[calc(100vh-8rem)] rounded-2xl flex flex-col overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.1)] dark:shadow-2xl border border-black/5 dark:border-white/10 transition-all duration-300",
              isSolid ? "bg-background shadow-xl" : "bg-background/80 backdrop-blur-xl",
              language === "ar" ? "left-6 origin-bottom-left" : "right-6 origin-bottom-right"
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex flex-col gap-3 bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar/Icon based on Mode */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                      mode === "bot"
                        ? "bg-purple-500/20 text-purple-500"
                        : "bg-green-500/20 text-green-500"
                    )}
                  >
                    {mode === "bot" ? "🧠" : <Headphones className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">
                      {mode === "live"
                        ? language === "ar"
                          ? "الدعم المباشر"
                          : "Live Support"
                        : language === "ar"
                          ? "المساعد الذكي"
                          : "AI Assistant"}
                    </h3>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full animate-pulse",
                          mode === "live" ? "bg-green-500" : "bg-purple-500"
                        )}
                      />
                      {mode === "live" ? "Online" : "Gemini Flash"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle Mode Button - Hidden if AI is disabled */}
                  {aiEnabled && (
                    <button
                      onClick={() => setMode(mode === "live" ? "bot" : "live")}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 transition-colors flex items-center gap-1.5"
                    >
                      {mode === "bot" ? (
                        <>
                          <Headphones className="w-3 h-3" />
                          {language === "ar" ? "تحدث مع الدعم" : "Live Support"}
                          {unreadCount > 0 && (
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          )}
                        </>
                      ) : (
                        <>
                          <span>🧠</span>
                          {language === "ar" ? "الذكاء الاصطناعي" : "AI Assistant"}
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-full transition-colors"
                    aria-label={language === "ar" ? "مسح المحادثة" : "Clear chat history"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    aria-label={language === "ar" ? "إغلاق" : "Close"}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
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

            {isGenerating && (
              <div className="px-4 py-2 text-xs text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                {language === "ar" ? "يكتب الآن..." : "Thinking..."}
              </div>
            )}

            {/* Input - Safe Area for Mobile */}
            <div className="pb-[env(safe-area-inset-bottom)]">
              <ChatInput
                input={input}
                setInput={setInput}
                handleSend={handleSend}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                disabled={isGenerating}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
