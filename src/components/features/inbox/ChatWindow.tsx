"use client";

import { useLanguage } from "@/contexts";
import { ChatSession, ChatMessage } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";

import { ChatInput } from "@/components/features/chatbot/ChatInput";

interface ChatWindowProps {
  session: ChatSession | null;
  messages: ChatMessage[];
  loadingMessages: boolean;
  onSendMessage: (
    text?: string,
    attachment?: { url: string; name: string; size: number; type: "image" | "document" }
  ) => void;
  onBack: () => void;
  onDeleteChat: () => void;
  onDeleteMessage: (id: string) => void;
  onReaction: (msgId: string, emoji: string) => void;
  input: string;
  setInput: (val: string) => void;
  replyTo: ChatMessage | null;
  setReplyTo: (msg: ChatMessage | null) => void;
}

export function ChatWindow({
  session,
  messages,
  loadingMessages,
  onSendMessage,
  onBack,
  onDeleteChat,
  onDeleteMessage,
  onReaction,
  input,
  setInput,
  replyTo,
  setReplyTo,
}: ChatWindowProps) {
  // ... (existing code for state and effects)
  const { language } = useLanguage();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [emojiPickerState, setEmojiPickerState] = useState<{
    id: string;
    position: { top?: number; bottom?: number; left: number };
  } | null>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, session?.userId]);

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-6xl">💬</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          {language === "ar" ? "مرحباً بك في المحادثات" : "Welcome to Inbox"}
        </h2>
        <p className="text-muted-foreground max-w-md">
          {language === "ar"
            ? "قم باختيار محادثة من القائمة لبدء التواصل مع الطلاب، أو تصفح الأرشيف."
            : "Select a conversation from the list to start chatting with students, or browse the archive."}
        </p>
      </div>
    );
  }

  const QUICK_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

  const handleReact = (id: string, trigger: HTMLElement) => {
    if (emojiPickerState?.id === id) {
      setEmojiPickerState(null);
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const pickerHeight = 60; // Approximate
    // const spaceAbove = rect.top; // Unused

    // Force placement "above" by default, or clamp if needed
    // Simple logic: Place above the button (rect.top - pickerHeight)
    // If we are too close to top, place below
    const preferredTop = rect.top - pickerHeight - 8;
    const preferredLeft = rect.left;

    // Boundary checks
    const position = {
      top: preferredTop < 100 ? rect.bottom + 8 : preferredTop,
      left: preferredLeft,
    };

    if (position.left + 250 > window.innerWidth) {
      position.left = window.innerWidth - 260;
    }

    setEmojiPickerState({ id, position });
  };

  return (
    <>
      {/* Header */}
      <div className="h-20 border-b border-white/10 shrink-0 flex items-center justify-between px-6 bg-card/10 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="lg:hidden p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft />
          </button>

          <div className="relative">
            <Image
              src={
                session.userImage ||
                `https://ui-avatars.com/api/?name=${session.userName || "User"}&background=6366f1&color=fff`
              }
              alt={session.userName}
              width={48}
              height={48}
              className="rounded-xl shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card" />
          </div>

          <div>
            <h2 className="font-bold text-base flex items-center gap-2">
              {session.userName}
              <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                Student
              </span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{session.userEmail}</span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="text-green-500 font-medium">Online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Removed Call Buttons */}
          <div className="w-px h-6 bg-border/50 mx-1" />
          <button
            onClick={onDeleteChat}
            className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all"
            title="Delete Chat"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 relative scrollbar-track-transparent scrollbar-thumb-muted/10 hover:scrollbar-thumb-muted/20">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
            <Loader2 className="animate-spin" />
            <span className="text-sm">Loading history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center opacity-40">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
              <span className="text-3xl">👋</span>
            </div>
            <p>
              {language === "ar" ? "ابدأ المحادثة الآن" : "Say hello to start the conversation!"}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isAdmin={true}
              onReply={(m) => setReplyTo(m)}
              onReact={(id, trigger) => handleReact(id, trigger)}
              onDelete={onDeleteMessage}
            />
          ))
        )}

        {/* Emoji Picker - Fixed Position Portal-like */}
        {emojiPickerState && (
          <>
            <div
              className="fixed inset-0 z-[100] bg-transparent"
              onClick={() => setEmojiPickerState(null)}
            />
            <div
              className="fixed z-[101] bg-card/90 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-2xl flex gap-1 animate-in fade-in zoom-in-95 duration-200"
              style={{
                top: emojiPickerState.position.top,
                left: emojiPickerState.position.left,
              }}
            >
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  className="text-xl hover:scale-125 transition-transform p-2 hover:bg-white/10 rounded-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReaction(emojiPickerState.id, emoji);
                    setEmojiPickerState(null);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        input={input}
        setInput={setInput}
        handleSend={onSendMessage}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
      />
    </>
  );
}
