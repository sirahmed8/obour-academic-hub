"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
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
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stagedAttachment, setStagedAttachment] = useState<{
    url: string;
    name: string;
    size: number;
    type: "image" | "document";
  } | null>(null);

  // Auto-focus when replyTo changes
  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus();
    }
  }, [replyTo]);

  const onUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        language === "ar" ? "الملف كبير جداً (حد أقصى 10 ميجا)" : "File too large (max 10MB)"
      );
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadFileToFirebase(file);
      setStagedAttachment({
        url: result.url,
        name: result.name,
        size: result.size,
        type: result.type as "image" | "document",
      });
      // Don't send immediately, allow user to add text
      inputRef.current?.focus();
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
    if ((!input.trim() && !stagedAttachment) || isUploading) return;
    handleSend(input, stagedAttachment || undefined);
    setInput("");
    setStagedAttachment(null);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          onUpload(file);
          e.preventDefault();
        }
      }
    }
  };

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
      {children}

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
            className="absolute bottom-full left-0 right-0 mb-2 mx-3 flex items-center justify-between text-xs bg-secondary text-secondary-foreground px-3 py-2 rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl z-40"
          >
            <div className="flex items-center gap-2 truncate flex-1">
              <span className="font-bold text-primary shrink-0 opacity-80">
                {language === "ar" ? "الرد على:" : "Replying to:"}
              </span>

              {replyTo.attachmentUrl && replyTo.attachmentType === "image" && (
                <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10">
                  <Image
                    src={replyTo.attachmentUrl}
                    alt="Reply Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <span className="truncate opacity-80">
                {/* Only show text if it exists. If it's just an image, show nothing here (thumbnail handles it) */}
                {replyTo.text ||
                  (replyTo.attachmentUrl && replyTo.attachmentType !== "image"
                    ? language === "ar"
                      ? "ملف"
                      : "File"
                    : "")}
              </span>
            </div>

            <button
              onClick={() => setReplyTo(null)}
              className="p-1.5 hover:bg-destructive hover:text-white rounded-full transition-all duration-200"
              aria-label={language === "ar" ? "إلغاء الرد" : "Cancel reply"}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staged Attachment Preview */}
      <AnimatePresence>
        {stagedAttachment && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-full left-0 mb-2 ml-3 p-2 bg-background/80 backdrop-blur-md rounded-xl border border-white/10 shadow-lg z-40 group"
          >
            <div className="relative w-24 h-24 rounded-lg overflow-hidden">
              {stagedAttachment.type === "image" ? (
                <Image src={stagedAttachment.url} alt="Staged" fill className="object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full bg-secondary/50">
                  <Upload className="w-8 h-8 text-primary opacity-50" />
                  <span className="text-[8px] truncate mt-1 px-1 w-full text-center">
                    {stagedAttachment.name}
                  </span>
                </div>
              )}
              <button
                onClick={() => setStagedAttachment(null)}
                className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-destructive text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 items-end">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 border border-transparent focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 rounded-xl px-2 py-1 transition-all h-full min-h-[44px]">
          <FileUpload
            onFileUploaded={(attachment) => {
              setStagedAttachment(attachment);
              inputRef.current?.focus();
            }}
            language={language as "en" | "ar"}
          />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={language === "ar" ? "اكتب رسالتك..." : "Type a message..."}
            className="flex-1 bg-transparent border-none text-sm placeholder:text-muted-foreground/50 max-h-24 py-2 outline-none focus:ring-0 shadow-none ring-0"
          />
        </div>

        <button
          onClick={triggerSend}
          disabled={(!input.trim() && !stagedAttachment) || isUploading}
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
