"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { auth } from "@/lib/firebase";

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

export function FileUpload({ onFileUploaded, language }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToVercelBlob = async (file: File): Promise<string> => {
    // Get auth token
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error("Not authenticated");
    }

    // Upload to our local API route (which uses Vercel Blob SDK)
    const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const blob = await response.json();
    return blob.url;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 4.5MB for Vercel Blob Server Uploads)
    if (file.size > 4.5 * 1024 * 1024) {
      alert(
        language === "ar" ? "الملف كبير جداً (حد أقصى 4.5 ميجا)" : "File too large (max 4.5MB)"
      );
      return;
    }

    const fileType = file.type.startsWith("image/") ? "image" : "document";

    // Show preview for images
    if (fileType === "image") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    setUploading(true);

    try {
      const url = await uploadToVercelBlob(file);

      onFileUploaded({
        url,
        type: fileType,
        name: file.name,
        size: file.size,
      });

      setPreview(null);
    } catch (error) {
      console.error("Upload error:", error);
      alert(language === "ar" ? "فشل رفع الملف" : "Upload failed");
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
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
        aria-label={language === "ar" ? "إرفاق ملف" : "Attach file"}
      >
        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
      </button>

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-background rounded-lg p-4 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{language === "ar" ? "معاينة" : "Preview"}</h3>
                <button
                  onClick={() => setPreview(null)}
                  className="p-2 hover:bg-secondary rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative w-full h-64">
                <Image src={preview} alt="Preview" fill className="object-contain" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
        <div className="relative w-full h-48 rounded-lg overflow-hidden">
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
