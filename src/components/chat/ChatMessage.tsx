"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Headphones } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { ChatMessage, User } from "@/types";
import { FileAttachmentDisplay } from "@/components/features/FileUpload";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface ChatMessageProps {
  message: ChatMessage;
  user: User; // Current logged-in user
  isUser: boolean;
  onReply?: (msg: ChatMessage) => void;
  onReact?: (msg: ChatMessage, emoji: string) => void;
  isAdminView?: boolean;
}

export function ChatMessageItem({
  message: msg,
  user,
  isUser,
  onReply,
  onReact,
}: ChatMessageProps) {
  const isBot = msg.senderId === "bot";
  const [showPicker, setShowPicker] = useState(false);

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
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center shadow-md ring-2 ring-background">
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
          <div
            className={cn(
              "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative z-10 prose prose-sm max-w-none break-words",
              // Markdown styling overrides
              "prose-p:my-0 prose-ul:my-1 prose-li:my-0 prose-pre:my-1 prose-code:bg-black/10 prose-code:rounded prose-code:px-1 prose-code:py-0.5",
              isUser
                ? "bg-primary text-primary-foreground prose-invert rounded-tr-none"
                : "bg-background border border-border rounded-tl-none dark:prose-invert",
              msg.replyTo && isUser && "rounded-tr-none rounded-br-none",
              msg.replyTo && !isUser && "rounded-tl-none rounded-bl-none"
            )}
          >
            {/* MARKDOWN RENDERING */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
          </div>

          {/* Attachments */}
          {msg.attachmentUrl && (
            <div className={cn("mt-2", isUser ? "flex justify-end" : "flex justify-start")}>
              <FileAttachmentDisplay
                attachment={{
                  url: msg.attachmentUrl,
                  type: msg.type === "image" ? "image" : "document",
                  name: msg.attachmentName || "Attachment",
                  size: msg.attachmentSize || 0,
                }}
              />
            </div>
          )}

          {/* Reactions Display - Show with user's own reaction highlighted */}
          {msg.reactions && Object.keys(msg.reactions).length > 0 && (
            <div
              className={cn(
                "absolute -bottom-3 z-20 flex gap-0.5 bg-background shadow-md border border-border rounded-full px-2 py-1",
                isUser ? "left-2" : "right-2"
              )}
            >
              {Object.entries(msg.reactions).map(([reactorId, emoji]) => (
                <span
                  key={reactorId}
                  className={cn(
                    "text-sm leading-none",
                    reactorId === user.uid && "ring-2 ring-primary ring-offset-1 rounded-full"
                  )}
                >
                  {emoji}
                </span>
              ))}
            </div>
          )}

          {/* Hover Actions (Reply, React) - Positioned below bubble */}
          <div
            className={cn(
              "absolute -bottom-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex gap-1 bg-card/80 backdrop-blur-sm rounded-full px-1 py-0.5 shadow-sm border border-border/50",
              isUser ? "right-0" : "left-0"
            )}
          >
            {onReply && (
              <button
                onClick={() => onReply(msg)}
                className="p-1.5 bg-background shadow-sm border border-border rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                title="Reply"
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
                onClick={() => setShowPicker(!showPicker)}
                className="p-1.5 bg-background shadow-sm border border-border rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                title="React"
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

          {/* Emoji Picker Popup */}
          <AnimatePresence>
            {showPicker && onReact && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "absolute z-30 flex gap-1 bg-background p-1.5 rounded-full shadow-xl border border-border",
                  isUser ? "right-0 top-full mt-2" : "left-0 top-full mt-2"
                )}
              >
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(msg, emoji);
                      setShowPicker(false);
                    }}
                    className="hover:scale-125 transition-transform text-lg leading-none p-1"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

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
        </div>
      </div>
    </motion.div>
  );
}
