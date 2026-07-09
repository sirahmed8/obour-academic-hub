"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, MessageCircle } from "lucide-react";
import infoAnim from "react-useanimations/lib/info/info.json";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
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
  isBtnHovered,
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
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-0 bg-primary text-primary-foreground shadow-2xl outline-none ring-0 transition-all duration-300 hover:shadow-primary/50 group md:h-16 md:w-16"
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
            className="dark:text-black"
          >
            <X className="h-6 w-6 sm:h-7 sm:w-7" />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 10, filter: isSolid ? "blur(0px)" : "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: isSolid ? "blur(0px)" : "blur(4px)" }}
            transition={{ duration: isSolid ? 0 : 0.2 }}
            className="relative dark:text-zinc-950"
          >
            <div className="flex items-center justify-center">
              <AnimatedIcon
                icon={infoAnim}
                fallback={MessageCircle}
                size={32}
                useAnimation
                active={isBtnHovered}
                className="brightness-0 invert dark:invert-0"
              />
            </div>
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
