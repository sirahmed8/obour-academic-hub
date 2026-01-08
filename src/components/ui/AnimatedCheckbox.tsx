"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  className?: string;
}

export function AnimatedCheckbox({
  checked,
  onChange,
  disabled,
  className,
}: AnimatedCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center shrink-0",
        checked
          ? "bg-primary border-primary"
          : "bg-transparent border-muted-foreground/40 hover:border-primary/60",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <motion.div
        initial={false}
        animate={{
          scale: checked ? 1 : 0,
          opacity: checked ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <Check className="w-3.5 h-3.5 text-primary-foreground stroke-[3]" />
      </motion.div>

      {/* Ripple effect on click */}
      {checked && (
        <motion.div
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 bg-primary rounded-md"
        />
      )}
    </button>
  );
}
