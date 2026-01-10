"use client";

import { ChatMessage } from "@/types";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, Reply, Smile, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { FileAttachmentDisplay } from "@/components/features/FileUpload";

interface MessageBubbleProps {
  msg: ChatMessage;
  onReply: (msg: ChatMessage) => void;
  onReact: (id: string, trigger: HTMLElement) => void;
  onDelete: (id: string) => void;
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
        "flex flex-col group relative max-w-[75%] w-fit",
        isMe || isBot ? "ml-auto items-end" : "mr-auto items-start"
      )}
    >
      {/* Reply Preview */}
      {msg.replyTo && (
        <div
          className={cn(
            "text-[10px] px-3 py-1.5 rounded-t-xl mb-[-4px] border-b border-transparent w-full opacity-80 backdrop-blur-sm",
            isMe ? "bg-primary/20 text-foreground" : "bg-muted/50 text-muted-foreground"
          )}
        >
          <span className="font-bold mr-1">{msg.replyTo.senderName}:</span>
          {msg.replyTo.text.slice(0, 30)}...
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "px-4 py-3 shadow-sm text-sm whitespace-pre-wrap leading-relaxed relative z-10",
          // Shape styling
          isMe
            ? "bg-linear-to-br from-primary via-purple-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm"
            : isBot
              ? "bg-linear-to-br from-slate-800 to-slate-900 border border-white/10 text-white rounded-2xl rounded-tr-sm"
              : "bg-white dark:bg-card border border-border text-foreground rounded-2xl rounded-tl-sm shadow-md"
        )}
      >
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

      {/* Actions (Hover) */}
      <div
        className={cn(
          "absolute top-0 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 bg-background/80 backdrop-blur-md rounded-full shadow-lg border border-border p-1 z-50",
          isMe ? "-left-12" : "-right-12"
        )}
      >
        <button
          onClick={() => onReply(msg)}
          className="p-1.5 hover:bg-primary/10 rounded-full text-muted-foreground hover:text-primary transition-colors"
          title="Reply"
        >
          <Reply size={12} />
        </button>
        <button
          onClick={(e) => onReact(msg.id, e.currentTarget)}
          className="p-1.5 hover:bg-primary/10 rounded-full text-muted-foreground hover:text-primary transition-colors"
          title="React"
        >
          <Smile size={12} />
        </button>
        {isMe && !msg.isDeleted && (
          <button
            onClick={() => onDelete(msg.id)}
            className="p-1.5 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
