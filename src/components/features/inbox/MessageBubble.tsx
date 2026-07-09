"use client";

import { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, Reply, Smile, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FileAttachmentDisplay } from "@/components/features/FileUpload";

interface MessageBubbleProps {
  msg: ChatMessage;
  onReply: (msg: ChatMessage) => void;
  onReact: (id: string, trigger: HTMLElement) => void;
  onDelete?: (id: string) => void;
  isAdmin: boolean;
}

export function MessageBubble({ msg, onReply, onReact, onDelete }: MessageBubbleProps) {
  const isMe = msg.senderId === "admin";
  const isBot = msg.senderId === "bot";

  const formatTime = (
    timestamp: { toDate?: () => Date; seconds?: number } | Date | number | null | undefined
  ) => {
    if (!timestamp) return "";
    let date: Date;
    if (
      typeof timestamp === "object" &&
      "toDate" in timestamp &&
      typeof timestamp.toDate === "function"
    ) {
      date = timestamp.toDate();
    } else if (
      typeof timestamp === "object" &&
      "seconds" in timestamp &&
      typeof timestamp.seconds === "number"
    ) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp as number | Date | string);
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex flex-col group relative max-w-[75%] w-fit mb-6", // Added mb-6 for horizontal actions
        isMe || isBot ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      {/* Bubble */}
      <div
        className={cn(
          "px-4 py-3 shadow-sm text-sm whitespace-pre-wrap leading-relaxed relative z-10 overflow-hidden",
          // Shape styling
          isMe
            ? "bg-primary text-white rounded-2xl rounded-tr-sm"
            : isBot
              ? "bg-slate-800 border border-white/10 text-white rounded-2xl rounded-tr-sm"
              : "bg-white dark:bg-card border border-border text-foreground rounded-2xl rounded-tl-sm shadow-md"
        )}
      >
        {/* Internal Reply Preview */}
        {msg.replyTo && (
          <div
            className={cn(
              "text-[10px] px-3 py-2 rounded-lg mb-2 w-full flex items-center gap-2 border-l-2",
              isMe
                ? "bg-black/20 text-white/90 border-white/50"
                : "bg-muted/50 text-muted-foreground border-primary/50"
            )}
          >
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="font-bold shrink-0 opacity-90">{msg.replyTo.senderName}</span>

              {msg.replyTo.attachmentUrl && msg.replyTo.attachmentType === "image" && (
                <div className="relative w-4 h-4 rounded overflow-hidden shrink-0 border border-white/10">
                  <Image
                    src={msg.replyTo.attachmentUrl}
                    alt="Reply"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <span className="truncate opacity-75">
                {msg.replyTo.text ||
                  (msg.replyTo.attachmentUrl && msg.replyTo.attachmentType !== "image"
                    ? "File"
                    : "")}
              </span>
            </div>
          </div>
        )}
        {/* Attachment Display */}
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

        {msg.text}

        {/* Timestamp & Status */}
        <div
          className={cn(
            "flex items-center justify-end gap-1 mt-1 text-[10px]",
            isMe ? "text-white/70" : "text-muted-foreground/70"
          )}
        >
          <span>{formatTime(msg.timestamp)}</span>
          {isMe && (
            <span>
              {msg.status === "seen" ? (
                <CheckCheck size={12} className="text-blue-300" />
              ) : msg.status === "delivered" ? (
                <CheckCheck size={12} />
              ) : (
                <Check size={12} />
              )}
            </span>
          )}
        </div>

        {/* Reactions */}
        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
          <div className="absolute -bottom-2.5 left-2 flex gap-0.5 bg-background shadow-md border border-border rounded-full px-1.5 py-0.5 scale-90 z-20">
            {Object.entries(msg.reactions).map(([uid, emoji]) => (
              <span
                key={uid}
                className="text-xs hover:scale-125 transition-transform cursor-help"
                title={uid}
              >
                {emoji}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions (Hover) - Repositioned with fixed sleek background */}
      {!msg.isDeleted && (
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 px-2",
            isMe || isBot
              ? "right-full mr-1 translate-x-2 group-hover:translate-x-0"
              : "left-full ml-1 -translate-x-2 group-hover:translate-x-0"
          )}
        >
          <div className="flex items-center gap-1 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-full p-1 shadow-lg transform hover:scale-105 transition-transform">
            <button
              onClick={() => onReply(msg)}
              className="p-1.5 rounded-full hover:bg-white/50 dark:hover:bg-white/10 text-muted-foreground hover:text-primary transition-all active:scale-95"
              title="Reply"
            >
              <Reply size={14} />
            </button>
            <button
              onClick={(e) => onReact(msg.id, e.currentTarget)}
              className="p-1.5 rounded-full hover:bg-white/50 dark:hover:bg-white/10 text-muted-foreground hover:text-primary transition-all active:scale-95"
              title="React"
            >
              <Smile size={14} />
            </button>
            {isMe && onDelete && (
              <button
                onClick={() => onDelete(msg.id)}
                className="p-1.5 rounded-full hover:bg-white/50 dark:hover:bg-white/10 text-muted-foreground hover:text-destructive transition-all active:scale-95"
                title="Delete for everyone"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
