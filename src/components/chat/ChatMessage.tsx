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
  isAdminView?: boolean;
  onTaskAction?: (action: "confirm" | "edit", taskData: Partial<TodoTask>) => void;
}

export const ChatMessageItem = memo(function ChatMessageItem({
  message: msg,
  user,
  isUser,
  onReply,
  onReact,
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
        "flex gap-3 max-w-[85%] group relative",
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

      {/* Message Content */}
      <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
        {/* Reply Context */}
        {msg.replyTo && (
          <div
            className={cn(
              "text-[10px] bg-muted/50 px-3 py-1.5 rounded-t-xl mb-[-5px] border-b border-background/50 opacity-80 max-w-full truncate backdrop-blur-sm",
              isUser ? "rounded-bl-xl origin-bottom-right" : "rounded-br-xl origin-bottom-left"
            )}
          >
            <span className="font-bold">{msg.replyTo.senderName}</span>:{" "}
            {msg.replyTo.text.substring(0, 25)}...
          </div>
        )}

        <div className="relative group/bubble">
          {/* MARKDOWN RENDERING (Only if text exists) */}
          {msg.text.trim() && (
            <div
              className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative z-10 prose prose-sm max-w-none wrap-break-word",
                // Markdown styling overrides
                "prose-p:my-0 prose-ul:my-1 prose-li:my-0 prose-pre:my-1 prose-code:bg-black/10 prose-code:rounded prose-code:px-1 prose-code:py-0.5",
                isUser
                  ? "bg-primary text-primary-foreground prose-invert rounded-tr-none"
                  : "bg-background border border-border rounded-tl-none dark:prose-invert",
                msg.replyTo && isUser && "rounded-tr-none rounded-br-none",
                msg.replyTo && !isUser && "rounded-tl-none rounded-bl-none"
              )}
            >
              <MarkdownContent content={msg.text} />
            </div>
          )}

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
        </div>

        {/* Attachments */}
        {msg.attachmentUrl && (
          <div className={cn("mt-2", isUser ? "flex justify-end" : "flex justify-start")}>
            <FileAttachmentDisplay
              attachment={{
                url: msg.attachmentUrl,
                type: msg.attachmentType === "image" ? "image" : "document",
                name: msg.attachmentName || "Attachment",
                size: msg.attachmentSize || 0,
              }}
            />
          </div>
        )}

        {/* Reactions Display - Show below timestamp to avoid overlapping */}
        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
          <div
            className={cn(
              "flex gap-1 mt-1 bg-background/80 backdrop-blur-sm shadow-sm border border-border rounded-full px-2 py-1 w-fit",
              isUser ? "ml-auto" : "mr-auto"
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

        {/* Hover Actions (Reply, React) - Always visible for better UX */}
        <div
          className={cn(
            "absolute top-2 opacity-100 flex gap-1 z-50 transition-opacity duration-200",
            // Mobile: Always visible. Desktop: Can be hover if preferred, but user asked for "show up"
            "lg:opacity-0 lg:group-hover:opacity-100",
            "before:absolute before:top-0 before:bottom-0 before:w-6 before:z-[-1]",
            isUser
              ? "right-full mr-2 flex-row-reverse before:-right-4"
              : "left-full ml-2 before:-left-4"
          )}
        >
          {onReply && (
            <button
              onClick={() => onReply(msg)}
              className="p-1.5 bg-background shadow-sm border border-border rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
              title="Reply"
              aria-label="Reply to message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
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
              className="p-1.5 bg-background shadow-sm border border-border rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
              title="React"
              aria-label="React to message"
              aria-expanded={showPicker}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>
          )}
        </div>

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
      </div>

      {/* Mobile Timestamp & State */}
      <div
        className={cn(
          "flex items-center gap-1 mt-1 px-1 opacity-70",
          isUser ? "justify-end" : "justify-start"
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
    </motion.div>
  );
});

export default ChatMessageItem;
