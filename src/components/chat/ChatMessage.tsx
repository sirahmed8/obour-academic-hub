"use client";

import { useState, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Headphones, Volume2, Sparkles } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { ChatMessage, User, TodoTask } from "@/types";
import { FileAttachmentDisplay } from "@/components/features/FileUpload";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
const REMARK_PLUGINS = [remarkGfm];

function safeUrlTransform(url: string) {
  const value = (url ?? "").trim();
  if (!value) return "";

  // Allow same-page anchors and relative URLs
  if (value.startsWith("#") || value.startsWith("/")) return value;

  try {
    const parsed = new URL(value);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === "http:" || protocol === "https:" || protocol === "mailto:") {
      return parsed.toString();
    }
  } catch {
    // Invalid URL => strip it
  }

  return "";
}

// Memoized Markdown component to prevent expensive re-parsing when parent re-renders
const MarkdownContent = memo(function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={REMARK_PLUGINS}
      urlTransform={safeUrlTransform}
      components={{
        a: ({ children, ...props }) => (
          <a {...props} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

interface ChatMessageProps {
  message: ChatMessage;
  user: User; // Current logged-in user
  isUser: boolean;
  onReply?: (msg: ChatMessage) => void;
  onReact?: (msg: ChatMessage, emoji: string) => void;
  onDelete?: (msgId: string) => void;
  isAdminView?: boolean;
  onTaskAction?: (action: "confirm" | "edit", taskData: Partial<TodoTask>) => void;
}

export const ChatMessageItem = memo(function ChatMessageItem({
  message: msg,
  user,
  isUser,
  onReply,
  onReact,
  onDelete,
  onTaskAction,
}: ChatMessageProps) {
  const isBot = msg.senderId === "bot";
  const [showPicker, setShowPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [pickerPlacement, setPickerPlacement] = useState<"above" | "below">("above");
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const reactButtonRef = useRef<HTMLButtonElement>(null);

  // Parse suggestions and clean text if present
  const { cleanText, suggestions } = (() => {
    const raw = msg.text || "";
    const match = raw.match(/\[SUGGESTIONS:\s*(.+?)\]/);
    if (!match) return { cleanText: raw, suggestions: [] as string[] };
    const textWithout = raw.replace(/\[SUGGESTIONS:\s*(.+?)\]/, "").trim();
    const parsedChips = match[1]
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 3);
    return { cleanText: textWithout, suggestions: parsedChips };
  })();

  const fallbackSpeech = (textToSpeak: string) => {
    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = "ar-SA";
        utterance.onend = () => setIsPlayingTTS(false);
        utterance.onerror = () => setIsPlayingTTS(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingTTS(false);
      }
    } catch {
      setIsPlayingTTS(false);
    }
  };

  const handlePlayTTS = async () => {
    if (isPlayingTTS) return;
    const textToPlay = cleanText.slice(0, 180).trim();
    if (!textToPlay) return;

    setIsPlayingTTS(true);
    try {
      const audio = new Audio(`/api/ai/tts?text=${encodeURIComponent(textToPlay)}`);
      audio.onended = () => setIsPlayingTTS(false);
      audio.onerror = () => fallbackSpeech(textToPlay);
      await audio.play();
    } catch {
      fallbackSpeech(textToPlay);
    }
  };

  const formattedTime = (() => {
    const rawMsg = msg as unknown as Record<string, unknown>;
    const ts = (msg.timestamp || rawMsg.createdAt) as
      | { toDate?: () => Date; seconds?: number }
      | string
      | number
      | Date
      | undefined;
    if (!ts) return "Just now";
    try {
      if (
        typeof ts === "object" &&
        ts !== null &&
        "toDate" in ts &&
        typeof ts.toDate === "function"
      ) {
        return ts.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      if (
        typeof ts === "object" &&
        ts !== null &&
        "seconds" in ts &&
        typeof ts.seconds === "number"
      ) {
        return new Date(ts.seconds * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      const d = new Date(ts as string | number | Date);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
    } catch {
      // fallback
    }
    return "Just now";
  })();

  const handleTogglePicker = () => {
    if (!showPicker && reactButtonRef.current) {
      const buttonRect = reactButtonRef.current.getBoundingClientRect();
      const scrollContainer = reactButtonRef.current.closest(".overflow-y-auto");

      let shouldShowBelow = false;

      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        // Check if button is too close to the top of the SCROLL CONTAINER
        // 150px safety margin for the picker height
        if (buttonRect.top - containerRect.top < 150) {
          shouldShowBelow = true;
        }
      } else {
        // Fallback to viewport top check if no container found
        if (buttonRect.top < 150) {
          shouldShowBelow = true;
        }
      }

      setPickerPlacement(shouldShowBelow ? "below" : "above");
    }
    setShowPicker(!showPicker);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 max-w-[70%] group relative mb-6", // Reduced max-width for actions space
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {/* Avatar Bubble */}
      <div className="shrink-0 self-end mb-1">
        {isUser ? (
          <div className="w-8 h-8 rounded-full overflow-hidden border border-border shadow-sm">
            {/* Using UI Avatars as fallback if no photoURL */}
            <Image
              src={
                user.photoURL ||
                `https://ui-avatars.com/api/?name=${user.displayName}&background=random`
              }
              alt="User"
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          </div>
        ) : isBot ? (
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center shadow-md ring-2 ring-background">
            <Bot className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center shadow-md ring-2 ring-background">
            <Headphones className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-col max-w-full relative">
        {/* Reply Context */}
        {msg.replyTo && (
          <div
            className={cn(
              "text-[10px] px-3 py-1.5 rounded-t-xl mb-[-4px] border-b border-white/20 dark:border-white/10 w-full shadow-sm flex items-center gap-2 backdrop-blur-xl backdrop-saturate-150",
              isUser
                ? "bg-primary/30 text-white"
                : "bg-background/60 dark:bg-background/60 text-muted-foreground"
            )}
          >
            <span className="font-bold shrink-0">{msg.replyTo.senderName}:</span>

            {msg.replyTo.attachmentUrl && msg.replyTo.attachmentType?.startsWith("image") && (
              <div className="relative w-5 h-5 rounded overflow-hidden shrink-0">
                <Image
                  src={msg.replyTo.attachmentUrl}
                  alt="Reply Image"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="truncate min-w-0 opacity-80">
              {msg.replyTo.text ||
                (msg.replyTo.attachmentUrl && !msg.replyTo.attachmentType?.startsWith("image")
                  ? "File"
                  : "")}
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div
          onClick={() => setShowActions((prev) => !prev)}
          className={cn(
            "px-4 py-2.5 shadow-sm text-sm relative z-10 cursor-pointer select-text",
            // Shape styling based on sender
            isUser
              ? "bg-linear-to-br from-primary via-purple-600 to-indigo-600 text-white rounded-3xl rounded-tr-md shadow-indigo-500/20"
              : isBot
                ? "bg-linear-to-br from-slate-800 to-slate-900 border border-white/10 text-white rounded-3xl rounded-tl-md shadow-md"
                : "bg-background border border-border text-foreground rounded-3xl rounded-tl-md shadow-md"
          )}
        >
          {msg.isDeleted ? (
            <span className="italic opacity-70 text-xs flex items-center gap-1">🚫 {msg.text}</span>
          ) : (
            <>
              {msg.attachmentUrl && (
                <div className="mb-2 -mx-2">
                  <FileAttachmentDisplay
                    attachment={{
                      url: msg.attachmentUrl,
                      type: (msg.attachmentType as "image" | "document") || "document",
                      name: msg.attachmentName || "Attachment",
                      size: msg.attachmentSize || 0,
                    }}
                  />
                </div>
              )}

              {/* Only render text wrapper if there IS text to avoid empty bubble */}
              {cleanText && cleanText.trim() !== "" && (
                <div className="leading-relaxed wrap-break-word whitespace-pre-wrap prose prose-sm max-w-none prose-p:my-0 prose-ul:my-1 prose-li:my-0 prose-pre:my-1 prose-code:bg-black/10 prose-code:rounded prose-code:px-1 prose-code:py-0.5">
                  {msg.senderId === "bot" ? <MarkdownContent content={cleanText} /> : cleanText}
                </div>
              )}

              {/* 🔊 Listen Voice Button for Bot responses */}
              {isBot && !msg.isDeleted && cleanText && (
                <button
                  type="button"
                  onClick={handlePlayTTS}
                  className="flex items-center gap-1.5 mt-2 px-3 py-1 text-[11px] font-bold rounded-full bg-white/10 hover:bg-white/20 transition-all text-white/90 shadow-sm"
                >
                  <Volume2
                    className={cn("w-3.5 h-3.5", isPlayingTTS && "animate-pulse text-amber-400")}
                  />
                  <span>{isPlayingTTS ? "جاري التشغيل..." : "🔊 استمع للصوت"}</span>
                </button>
              )}

              {/* Follow-up Suggestion Chips */}
              {isBot && suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                  {suggestions.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(
                          new CustomEvent("openChatbot", {
                            detail: { mode: "fill", message: chip },
                          })
                        );
                      }}
                      className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 transition-all active:scale-95 text-start"
                    >
                      <Sparkles size={10} className="text-amber-400 shrink-0" />
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Timestamp moved inside bubble for cleaner look */}
          <div
            className={cn(
              "flex items-center gap-1 mt-1 px-1 opacity-70 text-[9px] select-none",
              isUser ? "justify-end text-white/80" : "justify-start text-muted-foreground"
            )}
          >
            {formattedTime}
          </div>
        </div>

        {/* Task Confirmation Card */}
        {isBot && msg.action === "confirm_task" && msg.taskData && onTaskAction && (
          <div className="mt-4 bg-card/50 rounded-xl p-3 border border-border/50 shadow-sm">
            <div className="flex flex-col gap-1 mb-3">
              <span className="font-bold text-base">{msg.taskData.title}</span>
              <div className="flex gap-2 text-xs opacity-80">
                {msg.taskData.priority && (
                  <span className="capitalize">{msg.taskData.priority} Priority</span>
                )}
                {msg.taskData.repeat && msg.taskData.repeat !== "none" && (
                  <span>• {msg.taskData.repeat}</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onTaskAction("confirm", msg.taskData!)}
                className="flex-1 bg-primary text-primary-foreground py-1.5 rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => onTaskAction("edit", msg.taskData!)}
                className="flex-1 bg-muted hover:bg-muted/80 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        )}

        {/* Reactions Display */}
        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
          <div
            className={cn(
              "flex gap-1 mt-1 bg-background/80 backdrop-blur-sm shadow-sm border border-border rounded-full px-2 py-1 w-fit absolute -bottom-4 scale-90 z-20",
              isUser ? "right-2" : "left-2"
            )}
            aria-label="Reactions"
          >
            {Object.entries(msg.reactions).map(([reactorId, emoji]) => (
              <span
                key={reactorId}
                className={cn(
                  "text-sm leading-none transition-transform",
                  reactorId === user.uid && "scale-125 drop-shadow-[0_0_4px_rgba(99,102,241,0.8)]"
                )}
                role="img"
                aria-label={emoji}
                title={reactorId === user.uid ? "Your reaction" : ""}
              >
                {emoji}
              </span>
            ))}
          </div>
        )}

        {/* Actions (Reply, React, Delete) - Repositioned with fixed sleek background */}
        {!msg.isDeleted && (
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 flex items-center gap-1 transition-all duration-300 z-50 px-2",
              showActions
                ? "opacity-100 pointer-events-auto scale-100"
                : "opacity-0 pointer-events-none scale-95 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:scale-100 focus-within:opacity-100 focus-within:pointer-events-auto",
              isUser ? "right-full mr-1" : "left-full ml-1"
            )}
          >
            <div className="flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-full p-1 shadow-lg transform hover:scale-105 transition-transform">
              {onReply && (
                <button
                  onClick={() => onReply(msg)}
                  className="p-1.5 rounded-full hover:bg-white/50 dark:hover:bg-white/10 text-muted-foreground hover:text-primary transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
                  title="Reply"
                  aria-label="Reply"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 17 4 12 9 7" />
                    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                  </svg>
                </button>
              )}
              {onReact && (
                <button
                  ref={reactButtonRef}
                  onClick={handleTogglePicker}
                  className="p-1.5 rounded-full hover:bg-white/50 dark:hover:bg-white/10 text-muted-foreground hover:text-primary transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none"
                  title="React"
                  aria-label="React"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" />
                    <line x1="15" y1="9" x2="15.01" y2="9" />
                  </svg>
                </button>
              )}
              {onDelete && isUser && (
                <button
                  onClick={() => onDelete(msg.id)}
                  className="p-1.5 rounded-full hover:bg-white/50 dark:hover:bg-white/10 text-muted-foreground hover:text-destructive transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 outline-none"
                  title="Delete"
                  aria-label="Delete"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Emoji Picker Popup - Positioned above the action buttons */}
        <AnimatePresence>
          {showPicker && onReact && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "absolute z-50 flex gap-1 bg-zinc-100/90 dark:bg-zinc-800/90 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/10",
                isUser ? "right-0" : "left-0",
                pickerPlacement === "above" ? "bottom-full mb-3" : "top-full mt-3"
              )}
            >
              {QUICK_EMOJIS.map((emoji) => {
                const isSelected =
                  msg.reactions &&
                  Object.values(msg.reactions).includes(emoji) &&
                  Object.entries(msg.reactions).some(([id, e]) => id === user.uid && e === emoji);
                return (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(msg, emoji);
                      setShowPicker(false);
                    }}
                    className={cn(
                      "hover:scale-125 transition-all text-lg leading-none p-1.5 rounded-full",
                      isSelected && "bg-primary/20 scale-125 shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                    )}
                    aria-label={`React with ${emoji}`}
                    title={isSelected ? "Your current reaction" : ""}
                  >
                    {emoji}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});
