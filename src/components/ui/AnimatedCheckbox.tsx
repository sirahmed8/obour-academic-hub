"use client";

import { motion } from "framer-motion";
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
        "relative w-5 h-5 rounded-md border-2 transition-colors duration-200 flex items-center justify-center shrink-0 active:scale-90",
        checked
          ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/30"
          : "bg-transparent border-muted-foreground/40 hover:border-primary/60 text-transparent",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none">
        <motion.path
          d="M2.5 7.5L5.5 10.5L11.5 3.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{
            pathLength: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
        />
      </svg>
    </button>
  );
}
