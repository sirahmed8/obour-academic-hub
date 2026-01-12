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
    <div className="flex h-[calc(100vh-5rem)] w-full overflow-hidden bg-background relative p-4 gap-4">
      {/* Sidebar Area (Chat List) */}
      <div
        className={cn(
          "w-full lg:w-96 flex flex-col h-full transition-all duration-300 relative z-10",
          "bg-card/40 backdrop-blur-xl border border-black/3 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl overflow-hidden", // Card Styling
          isChatSelected ? "hidden lg:flex" : "flex"
        )}
      >
        {sidebar}
      </div>

      {/* Main Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col h-full relative z-10 overflow-hidden",
          "bg-card/40 backdrop-blur-xl border border-black/3 dark:border-white/10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl", // Card Styling
          !isChatSelected ? "hidden lg:flex" : "flex"
        )}
      >
        {chat}
      </div>
    </div>
  );
}
