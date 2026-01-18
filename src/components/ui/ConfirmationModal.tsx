"use client";

import { useEffect, useState, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setVisible(false), 300); // Wait for transition
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && visible && modalRef.current) {
      const modal = modalRef.current;
      const focusableElements = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const previousActiveElement = document.activeElement as HTMLElement;

      if (!modal.contains(document.activeElement)) {
        firstElement.focus();
      }

      const handleTab = (e: KeyboardEvent) => {
        if (e.key === "Tab") {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
        if (e.key === "Escape") {
          onClose();
        }
      };

      modal.addEventListener("keydown", handleTab);

      return () => {
        modal.removeEventListener("keydown", handleTab);
        previousActiveElement?.focus();
      };
    }
  }, [isOpen, visible, onClose]);

  return (
    <AnimatePresence>
      {(isOpen || visible) && (
        <div className="fixed inset-0 z-1200 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmation-modal-title"
            aria-describedby="confirmation-modal-message"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-border relative z-10"
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "p-3 rounded-2xl shrink-0",
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
                <h3 id="confirmation-modal-title" className="text-xl font-bold text-foreground">
                  {title}
                </h3>
                <p
                  id="confirmation-modal-message"
                  className="text-muted-foreground leading-relaxed"
                >
                  {message}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-input font-medium hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-medium text-white shadow-lg transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
