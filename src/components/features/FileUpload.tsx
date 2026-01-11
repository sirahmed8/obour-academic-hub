"use client";

import { useState, useRef } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

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
        className="p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
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
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="bg-secondary/50 rounded-lg p-3 max-w-xs">
      {attachment.type === "image" ? (
        <div className="relative w-64 h-48 rounded-lg overflow-hidden bg-background/50">
          <Image src={attachment.url} alt={attachment.name} fill className="object-cover" />
        </div>
      ) : (
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 hover:bg-secondary/80 p-2 rounded transition-colors"
        >
          <FileText className="w-8 h-8 text-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(attachment.size)}</p>
          </div>
        </a>
      )}
    </div>
  );
}
