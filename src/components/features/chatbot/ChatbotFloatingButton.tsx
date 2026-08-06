"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatbotFloatingButtonProps {
  isBtnHovered: boolean;
  isOpen: boolean;
  isSolid: boolean;
  language: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onToggle: () => void;
  unreadCount: number;
}

export function ChatbotFloatingButton({
  isOpen,
  isSolid,
  language,
  onMouseEnter,
  onMouseLeave,
  onToggle,
  unreadCount,
}: ChatbotFloatingButtonProps) {
  return (
    <motion.button
      onClick={onToggle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={
        isOpen
          ? language === "ar"
            ? "إغلاق المحادثة"
            : "Close chat"
          : language === "ar"
            ? "فتح المحادثة"
            : "Open chat"
      }
      className={cn(
        "fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-0 bg-primary text-primary-foreground shadow-2xl outline-none ring-0 transition-all duration-300 hover:shadow-primary/50 hover:scale-105 active:scale-95 group sm:h-14 sm:w-14 sm:bottom-6 sm:right-6 md:h-16 md:w-16"
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ opacity: 0, y: 10, filter: isSolid ? "blur(0px)" : "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: isSolid ? "blur(0px)" : "blur(4px)" }}
            transition={{ duration: isSolid ? 0 : 0.2 }}
            className="text-white dark:text-black"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10, filter: isSolid ? "blur(0px)" : "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: isSolid ? "blur(0px)" : "blur(4px)" }}
            transition={{ duration: isSolid ? 0 : 0.2 }}
            className="relative text-white dark:text-black flex items-center justify-center"
          >
            <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 animate-pulse" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
