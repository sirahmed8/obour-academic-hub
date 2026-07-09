"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Loader2, X } from "lucide-react";
import Image from "next/image";

import { motion, AnimatePresence } from "framer-motion";
import { buttonVariants } from "@/lib/ui-variants";

interface FileAttachment {
  url: string;
  type: "image" | "document";
  name: string;
  size: number;
}

interface FileUploadProps {
  onFileUploaded: (attachment: FileAttachment) => void;
  language: "en" | "ar";
}

import { uploadFileToFirebase } from "@/lib/storage";
import { toast } from "sonner";

export function FileUpload({ onFileUploaded, language }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Removed internal uploadToCloudinary in favor of shared utility

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        language === "ar" ? "الملف كبير جداً (حد أقصى 10 ميجا)" : "File too large (max 10MB)"
      );
      return;
    }

    setUploading(true);

    try {
      const result = await uploadFileToFirebase(file);

      onFileUploaded({
        url: result.url,
        type: result.type as "image" | "document",
        name: result.name,
        size: result.size,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(language === "ar" ? "فشل رفع الملف" : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          fileInputRef.current?.click();
        }}
        disabled={uploading}
        className={buttonVariants({ variant: "ghost", size: "sm" })}
        aria-label={language === "ar" ? "إرفاق ملف" : "Attach file"}
      >
        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
      </button>
    </>
  );
}

interface FileAttachmentDisplayProps {
  attachment: FileAttachment;
}

export function FileAttachmentDisplay({ attachment }: FileAttachmentDisplayProps) {
  const [showLightbox, setShowLightbox] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <>
      <div className="bg-secondary/50 rounded-lg p-3 max-w-xs">
        {attachment.type === "image" ? (
          <div
            className="relative w-52 h-40 rounded-lg overflow-hidden bg-background/50 cursor-zoom-in hover:opacity-90 transition-opacity"
            onClick={() => setShowLightbox(true)}
          >
            <Image src={attachment.url} alt={attachment.name} fill className="object-cover" />
          </div>
        ) : (
          <a
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:bg-secondary/80 p-2 rounded transition-colors"
          >
            <div className="bg-background/50 p-2 rounded">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{attachment.name}</p>
              <p className="text-[10px] text-muted-foreground">{formatSize(attachment.size)}</p>
            </div>
          </a>
        )}
      </div>

      <AnimatePresence>
        {showLightbox && (
          <ImageLightbox
            src={attachment.url}
            alt={attachment.name}
            onClose={() => setShowLightbox(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

import { createPortal } from "react-dom";

// ... inside ImageLightbox ...

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-500 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-black/50 hover:bg-white/20 rounded-full text-white transition-all hover:scale-110 z-510 border border-white/10"
      >
        <X className="w-6 h-6" />
      </button>

      <motion.img
        src={src}
        alt={alt}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain rounded-2xl shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      />
    </motion.div>,
    document.body
  );
}
