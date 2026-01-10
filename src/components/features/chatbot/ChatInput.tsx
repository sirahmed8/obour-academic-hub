"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Upload, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts";
import { FileUpload } from "@/components/features/FileUpload";
import { ChatMessage } from "@/types";
import { uploadFileToFirebase } from "@/lib/storage";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = async (file: File) => {
    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        language === "ar" ? "الملف كبير جداً (حد أقصى 10 ميجا)" : "File too large (max 10MB)"
      );
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadFileToFirebase(file);

      // Send immediately
      handleSend(undefined, {
        url: result.url,
        name: result.name,
        size: result.size,
        type: result.type as "image" | "document",
      });
    } catch (error) {
      console.error(error);
      toast.error(language === "ar" ? "فشل رفع الملف" : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      triggerSend();
    }
  };

  const triggerSend = () => {
    if (!input.trim() || isUploading) return;
    handleSend(input);
    setInput(""); // Clear input after sending
  };

  // Paste Handler
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          onUpload(file);
          e.preventDefault(); // Prevent double paste if it's text+image? acts mostly for image
        }
      }
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div
      className={cn(
        "p-3 bg-transparent border-t border-white/10 relative z-50 transition-colors",
        isDragging && "bg-primary/10"
      )}
      onPaste={handlePaste}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Optional children */}
      {children}

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-sm rounded-t-2xl pointer-events-none">
          <div className="bg-background/80 p-4 rounded-xl shadow-xl flex flex-col items-center animate-bounce">
            <Upload className="w-8 h-8 text-primary mb-2" />
            <span className="font-bold text-primary">
              {language === "ar" ? "أفلت الملف هنا" : "Drop file here"}
            </span>
          </div>
        </div>
      )}

      {/* Reply Preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full left-0 right-0 mb-2 mx-3 flex items-center justify-between text-xs bg-muted/80 backdrop-blur-md px-3 py-2 rounded-xl border border-primary/20 shadow-lg z-40"
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
        {/* Input Container */}
        <div className="flex-1 flex items-center gap-2 bg-muted/50 border border-transparent focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 rounded-xl px-2 py-1 transition-all h-full min-h-[44px]">
          <FileUpload
            onFileUploaded={(attachment) => handleSend(undefined, attachment)}
            language={language as "en" | "ar"}
          />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={language === "ar" ? "اكتب رسالتك..." : "Type a message..."}
            className="flex-1 bg-transparent border-none text-sm placeholder:text-muted-foreground/50 max-h-24 py-2 outline-none focus:ring-0 shadow-none ring-0"
          />
        </div>

        <button
          onClick={triggerSend}
          disabled={!input.trim() || isUploading}
          className="p-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md h-[44px] flex items-center justify-center shrink-0"
          aria-label={language === "ar" ? "إرسال" : "Send"}
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 rtl:-scale-x-100" />
          )}
        </button>
      </div>
    </div>
  );
}
