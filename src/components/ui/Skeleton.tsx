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
 * Upgraded to look incredibly premium with glowing shimmer.
 */
export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  animation = "shimmer",
}: SkeletonProps) {
  const baseClasses =
    "bg-muted/80 dark:bg-muted/30 backdrop-blur-sm border border-white/5 dark:border-white/5";

  const variantClasses = {
    text: "rounded-md",
    circular: "rounded-full",
    rectangular: "rounded-2xl", // softer corners for rectangular
  };

  const animationClasses = {
    pulse: "animate-pulse",
    shimmer: "animate-shimmer shadow-inner",
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

export function SkeletonHagazView() {
  return (
    <div className="space-y-6 w-full animate-fade-in">
      <SkeletonHeaderBanner />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Skeleton variant="rectangular" height={48} className="w-full rounded-2xl" />
          <SkeletonCardGrid count={3} cols="grid-cols-1" />
        </div>
        <div className="space-y-4">
          <SkeletonCard className="h-64" />
          <SkeletonCard className="h-40" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonMindmapCanvas() {
  return (
    <div className="p-6 rounded-3xl bg-card border border-border shadow-lg space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Skeleton variant="rectangular" height={32} className="w-48 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton variant="rectangular" height={36} className="w-24 rounded-xl" />
          <Skeleton variant="rectangular" height={36} className="w-24 rounded-xl" />
        </div>
      </div>
      <div className="h-96 w-full rounded-2xl bg-muted/40 flex items-center justify-center p-8">
        <div className="grid grid-cols-3 gap-8 w-full max-w-2xl items-center justify-items-center">
          <Skeleton variant="rectangular" height={60} className="w-36 rounded-2xl" />
          <Skeleton variant="circular" width={80} height={80} />
          <Skeleton variant="rectangular" height={60} className="w-36 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonTranscribeView() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 animate-fade-in">
      <SkeletonHeaderBanner />
      <div className="p-8 rounded-3xl border border-border bg-card space-y-6">
        <Skeleton variant="rectangular" height={160} className="w-full rounded-2xl" />
        <div className="flex justify-end gap-3">
          <Skeleton variant="rectangular" height={40} className="w-32 rounded-xl" />
          <Skeleton variant="rectangular" height={40} className="w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonSubjectView() {
  return (
    <div className="space-y-8 w-full animate-fade-in">
      <SkeletonHeaderBanner />
      <div className="flex gap-3 overflow-x-auto pb-2">
        <Skeleton variant="rectangular" height={38} className="w-28 rounded-xl shrink-0" />
        <Skeleton variant="rectangular" height={38} className="w-28 rounded-xl shrink-0" />
        <Skeleton variant="rectangular" height={38} className="w-28 rounded-xl shrink-0" />
      </div>
      <SkeletonCardGrid count={6} cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
    </div>
  );
}

export function SkeletonCommunityFeed() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 animate-fade-in">
      <SkeletonHeaderBanner />
      <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={44} height={44} />
          <div className="space-y-1.5 flex-1">
            <Skeleton variant="rectangular" height={16} className="w-36 rounded-md" />
            <Skeleton variant="rectangular" height={12} className="w-24 rounded-md" />
          </div>
        </div>
        <Skeleton variant="rectangular" height={80} className="w-full rounded-2xl" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="p-6 rounded-3xl bg-card border border-border space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="space-y-1">
              <Skeleton variant="rectangular" height={16} className="w-32 rounded-md" />
              <Skeleton variant="rectangular" height={12} className="w-20 rounded-md" />
            </div>
          </div>
          <SkeletonText lines={2} />
          <Skeleton variant="rectangular" height={160} className="w-full rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonScheduleTimetable() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 animate-fade-in">
      <SkeletonHeaderBanner />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <Skeleton variant="rectangular" height={24} className="w-32 rounded-xl" />
            <Skeleton variant="rectangular" height={70} className="w-full rounded-2xl" />
            <Skeleton variant="rectangular" height={70} className="w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonExamCards() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 animate-fade-in">
      <SkeletonHeaderBanner />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 rounded-3xl bg-card border border-border space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton variant="rectangular" height={24} className="w-28 rounded-full" />
              <Skeleton variant="rectangular" height={24} className="w-16 rounded-full" />
            </div>
            <Skeleton variant="rectangular" height={28} className="w-3/4 rounded-xl" />
            <Skeleton variant="rectangular" height={16} className="w-1/2 rounded-lg" />
            <Skeleton variant="rectangular" height={12} className="w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonTodoView() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 animate-fade-in">
      <SkeletonHeaderBanner />
      <div className="p-6 rounded-3xl bg-card border border-border space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="rectangular" height={18} className="w-48 rounded-md" />
            </div>
            <Skeleton variant="rectangular" height={20} className="w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonAdminOverview() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 animate-fade-in">
      <SkeletonHeaderBanner />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 rounded-3xl bg-card border border-border space-y-3">
            <Skeleton variant="rectangular" height={16} className="w-24 rounded-md" />
            <Skeleton variant="rectangular" height={36} className="w-20 rounded-xl" />
          </div>
        ))}
      </div>
      <SkeletonTable rows={6} />
    </div>
  );
}
