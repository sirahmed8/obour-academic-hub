"use client";

import { useState, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Headphones } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { ChatMessage, User, TodoTask } from "@/types";
import { FileAttachmentDisplay } from "@/components/features/FileUpload";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
const REMARK_PLUGINS = [remarkGfm];

// Memoized Markdown component to prevent expensive re-parsing when parent re-renders
const MarkdownContent = memo(function MarkdownContent({ content }: { content: string }) {
  return <ReactMarkdown remarkPlugins={REMARK_PLUGINS}>{content}</ReactMarkdown>;
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
  const [pickerPlacement, setPickerPlacement] = useState<"above" | "below">("above");
  const reactButtonRef = useRef<HTMLButtonElement>(null);

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
        "flex gap-3 max-w-[85%] group relative mb-4", // Added mb-4 for action spacing
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
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-primary/60 flex items-center justify-center shadow-md ring-2 ring-background">
            <Bot className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-md ring-2 ring-background">
            <Headphones className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      <div className="flex flex-col max-w-full relative">
        {/* Reply Context */}
        {msg.replyTo && (
          <div
            className={cn(
              "text-[10px] px-3 py-1.5 rounded-t-xl mb-[-4px] border-b border-transparent w-full opacity-80 backdrop-blur-sm shadow-sm flex items-center gap-2",
              isUser ? "bg-primary/20 text-foreground" : "bg-muted/50 text-muted-foreground"
            )}
          >
            {msg.replyTo.attachmentUrl && msg.replyTo.attachmentType?.startsWith("image") && (
              <div className="relative w-6 h-6 rounded overflow-hidden shrink-0">
                <Image
                  src={msg.replyTo.attachmentUrl}
                  alt="Reply Image"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span className="font-bold mr-1">{msg.replyTo.senderName}:</span>
              {msg.replyTo.attachmentUrl && !msg.replyTo.text
                ? "Image"
                : msg.replyTo.text.slice(0, 30) + (msg.replyTo.text.length > 30 ? "..." : "")}
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "px-4 py-2.5 shadow-sm text-sm relative z-10",
            // Shape styling based on sender
            isUser
              ? "bg-linear-to-br from-primary via-purple-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-500/20"
              : isBot
                ? "bg-linear-to-br from-slate-800 to-slate-900 border border-white/10 text-white rounded-2xl rounded-tl-sm shadow-md"
                : "bg-background border border-border text-foreground rounded-2xl rounded-tl-sm shadow-md"
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
              {msg.text && msg.text.trim() !== "" && (
                <div className="leading-relaxed break-words whitespace-pre-wrap prose prose-sm max-w-none wrap-break-word prose-p:my-0 prose-ul:my-1 prose-li:my-0 prose-pre:my-1 prose-code:bg-black/10 prose-code:rounded prose-code:px-1 prose-code:py-0.5">
                  {msg.senderId === "bot" ? <MarkdownContent content={msg.text} /> : msg.text}
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
            {msg.timestamp?.seconds
              ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Sending..."}
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
              "flex gap-1 mt-1 bg-background/80 backdrop-blur-sm shadow-sm border border-border rounded-full px-2 py-1 w-fit absolute -bottom-8 scale-90 z-20",
              isUser ? "left-0" : "right-0" // Opposite side of actions if possible, or just default
            )}
            style={{ bottom: -35 }} // Explicit positioning
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

        {/* Actions (Reply, React, Delete) - MOVED TO BOTTOM */}
        {!msg.isDeleted && (
          <div
            className={cn(
              "absolute -bottom-9 flex items-center gap-1 transition-opacity duration-200 z-10",
              // Mobile: Always visible. Desktop: Hover.
              "opacity-100 lg:opacity-0 lg:group-hover:opacity-100",
              isUser ? "right-0 flex-row-reverse" : "left-0"
            )}
          >
            {onReply && (
              <button
                onClick={() => onReply(msg)}
                className="p-1.5 bg-background shadow-sm border border-border rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors hover:scale-110"
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
                  strokeWidth="2"
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
                className="p-1.5 bg-background shadow-sm border border-border rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors hover:scale-110"
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
                  strokeWidth="2"
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
                className="p-1.5 bg-background shadow-sm border border-border rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors hover:scale-110"
                title="Delete for everyone"
                aria-label="Delete"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            )}
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
                "absolute z-50 flex gap-1 bg-background p-2 rounded-2xl shadow-xl border border-border",
                isUser ? "right-0" : "left-0",
                pickerPlacement === "above" ? "bottom-full mb-2" : "top-full mt-2"
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

        {/* Mobile Timestamp & State - Moved inside flex-col to sit BELOW message */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1 px-1 opacity-70",
            isUser ? "self-end" : "self-start"
          )}
        >
          <span className="text-[10px] text-muted-foreground">
            {msg.timestamp?.seconds
              ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Sending..."}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

export default ChatMessageItem;
