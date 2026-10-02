"use client";

import React, { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  successMessage?: string;
  className?: string;
  iconSize?: number;
  variant?: "ghost" | "outline" | "solid";
}

export function CopyButton({
  text,
  label,
  copiedLabel,
  successMessage = "تم النسخ بنجاح! / Copied to clipboard!",
  className,
  iconSize = 14,
  variant = "ghost",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(successMessage);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to copy text");
      }
    },
    [text, successMessage]
  );

  const baseStyles =
    "inline-flex items-center justify-center gap-1.5 rounded-xl font-bold text-xs transition-all duration-200 active:scale-95 cursor-pointer select-none";

  const variantStyles = {
    ghost: "text-muted-foreground hover:text-foreground hover:bg-muted/60 p-2",
    outline:
      "border border-border/80 bg-card hover:bg-muted/50 text-foreground px-3 py-1.5 shadow-xs",
    solid: "bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 shadow-sm",
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-emerald-500 inline-flex items-center gap-1"
          >
            <Check size={iconSize} className="shrink-0 stroke-[2.5]" />
            {copiedLabel && <span>{copiedLabel}</span>}
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1"
          >
            <Copy size={iconSize} className="shrink-0" />
            {label && <span>{label}</span>}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
