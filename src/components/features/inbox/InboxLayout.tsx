"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface InboxLayoutProps {
  sidebar: ReactNode;
  chat: ReactNode;
  isChatSelected: boolean;
}

export function InboxLayout({ sidebar, chat, isChatSelected }: InboxLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.20))] w-full overflow-hidden bg-background relative p-4 gap-4">
      {/* Sidebar Area (Chat List) */}
      <div
        className={cn(
          "w-full lg:w-96 flex flex-col h-full transition-all duration-300 relative z-10",
          "bg-card/30 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden", // Card Styling
          isChatSelected ? "hidden lg:flex" : "flex"
        )}
      >
        {sidebar}
      </div>

      {/* Main Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col h-full relative z-10 overflow-hidden",
          "bg-card/30 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl", // Card Styling
          !isChatSelected ? "hidden lg:flex" : "flex"
        )}
      >
        {chat}
      </div>
    </div>
  );
}
