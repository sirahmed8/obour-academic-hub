/**
 * UI Design System - Centralized styling utilities and variants
 * Prevents code duplication for common component styles
 */

import { cva, type VariantProps } from "class-variance-authority";

/**
 * Modal backdrop classes used across confirmation modal, approval modal, etc.
 */
export const MODAL_BACKDROP =
  "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200";

/**
 * Modal content classes
 */
export const MODAL_CONTENT =
  "bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl shadow-2xl";

/**
 * Card base styles used in SubjectCard, ResourceCard, etc.
 */
export const CARD_BASE = "bg-card rounded-2xl p-6 border border-border transition-all duration-300";

/**
 * Card hover states
 */
export const CARD_HOVER = "hover:shadow-lg hover:border-primary/40 cursor-pointer";

/**
 * Button variants using CVA (Class Variance Authority)
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 focus-visible:ring-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95 focus-visible:ring-secondary/50",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/50",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-8 px-2 text-xs",
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-lg",
        xl: "h-14 px-8 text-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

/**
 * Input/field variants
 */
export const inputVariants = cva(
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-base transition-colors duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input hover:border-input/80",
        error: "border-destructive focus-visible:ring-destructive/50",
        success: "border-green-500 focus-visible:ring-green-500/50",
      },
      size: {
        sm: "text-sm px-2 py-1",
        md: "text-base px-3 py-2",
        lg: "text-lg px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

/**
 * Badge variants for notifications, tags, status chips
 */
export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/20 text-primary",
        secondary: "bg-secondary/20 text-secondary-foreground",
        destructive: "bg-destructive/20 text-destructive",
        outline: "border border-input bg-transparent text-foreground",
        success: "bg-green-500/20 text-green-900 dark:text-green-200",
        warning: "bg-yellow-500/20 text-yellow-900 dark:text-yellow-200",
        info: "bg-blue-500/20 text-blue-900 dark:text-blue-200",
      },
      size: {
        xs: "px-2 py-0.5 text-xs",
        sm: "px-2.5 py-1 text-xs",
        md: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
);

/**
 * Glassmorphic backdrop classes (for live blur effect)
 */
export const GLASSMORPHIC =
  "bg-white/10 dark:bg-black/20 backdrop-blur-xl backdrop-saturate-150 border border-white/20 dark:border-white/10";

/**
 * Smooth transition classes
 */
export const TRANSITION_SMOOTH = "transition-all duration-300 ease-out";

/**
 * Shadow utilities
 */
export const SHADOW_ELEVATED = "shadow-lg dark:shadow-2xl";
export const SHADOW_CARD = "shadow-sm dark:shadow-lg";
export const SHADOW_HOVER = "hover:shadow-xl hover:shadow-primary/10";

/**
 * Typography variants
 */
export const typographyVariants = {
  h1: "text-4xl font-bold tracking-tight",
  h2: "text-3xl font-bold tracking-tight",
  h3: "text-2xl font-bold tracking-tight",
  h4: "text-xl font-semibold",
  h5: "text-lg font-semibold",
  h6: "text-base font-semibold",
  body: "text-base leading-relaxed",
  bodySmall: "text-sm leading-relaxed text-muted-foreground",
  caption: "text-xs text-muted-foreground uppercase tracking-wider",
};

/**
 * Animation timing utilities
 */
export const ANIMATION_TIMING = {
  fast: "duration-150",
  normal: "duration-300",
  slow: "duration-500",
};

/**
 * Z-index scale (ensure consistency)
 */
export const Z_INDEX = {
  dropdown: 40,
  sticky: 30,
  fixed: 20,
  modal: 50,
  toast: 100,
  tooltip: 110,
  popover: 45,
} as const;

/**
 * Responsive breakpoints (for reference)
 */
export const BREAKPOINTS = {
  xs: "0px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

/**
 * Common spacing scale
 */
export const SPACING = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px
} as const;

export type ButtonVariants = VariantProps<typeof buttonVariants>;
export type InputVariants = VariantProps<typeof inputVariants>;
export type BadgeVariants = VariantProps<typeof badgeVariants>;
