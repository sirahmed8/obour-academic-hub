"use client";

import { motion } from "framer-motion";
import { QuickReply } from "@/lib/quickReplies";

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (query: string) => void;
  language: "en" | "ar";
}

export function QuickReplies({ replies, onSelect, language }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4 border-t border-border bg-secondary/50">
      {replies.map((reply, index) => (
        <motion.button
          key={reply.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(language === "ar" ? reply.query_ar : reply.query_en)}
          className="px-3 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-sm transition-colors border border-primary/20"
        >
          {language === "ar" ? reply.text_ar : reply.text_en}
        </motion.button>
      ))}
    </div>
  );
}
