"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts";
import { ChatSession } from "@/types";
import { cn } from "@/lib/utils";
import { MessageSquare, Pin, Search, CheckCheck, Trash2 } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ScaleIn } from "@/components/ui/Animations";
import { LoadingTable } from "@/components/ui/Loading";

interface ChatListProps {
  sessions: ChatSession[];
  selectedSessionId: string | null;
  onSelectSession: (id: string) => void;
  isLoading: boolean;
  onTogglePin: (e: React.MouseEvent, session: ChatSession) => void;
  onToggleRead: (e: React.MouseEvent, session: ChatSession) => void;
  onDeleteSession?: (sessionId: string) => void;
}

export function ChatList({
  sessions,
  selectedSessionId,
  onSelectSession,
  isLoading,
  onTogglePin,
  onToggleRead,
  onDeleteSession,
}: ChatListProps) {
  const { language, t } = useLanguage();
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold text-primary font-harman flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <MessageSquare className="text-primary w-5 h-5" />
          </div>
          {t("admin.inbox")}
        </h1>
        <div className="mt-6 relative group">
          <div className="relative bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center transition-all focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/50">
            <Search className="w-4 h-4 text-muted-foreground ml-3 shrink-0" />
            <input
              type="text"
              placeholder={language === "ar" ? "بحث عن محادثة..." : "Search conversations..."}
              className="flex-1 bg-transparent border-none p-3 pl-2 text-sm focus:outline-none placeholder:text-muted-foreground/50 h-11"
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-hide">
        {isLoading ? (
          <div className="py-2">
            <LoadingTable rows={5} />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-10 opacity-50">
            {language === "ar" ? "لا توجد محادثات" : "No active chats"}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {sessions.map((session) => (
              <ScaleIn
                key={session.userId}
                layout
                onClick={() => onSelectSession(session.userId)}
                className={cn(
                  "group relative p-3 rounded-2xl cursor-pointer transition-all duration-300 border border-transparent",
                  selectedSessionId === session.userId
                    ? "bg-primary/10 border-primary/20 shadow-inner"
                    : "hover:bg-white/5 hover:border-white/5"
                )}
              >
                {selectedSessionId === session.userId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 32 }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-primary rounded-r-full"
                  />
                )}

                <div className="flex items-center gap-3 relative z-10 w-full">
                  <div className="relative shrink-0">
                    <Image
                      src={
                        session.userImage && !imageError[session.userId]
                          ? session.userImage
                          : `https://ui-avatars.com/api/?name=${session.userName || "User"}&background=6366f1&color=fff`
                      }
                      alt={session.userName}
                      width={48}
                      height={48}
                      quality={100}
                      onError={() => setImageError((prev) => ({ ...prev, [session.userId]: true }))}
                      className="rounded-xl shadow-sm group-hover:scale-105 transition-transform object-cover h-12 w-12 bg-muted/20"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2 w-full relative">
                      <div className="flex flex-col">
                        <h3
                          className={cn(
                            "font-bold text-sm truncate max-w-full transition-colors mt-0.5",
                            (session.adminUnreadCount || 0) > 0
                              ? "text-primary/95"
                              : "text-foreground"
                          )}
                        >
                          {session.userName}
                        </h3>
                        {session.userId.endsWith("_support") ? (
                          <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 shrink-0 w-fit mt-1">
                            🎧 Live Support
                          </span>
                        ) : (
                          <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/20 shrink-0 w-fit mt-1">
                            🧠 AI Chat
                          </span>
                        )}
                      </div>

                      {/* Info & Actions Swapper */}
                      <div className="relative h-5 flex items-center justify-end shrink-0 min-w-[60px]">
                        {/* Time - Fades out on hover */}
                        <div className="flex items-center gap-1.5 transition-opacity duration-200 group-hover:opacity-0 absolute right-0">
                          {session.isPinned && (
                            <Pin size={12} className="text-primary fill-current" />
                          )}
                          <span className="text-[10px] text-muted-foreground opacity-70 whitespace-nowrap">
                            {formatTime(session.lastMessageTime)}
                          </span>
                        </div>

                        {/* Actions - Fades in on hover & Shifted Up */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto absolute right-0 -top-1.5">
                          <button
                            onClick={(e) => onTogglePin(e, session)}
                            className={cn(
                              "p-1 rounded-md hover:bg-primary/10 transition-colors",
                              session.isPinned ? "text-primary" : "text-muted-foreground/60"
                            )}
                            title={session.isPinned ? "Unpin" : "Pin"}
                          >
                            <Pin size={14} className={cn(session.isPinned && "fill-current")} />
                          </button>
                          <button
                            onClick={(e) => onToggleRead(e, session)}
                            className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground/60 hover:text-primary transition-colors"
                            title={
                              (session.adminUnreadCount || 0) > 0 ? "Mark Read" : "Mark Unread"
                            }
                          >
                            {(session.adminUnreadCount || 0) > 0 ? (
                              <CheckCheck size={14} />
                            ) : (
                              <MessageSquare size={14} />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession?.(session.userId);
                            }}
                            className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground/60 hover:text-destructive transition-colors"
                            title="Delete Chat"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center w-full gap-3">
                      <p
                        dir="auto"
                        className={cn(
                          "text-xs line-clamp-1 leading-relaxed text-start flex-1",
                          (session.adminUnreadCount || 0) > 0
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        )}
                      >
                        {session.lastMessage || "No messages"}
                      </p>

                      {/* Unread Badge */}
                      {(session.adminUnreadCount || 0) > 0 && (
                        <div className="min-w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-md shadow-primary/20 animate-in zoom-in">
                          {session.adminUnreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ScaleIn>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
