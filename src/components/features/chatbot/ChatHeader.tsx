"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Headphones, Trash2, Bot } from "lucide-react";
import { useLanguage } from "@/contexts";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  mode: "bot" | "live";
  setMode: (mode: "bot" | "live") => void;
  setIsOpen: (isOpen: boolean) => void;
  onClearHistory: () => void;
}

export function ChatHeader({ mode, setMode, setIsOpen, onClearHistory }: ChatHeaderProps) {
  const { language } = useLanguage();

  return (
    <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-inner",
            mode === "bot" ? "bg-primary/10" : "bg-green-500/10"
          )}
        >
          <AnimatePresence mode="wait">
            {mode === "bot" ? (
              <motion.div
                key="bot-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Bot className="w-6 h-6 text-primary" />
              </motion.div>
            ) : (
              <motion.div
                key="live-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Headphones className="w-6 h-6 text-green-600" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <h3 className="font-bold text-sm">
            {mode === "bot"
              ? language === "ar"
                ? "مساعد العبور"
                : "Obour Bot"
              : language === "ar"
                ? "الدعم المباشر"
                : "Live Support"}
          </h3>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                mode === "bot" ? "bg-primary" : "bg-green-500 animate-pulse"
              )}
            />
            {mode === "bot"
              ? language === "ar"
                ? "مساعدك الذكي"
                : "Your smart assistant"
              : language === "ar"
                ? "متصل الآن"
                : "Online"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onClearHistory}
          className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-full transition-colors"
          title={language === "ar" ? "مسح السجل" : "Clear History"}
          aria-label={language === "ar" ? "مسح السجل" : "Clear history"}
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-border mx-1" />

        <button
          onClick={() => setMode(mode === "bot" ? "live" : "bot")}
          className={cn(
            "px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border transition-all",
            mode === "bot"
              ? "bg-background border-border hover:bg-muted"
              : "bg-green-50 border-green-200 text-green-700 font-bold"
          )}
        >
          {mode === "bot"
            ? language === "ar"
              ? "تحدث لبشري"
              : "LIVE CHAT"
            : language === "ar"
              ? "البوت"
              : "BOT"}
        </button>

        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-muted rounded-full"
          aria-label={language === "ar" ? "إغلاق" : "Close"}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
