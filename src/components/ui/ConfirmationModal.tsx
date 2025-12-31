"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}: ConfirmationModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to allow mounting before animation
      const timer = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300",
        isOpen
          ? "opacity-100 bg-black/60 backdrop-blur-sm"
          : "opacity-0 bg-transparent pointer-events-none"
      )}
    >
      <div
        className={cn(
          "bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-border transform transition-all duration-300",
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-3 rounded-2xl flex-shrink-0",
              type === "danger"
                ? "bg-red-100 text-red-600"
                : type === "warning"
                ? "bg-amber-100 text-amber-600"
                : "bg-blue-100 text-blue-600"
            )}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <p className="text-muted-foreground leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-input font-medium hover:bg-muted transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              "px-5 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all active:scale-95",
              type === "danger"
                ? "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                : type === "warning"
                ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
