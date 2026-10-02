"use client";

import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  error?: string;
  label?: string;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      error,
      label,
      id,
      disabled,
      showPasswordLabel = "Show password",
      hidePasswordLabel = "Hide password",
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-muted-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            {...props}
            id={inputId}
            ref={ref}
            type={showPassword ? "text" : "password"}
            disabled={disabled}
            className={cn(
              "w-full px-4 py-2.5 pe-11 rounded-xl border border-border bg-background text-foreground font-medium text-sm transition-all outline-none",
              "focus:ring-2 focus:ring-primary/40 focus:border-primary",
              "placeholder:text-muted-foreground/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus:ring-red-500/40 focus:border-red-500",
              className
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            tabIndex={0}
            aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
            className="absolute top-1/2 -translate-y-1/2 end-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500 font-medium" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
