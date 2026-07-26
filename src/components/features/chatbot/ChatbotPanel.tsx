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
  isGeneratingWelcome?: boolean;
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
  isGeneratingWelcome,
  isSolid: _isSolid,
  language,
  messages,
  mode,
  onClearChat,
  onClose,
  replyTo,
  setInput,
  setReplyTo,
  setMode,
  aiEnabled: _aiEnabled,
  user,
}: ChatbotPanelProps) {
  const [mounted, setMounted] = React.useState(false);
  const [height, setHeight] = React.useState<number>(() => getStoredHeight() || DEFAULT_HEIGHT);
  const [isResizing, setIsResizing] = React.useState(false);
  const isDragging = React.useRef(false);
  const startY = React.useRef(0);
  const startHeight = React.useRef(0);
  const rafId = React.useRef<number | null>(null);

  React.useEffect(() => {
    setMounted(true);
    const stored = getStoredHeight();
    if (stored) setHeight(stored);
  }, []);

  // Smooth 60fps Resize handlers
  const handleResizeStart = React.useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      setIsResizing(true);
      startY.current = e.clientY;
      startHeight.current = height;
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [height]
  );

  const handleResizeMove = React.useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const clientY = e.clientY;
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const delta = startY.current - clientY;
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight.current + delta));
      setHeight(newHeight);
    });
  }, []);

  const handleResizeEnd = React.useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsResizing(false);
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
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
      }}
      exit={{
        opacity: 0,
        y: 20,
        scale: 0.95,
      }}
      style={{ height: `${height}px` }}
      className={cn(
        "fixed bottom-24 sm:bottom-28 right-4 md:right-6 z-50 flex w-[calc(100vw-2rem)] sm:w-[420px] md:w-[440px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-background/95 backdrop-blur-2xl shadow-2xl dark:border-white/10 dark:bg-background/95 max-h-[calc(100vh-7.5rem)]",
        isResizing
          ? "transition-none select-none pointer-events-auto"
          : "transition-all duration-200"
      )}
    >
      {/* Top Drag Handle Bar */}
      <div
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        className="group relative flex h-6 w-full cursor-ns-resize items-center justify-center bg-muted/40 transition-colors hover:bg-muted/70 active:bg-primary/20 shrink-0"
        title={language === "ar" ? "اسحب لتغيير الحجم" : "Drag to resize"}
      >
        <GripVertical className="h-3.5 w-3.5 rotate-90 text-muted-foreground transition-colors group-hover:text-foreground" />
      </div>

      {/* Header */}
      <div className="border-b border-border/50 bg-muted/30 px-4 py-3 shrink-0">
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
                {mode === "live"
                  ? language === "ar"
                    ? "متصل"
                    : "Online"
                  : language === "ar"
                    ? "نشط"
                    : "Active"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
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

      {/* Mode Switcher Bar */}
      <div className="px-3 py-2 border-b border-border/40 bg-muted/20 shrink-0">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-background/80 backdrop-blur-md rounded-2xl border border-border/40 shadow-inner relative">
          <button
            type="button"
            onClick={() => setMode("bot")}
            className={cn(
              "relative py-2 px-3 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 select-none overflow-hidden",
              mode === "bot" ? "text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {mode === "bot" && (
              <motion.div
                layoutId="activeModeTabPill"
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-md shadow-purple-500/25 z-0"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 text-sm pointer-events-none">🤖</span>
            <span className="relative z-10 pointer-events-none">
              {language === "ar" ? "المساعد الذكي (AI)" : "AI Assistant"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMode("live")}
            className={cn(
              "relative py-2 px-3 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 select-none overflow-hidden",
              mode === "live" ? "text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {mode === "live" && (
              <motion.div
                layoutId="activeModeTabPill"
                className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-md shadow-emerald-500/25 z-0"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 text-sm pointer-events-none">🎧</span>
            <span className="relative z-10 pointer-events-none">
              {language === "ar" ? "الدعم المباشر" : "Live Support"}
            </span>
          </button>
        </div>
      </div>

      <ChatMessages
        messages={messages}
        user={user}
        onReply={setReplyTo}
        onReact={handleReaction}
        onDelete={handleDeleteMessage}
        isGeneratingWelcome={mode === "bot" && isGeneratingWelcome}
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
