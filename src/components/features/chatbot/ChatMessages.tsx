"use client";

import { useEffect, useRef } from "react";
import { Headphones, Bot } from "lucide-react";
import { useLanguage } from "@/contexts";
import { ChatMessageItem } from "@/components/chat/ChatMessage";
import { QuickReplies } from "@/components/ui/QuickReplies";
import { QUICK_REPLIES } from "@/lib/quickReplies";
import { ChatMessage } from "@/types";
import { User } from "@/types";

interface ChatMessagesProps {
  messages: ChatMessage[];
  streamingText: string;
  isTyping: boolean;
  mode: "bot" | "live";
  user: User;
  onReply: (msg: ChatMessage) => void;
  onReact: (msg: ChatMessage, emoji: string) => void;
  onSend: (text: string) => void;
  onTaskAction: (action: "confirm" | "edit", taskData: any) => void;
}

export function ChatMessages({
  messages,
  streamingText,
  isTyping,
  mode,
  user,
  onReply,
  onReact,
  onSend,
  onTaskAction,
}: ChatMessagesProps) {
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5 scrollbar-thin scrollbar-thumb-border">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-6 opacity-60">
          {mode === "bot" ? (
            <Bot className="w-12 h-12 mb-3" />
          ) : (
            <Headphones className="w-12 h-12 mb-3" />
          )}
          <p className="text-sm">
            {language === "ar"
              ? "لا توجد رسائل بعد. ابدأ المحادثة!"
              : "No messages yet. Start chatting!"}
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <ChatMessageItem
          key={msg.id}
          message={msg}
          user={user}
          isUser={msg.senderId === user.uid}
          onReply={onReply}
          onReact={onReact}
          onTaskAction={onTaskAction}
        />
      ))}

      {/* Streaming Text Display */}
      {streamingText && (
        <div className="flex gap-3 max-w-[85%] mr-auto">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 self-end mb-1">
            <Bot className="w-3 h-3 text-primary" />
          </div>
          <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none shadow-sm text-sm">
            {streamingText}
            <span className="inline-block w-1.5 h-4 bg-primary/50 ml-1 animate-pulse" />
          </div>
        </div>
      )}

      {/* Typing Indicator */}
      {isTyping && !streamingText && (
        <div className="flex gap-3 max-w-[85%] mr-auto">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 self-end mb-1">
            <Bot className="w-3 h-3 text-primary" />
          </div>
          <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-sm">
            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      {/* Quick Replies */}
      {mode === "bot" && messages.length === 0 && (
        <QuickReplies
          replies={QUICK_REPLIES}
          onSelect={onSend}
          language={language as "en" | "ar"}
        />
      )}
    </div>
  );
}
