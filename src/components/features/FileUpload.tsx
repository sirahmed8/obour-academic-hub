"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, Loader2, X } from "lucide-react";
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

      {showLightbox && (
        <ImageLightbox
          src={attachment.url}
          alt={attachment.name}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  );
}

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  // Prevent scrolling when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>
      <div
        className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={src} alt={alt} fill className="object-contain" quality={100} />
      </div>
    </div>
  );
}
