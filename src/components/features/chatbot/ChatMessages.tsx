"use client";

import * as React from "react";
import { useEffect, useRef, memo } from "react";
import { Headphones } from "lucide-react";
import { useLanguage } from "@/contexts";
import { ChatMessageItem } from "@/components/chat/ChatMessage";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types";
import { User } from "@/types";

interface ChatMessagesProps {
  messages: ChatMessage[];
  user: User;
  onReply: (msg: ChatMessage) => void;
  onReact: (msg: ChatMessage, emoji: string) => void;
  onDelete: (msgId: string) => void;
  isGeneratingWelcome?: boolean;
}

const ChatMessagesMemo = memo(ChatMessages, (prevProps, nextProps) => {
  if (prevProps.isGeneratingWelcome !== nextProps.isGeneratingWelcome) return false;
  // Re-render if messages length changed or user changed
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (prevProps.user.uid !== nextProps.user.uid) return false;

  // Re-render if any message content actually changed
  for (let i = 0; i < prevProps.messages.length; i++) {
    const prevMsg = prevProps.messages[i];
    const nextMsg = nextProps.messages[i];

    // Check if message data changed (id, text, reactions, etc.)
    if (
      prevMsg.id !== nextMsg.id ||
      prevMsg.text !== nextMsg.text ||
      prevMsg.senderId !== nextMsg.senderId ||
      JSON.stringify(prevMsg.reactions) !== JSON.stringify(nextMsg.reactions) ||
      prevMsg.isDeleted !== nextMsg.isDeleted
    ) {
      return false;
    }
  }

  // Props are equivalent, don't re-render
  return true;
});
export { ChatMessagesMemo as ChatMessages };

function ChatMessages({
  messages,
  user,
  onReply,
  onReact,
  onDelete,
  isGeneratingWelcome,
}: ChatMessagesProps) {
  const { language } = useLanguage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (messages.length === 0) return;
    if (!messagesEndRef.current) return;
    const container = messagesEndRef.current.parentElement;
    if (!container) return;

    if (isInitialMount.current) {
      // On first render with messages, scroll instantly to bottom
      container.scrollTo({ top: container.scrollHeight, behavior: "instant" as ScrollBehavior });
      isInitialMount.current = false;
      return;
    }

    // For new messages, use smooth scroll with a small delay for animations
    const timer = setTimeout(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }, 150);
    return () => clearTimeout(timer);
  }, [messages.length, isGeneratingWelcome]);

  return (
    <div
      className={cn(
        "relative flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5 scrollbar-hide scroll-smooth overscroll-y-contain [WebkitOverflowScrolling:touch]",
        messages.length === 0 && !isGeneratingWelcome && "overflow-hidden"
      )}
    >
      {isGeneratingWelcome && (
        <div className="flex gap-3 items-start my-2">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs shrink-0 animate-pulse">
            🤖
          </div>
          <div className="bg-card border border-white/10 p-4 rounded-2xl rounded-tl-sm space-y-2 max-w-[80%] shadow-sm animate-pulse">
            <div className="h-3.5 bg-primary/20 rounded-full w-48" />
            <div className="h-3 bg-muted/30 rounded-full w-36" />
            <div className="h-3 bg-muted/20 rounded-full w-24" />
          </div>
        </div>
      )}

      {messages.length === 0 && !isGeneratingWelcome && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-muted-foreground p-6 pointer-events-none select-none">
          <Headphones className="w-12 h-12 mb-3 text-emerald-500/80" />
          <p className="text-sm font-medium opacity-80">
            {language === "ar"
              ? "لا توجد رسائل بعد. ابدأ المحادثة مع فريق الدعم!"
              : "No messages yet. Start chatting with support!"}
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
          onDelete={onDelete}
        />
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
}
