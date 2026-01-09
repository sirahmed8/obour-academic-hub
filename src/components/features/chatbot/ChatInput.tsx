"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Send, X } from "lucide-react";
import { useLanguage } from "@/contexts";
import { FileUpload } from "@/components/features/FileUpload";
import { ChatMessage } from "@/types";

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: (
    text?: string,
    attachment?: { url: string; name: string; size: number; type: "image" | "document" }
  ) => void;
  replyTo: ChatMessage | null;
  setReplyTo: (msg: ChatMessage | null) => void;
  children?: React.ReactNode;
}

export function ChatInput({
  input,
  setInput,
  handleSend,
  replyTo,
  setReplyTo,
  children,
}: ChatInputProps) {
  const { language } = useLanguage();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 bg-transparent border-t border-white/10">
      {/* Optional children (like model selector - no longer used) */}
      {children}

      {/* Reply Preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded-lg mb-2 border-l-2 border-primary"
          >
            <div className="truncate">
              <span className="font-bold mr-1">
                {language === "ar" ? "الرد على" : "Replying to"}:
              </span>
              {replyTo.text}
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="p-1 hover:bg-background rounded-full"
              aria-label={language === "ar" ? "إلغاء الرد" : "Cancel reply"}
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 items-end">
        {/* Input Container - Unified Border/Ring */}
        <div className="flex-1 flex items-center gap-2 bg-muted/50 border border-transparent focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 rounded-xl px-2 py-1 transition-all h-full min-h-[44px]">
          <FileUpload
            onFileUploaded={(attachment) => handleSend(undefined, attachment)}
            language={language as "en" | "ar"}
          />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={language === "ar" ? "اكتب رسالتك لفريق الدعم..." : "Message Support..."}
            className="flex-1 bg-transparent border-none text-sm placeholder:text-muted-foreground/50 max-h-24 py-2 outline-none focus:ring-0 shadow-none ring-0"
          />
        </div>

        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md h-[44px] flex items-center justify-center shrink-0"
          aria-label={language === "ar" ? "إرسال" : "Send"}
        >
          <Send className="w-5 h-5 rtl:-scale-x-100" />
        </button>
      </div>
    </div>
  );
}
