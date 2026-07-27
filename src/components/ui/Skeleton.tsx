"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "shimmer" | "none";
}

/**
 * Skeleton loading placeholder component.
 */
export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  animation = "shimmer",
}: SkeletonProps) {
  const baseClasses = "bg-muted";

  const variantClasses = {
    text: "rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    shimmer: "animate-shimmer",
    none: "",
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], animationClasses[animation], className)}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    />
  );
}

// Preset skeletons for common patterns
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={16}
          className={i === lines - 1 ? "w-3/4" : "w-full"}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 rounded-xl border bg-card space-y-3", className)}>
      <Skeleton variant="rectangular" height={120} className="w-full" />
      <Skeleton variant="text" height={20} className="w-3/4" />
      <Skeleton variant="text" height={14} className="w-1/2" />
    </div>
  );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton variant="circular" width={size} height={size} />;
}

export function SkeletonHeaderBanner() {
  return (
    <div className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-md space-y-4">
      <Skeleton variant="rectangular" height={24} className="w-44 rounded-full" />
      <Skeleton variant="rectangular" height={40} className="w-3/4 max-w-xl rounded-2xl" />
      <Skeleton variant="rectangular" height={16} className="w-1/2 max-w-md rounded-lg" />
    </div>
  );
}

export function SkeletonCardGrid({
  count = 4,
  cols = "grid-cols-1 md:grid-cols-2",
}: {
  count?: number;
  cols?: string;
}) {
  return (
    <div className={cn("grid gap-6", cols)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton variant="rectangular" height={20} className="w-24 rounded-full" />
              <Skeleton variant="rectangular" height={20} className="w-16 rounded-full" />
            </div>
            <Skeleton variant="rectangular" height={24} className="w-4/5 rounded-xl" />
            <Skeleton variant="rectangular" height={16} className="w-full rounded-lg" />
            <Skeleton variant="rectangular" height={16} className="w-2/3 rounded-lg" />
          </div>
          <Skeleton variant="rectangular" height={40} className="w-full rounded-2xl mt-4" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-md space-y-2 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <Skeleton variant="rectangular" height={20} className="w-32 rounded-lg" />
        <Skeleton variant="rectangular" height={20} className="w-24 rounded-lg" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
        >
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={36} height={36} />
            <div className="space-y-1">
              <Skeleton variant="rectangular" height={16} className="w-36 rounded-md" />
              <Skeleton variant="rectangular" height={12} className="w-24 rounded-md" />
            </div>
          </div>
          <Skeleton variant="rectangular" height={24} className="w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
