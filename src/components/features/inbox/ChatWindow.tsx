"use client";

import { useLanguage } from "@/contexts";
import { ChatSession, ChatMessage } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { Trash2, ArrowLeft, Loader2, X } from "lucide-react";
import { AnimatePresence, motion, HTMLMotionProps } from "framer-motion";
import { rtdb } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { cn } from "@/lib/utils";

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
  canDelete?: boolean;
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
  canDelete = false,
}: ChatWindowProps) {
  // ... (existing code for state and effects)
  const { language } = useLanguage();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [emojiPickerState, setEmojiPickerState] = useState<{
    id: string;
    position: { top?: number; bottom?: number; left: number };
  } | null>(null);

  const [userPresence, setUserPresence] = useState<{
    status: "online" | "offline";
    lastActive?: number;
  }>({
    status: "offline",
  });

  useEffect(() => {
    if (!session?.userId || !rtdb) {
      setUserPresence({ status: "offline" });
      return;
    }
    const presenceRef = ref(rtdb, `presence/${session.userId}`);
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.status === "online") {
        setUserPresence({ status: "online", lastActive: data.lastActive });
      } else {
        setUserPresence({ status: "offline", lastActive: data?.lastActive });
      }
    });
    return () => unsubscribe();
  }, [session?.userId]);

  const isOnline = userPresence.status === "online";

  // Scroll to bottom when new messages arrive - with session guard
  const hasSession = !!session;
  useEffect(() => {
    if (session && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, hasSession, session]);

  const animProps: HTMLMotionProps<"div"> = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.3, ease: "easeOut" },
  };

  const QUICK_EMOJIS = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

  const handleReact = (messageId: string, trigger: HTMLElement) => {
    if (emojiPickerState?.id === messageId) {
      setEmojiPickerState(null);
      return;
    }

    const rect = trigger.getBoundingClientRect();
    // Default position relative to viewport
    const position = {
      top: rect.top - 60,
      left: rect.left,
    };

    setEmojiPickerState({ id: messageId, position });
  };

  return (
    <div className="h-full w-full chat-window-container relative overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        {!session ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 h-full w-full"
          >
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
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            {...animProps}
            className="flex flex-col h-full w-full bg-background/50"
          >
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
                  <div
                    className={cn(
                      "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card",
                      isOnline ? "bg-green-500" : "bg-zinc-400 dark:bg-zinc-600"
                    )}
                  />
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
                    <span
                      className={cn(
                        "font-medium",
                        isOnline ? "text-green-500" : "text-muted-foreground"
                      )}
                    >
                      {isOnline
                        ? language === "ar"
                          ? "متصل الآن"
                          : "Online"
                        : language === "ar"
                          ? "غير متصل"
                          : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Removed Call Buttons */}
                <div className="w-px h-6 bg-border/50 mx-1" />
                {canDelete && (
                  <button
                    onClick={onDeleteChat}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                    title="Delete Chat"
                  >
                    <Trash2 size={20} />
                  </button>
                )}

                {/* Close Chat Button */}
                <button
                  onClick={onBack}
                  className="p-2 text-muted-foreground hover:bg-white/10 rounded-xl transition-all"
                  title="Close Chat"
                >
                  <X size={20} />
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
                    {language === "ar"
                      ? "ابدأ المحادثة الآن"
                      : "Say hello to start the conversation!"}
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
                    onDelete={canDelete ? onDeleteMessage : undefined}
                  />
                ))
              )}

              {/* Emoji Picker - Fixed Position Portal-like */}
              {emojiPickerState && (
                <>
                  <div
                    className="fixed inset-0 z-100 bg-transparent"
                    onClick={() => setEmojiPickerState(null)}
                  />
                  <div
                    className="fixed z-101 bg-card/90 backdrop-blur-xl border border-black/5 dark:border-white/20 p-2 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-2xl flex gap-1 animate-in fade-in zoom-in-95 duration-200"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
