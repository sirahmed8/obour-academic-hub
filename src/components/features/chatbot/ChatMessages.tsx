"use client";

import { useEffect, useRef } from "react";
import { Headphones } from "lucide-react";
import { useLanguage } from "@/contexts";
import { cn } from "@/lib/utils";
import { ChatMessageItem } from "@/components/chat/ChatMessage";
import { QuickReplies } from "@/components/ui/QuickReplies";
import { QUICK_REPLIES } from "@/lib/quickReplies";
import { AI_MODEL_INFO, AIModel } from "./constants";
import { ChatMessage } from "@/types";
import { User } from "@/types";

interface ChatMessagesProps {
  messages: ChatMessage[];
  streamingText: string;
  isTyping: boolean;
  aiModel: AIModel;
  mode: "bot" | "live";
  user: User;
  onReply: (msg: ChatMessage) => void;
  onReact: (msg: ChatMessage, emoji: string) => void;
  onSend: (text: string) => void;
}

export function ChatMessages({
  messages,
  streamingText,
  isTyping,
  aiModel,
  mode,
  user,
  onReply,
  onReact,
  onSend,
}: ChatMessagesProps) {
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const CurrentModelIcon = AI_MODEL_INFO[aiModel].icon;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5 scrollbar-thin scrollbar-thumb-border">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-6 opacity-60">
          {mode === "bot" ? (
            <CurrentModelIcon className="w-12 h-12 mb-3" />
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
        />
      ))}

      {/* Streaming Text Display */}
      {streamingText && (
        <div className="flex gap-3 max-w-[85%] mr-auto">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 self-end mb-1">
            <CurrentModelIcon className={cn("w-3 h-3", AI_MODEL_INFO[aiModel].color)} />
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
            <CurrentModelIcon className={cn("w-3 h-3", AI_MODEL_INFO[aiModel].color)} />
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
