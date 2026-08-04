"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Upload, Loader2, Mic } from "lucide-react";
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
  disabled?: boolean;
}

export function ChatInput({
  input,
  setInput,
  handleSend,
  replyTo,
  setReplyTo,
  children,
  disabled,
}: ChatInputProps) {
  const { language } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localInput, setLocalInput] = useState(input);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (
        window as unknown as {
          SpeechRecognition?: new () => unknown;
          webkitSpeechRecognition?: new () => unknown;
        }
      ).SpeechRecognition ||
      (
        window as unknown as {
          SpeechRecognition?: new () => unknown;
          webkitSpeechRecognition?: new () => unknown;
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error(
        language === "ar"
          ? "متصفحك لا يدعم التعرف على الصوت"
          : "Speech recognition is not supported in your browser"
      );
      return;
    }

    try {
      const recognition = new (SpeechRecognition as new () => {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        onstart: () => void;
        onresult: (event: { results: Array<Array<{ transcript: string }>> }) => void;
        onerror: (event: { error: string }) => void;
        onend: () => void;
        start: () => void;
        stop: () => void;
      })();

      recognition.lang = language === "ar" ? "ar-SA" : "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          setLocalInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Sync local input with parent (e.g., for fill message events)
  useEffect(() => {
    setLocalInput(input);
  }, [input]);
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
    if ((!localInput.trim() && !stagedAttachment) || isUploading) return;
    handleSend(localInput, stagedAttachment || undefined);
    setLocalInput("");
    setInput("");
    setStagedAttachment(null);
    setReplyTo(null);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
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
            className="absolute bottom-full left-0 right-0 mb-2 mx-3 flex items-center justify-between text-xs bg-secondary text-secondary-foreground px-3 py-2 rounded-2xl border border-black/5 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-2xl z-40"
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
            className="absolute bottom-full left-0 mb-2 ml-3 p-2 bg-background/80 backdrop-blur-md rounded-xl border border-black/5 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-lg z-40 group"
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

      <div className="flex gap-2 items-center">
        <div className="flex-1 flex items-center gap-2 bg-muted/30 dark:bg-white/5 backdrop-blur-xl border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 rounded-full px-4 py-1.5 transition-all duration-200 min-h-[44px]">
          <FileUpload
            onFileUploaded={(attachment) => {
              setStagedAttachment(attachment);
              inputRef.current?.focus();
            }}
            language={language as "en" | "ar"}
          />
          <button
            type="button"
            onClick={toggleListening}
            className={cn(
              "p-1.5 rounded-full transition-all text-muted-foreground hover:text-foreground shrink-0",
              isListening && "bg-red-500/20 text-red-500 animate-pulse ring-2 ring-red-500/50"
            )}
            title={language === "ar" ? "إدخال صوتي 🎙️" : "Voice Input 🎙️"}
            aria-label="Voice input"
          >
            <Mic className={cn("w-4 h-4", isListening && "text-red-500")} />
          </button>
          <input
            ref={inputRef}
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={
              language === "ar" ? "اكتب رسالتك أو استخدم الصوت..." : "Type or use voice..."
            }
            disabled={disabled}
            className="flex-1 bg-transparent border-0 text-[16px] md:text-sm placeholder:text-muted-foreground/50 max-h-24 py-2 px-2.5 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          onClick={triggerSend}
          disabled={disabled || (!localInput.trim() && !stagedAttachment) || isUploading}
          className="p-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md h-[44px] flex items-center justify-center shrink-0"
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
