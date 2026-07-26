"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { Headphones, Trash2, X, GripVertical } from "lucide-react";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ChatMessage, User } from "@/types";
import { cn } from "@/lib/utils";
import { ChatbotMode } from "./useAIChatbot";

interface ChatbotPanelProps {
  handleDeleteMessage: (messageId: string) => Promise<void>;
  handleReaction: (message: ChatMessage, emoji: string) => Promise<void>;
  handleSend: (
    textOverride?: string,
    attachment?: { url: string; name: string; size: number; type: "image" | "document" }
  ) => Promise<void>;
  input: string;
  isGenerating: boolean;
  isSolid: boolean;
  language: string;
  messages: ChatMessage[];
  mode: ChatbotMode;
  onClearChat: () => void;
  onClose: () => void;
  replyTo: ChatMessage | null;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setReplyTo: React.Dispatch<React.SetStateAction<ChatMessage | null>>;
  setMode: (mode: ChatbotMode) => void;
  aiEnabled: boolean;
  unreadCount: number;
  user: User;
}

const MIN_HEIGHT = 400;
const MAX_HEIGHT = 900;
const DEFAULT_HEIGHT = 580;

function getStoredHeight(): number | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("chatbot-height");
  if (stored) {
    const n = parseInt(stored, 10);
    if (!isNaN(n) && n >= MIN_HEIGHT && n <= MAX_HEIGHT) return n;
  }
  return null;
}

export function ChatbotPanel({
  handleDeleteMessage,
  handleReaction,
  handleSend,
  input,
  isGenerating,
  isSolid,
  language,
  messages,
  mode,
  onClearChat,
  onClose,
  replyTo,
  setInput,
  setReplyTo,
  setMode,
  _aiEnabled,
  user,
}: ChatbotPanelProps) {
  const [mounted, setMounted] = React.useState(false);
  const [height, setHeight] = React.useState<number>(() => getStoredHeight() || DEFAULT_HEIGHT);
  const isDragging = React.useRef(false);
  const startY = React.useRef(0);
  const startHeight = React.useRef(0);

  React.useEffect(() => {
    setMounted(true);
    const stored = getStoredHeight();
    if (stored) setHeight(stored);
  }, []);

  // Resize handlers
  const handleResizeStart = React.useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      startY.current = e.clientY;
      startHeight.current = height;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [height]
  );

  const handleResizeMove = React.useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = startY.current - e.clientY;
    const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight.current + delta));
    setHeight(newHeight);
  }, []);

  const handleResizeEnd = React.useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    const delta = startY.current - e.clientY;
    const finalHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight.current + delta));
    setHeight(finalHeight);
    localStorage.setItem("chatbot-height", String(finalHeight));
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          damping: 25,
          stiffness: 300,
          mass: 0.8,
        },
      }}
      exit={{
        opacity: 0,
        y: 20,
        scale: 0.95,
        transition: { duration: 0.2, ease: "easeIn" },
      }}
      className={cn(
        "fixed z-200 flex flex-col overflow-hidden shadow-2xl",
        // Mobile: full-width floating card
        "inset-x-2 sm:inset-x-auto sm:w-[400px] bottom-[env(safe-area-inset-bottom,0.5rem)] top-auto sm:bottom-20 max-h-[calc(100vh-6rem)] rounded-3xl border border-border/30",
        // Desktop: positioned, resizable
        "md:bottom-24 md:w-[420px] md:top-auto md:max-h-[calc(100vh-8rem)] md:inset-x-auto",
        isSolid
          ? "bg-background md:border-border"
          : "bg-background/80 backdrop-blur-2xl backdrop-saturate-150 dark:md:border-white/10 md:border-black/5",
        language === "ar"
          ? "sm:left-4 sm:right-auto md:left-6 origin-bottom-left"
          : "sm:right-4 sm:left-auto md:right-6 origin-bottom-right"
      )}
      style={{
        height: `${height}px`,
        WebkitBackdropFilter: isSolid ? "none" : "blur(20px) saturate(140%)",
        backdropFilter: isSolid ? "none" : "blur(20px) saturate(140%)",
        willChange: "transform, opacity",
      }}
    >
      {/* Resize Handle - Mobile & Desktop */}
      <div
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        className="flex shrink-0 items-center justify-center h-6 sm:h-4 cursor-ns-resize group hover:bg-primary/5 transition-colors touch-none"
      >
        <GripVertical
          size={16}
          className="text-muted-foreground/40 group-hover:text-primary/60 rotate-90 transition-colors"
        />
      </div>

      {/* Header */}
      <div className="flex shrink-0 flex-col gap-3 border-b border-border/20 bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-transform duration-300 hover:scale-110",
                mode === "bot"
                  ? "bg-purple-500/15 text-purple-500"
                  : "bg-green-500/15 text-green-500"
              )}
            >
              {mode === "bot" ? "🧠" : <Headphones className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                {mode === "live"
                  ? language === "ar"
                    ? "الدعم المباشر"
                    : "Live Support"
                  : language === "ar"
                    ? "المساعد الذكي"
                    : "AI Assistant"}
              </h3>
              <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]",
                    mode === "live" ? "bg-green-500" : "bg-purple-500"
                  )}
                />
                {mode === "live" ? "Online" : "Gemini Flash"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 mx-1.5 bg-background/60 backdrop-blur-md rounded-xl p-1 border border-border/40 shadow-inner">
              <button
                type="button"
                onClick={() => setMode("bot")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1",
                  mode === "bot"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>🤖</span>
                <span>{language === "ar" ? "ذكاء اصطناعي" : "AI"}</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("live")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1",
                  mode === "live"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span>🎧</span>
                <span>{language === "ar" ? "مباشر" : "Live"}</span>
              </button>
            </div>
            <button
              onClick={onClearChat}
              className="rounded-xl p-2 text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive active:scale-90"
              aria-label={language === "ar" ? "مسح المحادثة" : "Clear chat history"}
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 transition-all duration-200 hover:bg-muted active:scale-90"
              aria-label={language === "ar" ? "إغلاق" : "Close"}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <ChatMessages
        messages={messages}
        user={user}
        onReply={setReplyTo}
        onReact={handleReaction}
        onDelete={handleDeleteMessage}
      />

      {isGenerating && mode === "bot" && (
        <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
          <div className="flex gap-1">
            <div
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-500"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-500"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-500"
              style={{ animationDelay: "300ms" }}
            />
          </div>
          {language === "ar" ? "يفكر الآن..." : "Thinking..."}
        </div>
      )}

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
  );
}
