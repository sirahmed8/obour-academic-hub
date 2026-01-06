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
  isTyping: boolean;
  mode: "bot" | "live";
  replyTo: ChatMessage | null;
  setReplyTo: (msg: ChatMessage | null) => void;
  children?: React.ReactNode; // For ModelSelector
}

export function ChatInput({
  input,
  setInput,
  handleSend,
  isTyping,
  mode,
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
    <div className="p-3 bg-background border-t border-border">
      {/* Model Selector or other children */}
      {children}

      {/* Reply Preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
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
        <FileUpload
          onFileUploaded={(attachment) => handleSend(undefined, attachment)}
          language={language as "en" | "ar"}
        />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={
            mode === "bot"
              ? language === "ar"
                ? "اسأل المساعد الذكي..."
                : "Ask the Smart Assistant..."
              : language === "ar"
                ? "اكتب لفريق الدعم..."
                : "Message Support..."
          }
          className="flex-1 bg-muted/50 border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 max-h-24 min-h-[44px]"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md h-[44px] flex items-center justify-center"
          aria-label={language === "ar" ? "إرسال" : "Send"}
        >
          <Send className="w-5 h-5 rtl:-scale-x-100" />
        </button>
      </div>
    </div>
  );
}
