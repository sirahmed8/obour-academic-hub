"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Small inline spinner for buttons or small actions.
 */
export function LoadingSpinner({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className="animate-spin text-primary" size={size} />
    </div>
  );
}

/**
 * Rich Shimmer Base Box
 */
export function ShimmerBox({ className }: { className?: string }) {
  return <div className={cn("bg-muted/60 dark:bg-muted/40 animate-pulse rounded-xl", className)} />;
}

/**
 * Full Page Academic Dashboard Shimmer Skeleton
 * Replaces the basic circular spinner across all pages with a state-of-the-art layout skeleton.
 */
export function LoadingPage() {
  return (
    <div className="w-full min-h-[70vh] p-4 sm:p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div className="space-y-2.5 w-full sm:w-auto">
          <ShimmerBox className="h-8 w-48 sm:w-64" />
          <ShimmerBox className="h-4 w-72 sm:w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <ShimmerBox className="h-10 w-24 rounded-xl" />
          <ShimmerBox className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Summary Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <ShimmerBox className="h-4 w-24" />
              <ShimmerBox className="h-8 w-8 rounded-xl" />
            </div>
            <ShimmerBox className="h-7 w-20" />
            <ShimmerBox className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Main Content Area Shimmer */}
      <div className="rounded-2xl border border-border/50 bg-card/60 p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-border/40">
          <ShimmerBox className="h-6 w-40" />
          <ShimmerBox className="h-9 w-64 rounded-xl" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30 gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <ShimmerBox className="h-11 w-11 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <ShimmerBox className="h-4 w-1/3" />
                  <ShimmerBox className="h-3 w-2/3" />
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <ShimmerBox className="h-8 w-20 rounded-lg hidden sm:block" />
                <ShimmerBox className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Grid Card Shimmer Skeleton (For Subjects, Resources, Hubs)
 */
export function LoadingCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShimmerBox className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <ShimmerBox className="h-4 w-28" />
                <ShimmerBox className="h-3 w-16" />
              </div>
            </div>
            <ShimmerBox className="h-6 w-14 rounded-full" />
          </div>
          <ShimmerBox className="h-20 w-full rounded-xl" />
          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <ShimmerBox className="h-4 w-20" />
            <ShimmerBox className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Table Shimmer Skeleton (For Users, Logs, Leaderboard)
 */
export function LoadingTable({ rows = 6 }: { rows?: number }) {
  return (
    <div className="w-full rounded-2xl border border-border/50 bg-card/60 overflow-hidden shadow-sm animate-in fade-in duration-300">
      <div className="p-4 border-b border-border/40 bg-muted/20 flex items-center justify-between">
        <ShimmerBox className="h-5 w-36" />
        <ShimmerBox className="h-9 w-48 rounded-xl" />
      </div>
      <div className="divide-y divide-border/30">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <ShimmerBox className="h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <ShimmerBox className="h-4 w-44" />
                <ShimmerBox className="h-3 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShimmerBox className="h-6 w-16 rounded-full" />
              <ShimmerBox className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Chat Messaging Shimmer Skeleton (For Global Chat & Support Inbox)
 */
export function LoadingChat() {
  return (
    <div className="w-full flex flex-col h-[500px] rounded-2xl border border-border/50 bg-card/60 overflow-hidden animate-in fade-in duration-300">
      <div className="p-4 border-b border-border/40 flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-3">
          <ShimmerBox className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5">
            <ShimmerBox className="h-4 w-32" />
            <ShimmerBox className="h-3 w-20" />
          </div>
        </div>
        <ShimmerBox className="h-8 w-24 rounded-lg" />
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex items-start gap-3">
          <ShimmerBox className="h-8 w-8 rounded-full shrink-0" />
          <ShimmerBox className="h-16 w-64 rounded-2xl" />
        </div>
        <div className="flex items-start gap-3 justify-end">
          <ShimmerBox className="h-12 w-56 rounded-2xl" />
          <ShimmerBox className="h-8 w-8 rounded-full shrink-0" />
        </div>
        <div className="flex items-start gap-3">
          <ShimmerBox className="h-8 w-8 rounded-full shrink-0" />
          <ShimmerBox className="h-20 w-72 rounded-2xl" />
        </div>
      </div>
      <div className="p-4 border-t border-border/40 flex items-center gap-3 bg-muted/10">
        <ShimmerBox className="h-11 flex-1 rounded-xl" />
        <ShimmerBox className="h-11 w-24 rounded-xl shrink-0" />
      </div>
    </div>
  );
}

/**
 * Users Admin Page Shimmer Skeleton
 * Matches /admin/users header + search + filters + user rows
 */
export function LoadingUsersPage() {
  return (
    <div className="w-full p-4 lg:p-10 space-y-6 animate-in fade-in duration-300">
      {/* Users Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="space-y-2">
          <ShimmerBox className="h-8 w-48" />
          <ShimmerBox className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <ShimmerBox className="h-10 flex-1 sm:w-64 rounded-xl" />
          <ShimmerBox className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      {/* Summary Stats Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border/40 bg-card/50 space-y-2">
            <ShimmerBox className="h-3 w-20" />
            <ShimmerBox className="h-6 w-14" />
          </div>
        ))}
      </div>

      {/* Users Table */}
      <LoadingTable rows={8} />
    </div>
  );
}

/**
 * Announcements & Notifications Admin Page Shimmer Skeleton
 * Matches /admin/notifications layout
 */
export function LoadingNotificationsPage() {
  return (
    <div className="w-full p-6 space-y-8 animate-in fade-in duration-300">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <ShimmerBox className="h-12 w-12 rounded-2xl" />
          <div className="space-y-2">
            <ShimmerBox className="h-7 w-52" />
            <ShimmerBox className="h-4 w-72" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShimmerBox className="h-10 w-24 rounded-xl" />
          <ShimmerBox className="h-10 w-24 rounded-xl" />
          <ShimmerBox className="h-10 w-24 rounded-xl" />
        </div>
      </div>

      {/* Composer Card Skeleton */}
      <div className="rounded-2xl border border-border/50 bg-card/60 p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-border/40">
          <ShimmerBox className="h-6 w-44" />
          <ShimmerBox className="h-6 w-24 rounded-full" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <ShimmerBox className="h-4 w-28" />
            <ShimmerBox className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <ShimmerBox className="h-4 w-32" />
            <ShimmerBox className="h-28 w-full rounded-xl" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <ShimmerBox className="h-10 w-48 rounded-xl" />
            <ShimmerBox className="h-11 w-36 rounded-xl" />
          </div>
        </div>
      </div>

      {/* History / Banners List Skeleton */}
      <div className="space-y-4">
        <ShimmerBox className="h-6 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border/40 bg-card/50 space-y-3">
              <div className="flex items-center justify-between">
                <ShimmerBox className="h-5 w-36" />
                <ShimmerBox className="h-6 w-16 rounded-full" />
              </div>
              <ShimmerBox className="h-4 w-full" />
              <ShimmerBox className="h-4 w-3/4" />
              <div className="flex items-center justify-between pt-2">
                <ShimmerBox className="h-3 w-24" />
                <ShimmerBox className="h-8 w-20 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Analytics Admin Page Shimmer Skeleton
 * Matches /admin/analytics visual dashboard layout
 */
export function LoadingAnalyticsPage() {
  return (
    <div className="w-full p-4 sm:p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
        <div className="space-y-2">
          <ShimmerBox className="h-8 w-56" />
          <ShimmerBox className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-3">
          <ShimmerBox className="h-10 w-32 rounded-xl" />
          <ShimmerBox className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border/50 bg-card/60 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <ShimmerBox className="h-4 w-28" />
              <ShimmerBox className="h-9 w-9 rounded-xl" />
            </div>
            <ShimmerBox className="h-8 w-24" />
            <ShimmerBox className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border/50 bg-card/60 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <ShimmerBox className="h-6 w-44" />
            <ShimmerBox className="h-8 w-28 rounded-xl" />
          </div>
          <ShimmerBox className="h-[280px] w-full rounded-2xl" />
        </div>
        <div className="p-6 rounded-2xl border border-border/50 bg-card/60 space-y-6 shadow-sm">
          <ShimmerBox className="h-6 w-36" />
          <ShimmerBox className="h-[280px] w-full rounded-2xl" />
        </div>
      </div>

      {/* Secondary Chart / Tables */}
      <div className="p-6 rounded-2xl border border-border/50 bg-card/60 space-y-6 shadow-sm">
        <ShimmerBox className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl bg-muted/20 border border-border/30 space-y-3">
              <ShimmerBox className="h-5 w-32" />
              <ShimmerBox className="h-24 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * User Profile Page Shimmer Skeleton
 * Matches /profile hero card & details layout
 */
export function LoadingProfilePage() {
  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row items-center gap-6 bg-card/50 backdrop-blur-xl p-8 rounded-4xl border border-border shadow-xl">
        <ShimmerBox className="w-32 h-32 rounded-full shrink-0" />
        <div className="space-y-3 flex-1 w-full text-center md:text-left">
          <ShimmerBox className="h-8 w-48 mx-auto md:mx-0" />
          <ShimmerBox className="h-4 w-64 mx-auto md:mx-0" />
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
            <ShimmerBox className="h-7 w-24 rounded-full" />
            <ShimmerBox className="h-7 w-28 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl border border-border/50 bg-card/60 space-y-4">
          <ShimmerBox className="h-6 w-36" />
          <div className="space-y-3">
            <ShimmerBox className="h-12 w-full rounded-xl" />
            <ShimmerBox className="h-12 w-full rounded-xl" />
            <ShimmerBox className="h-12 w-full rounded-xl" />
          </div>
        </div>
        <div className="p-6 rounded-3xl border border-border/50 bg-card/60 space-y-4">
          <ShimmerBox className="h-6 w-36" />
          <div className="space-y-3">
            <ShimmerBox className="h-12 w-full rounded-xl" />
            <ShimmerBox className="h-12 w-full rounded-xl" />
            <ShimmerBox className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Subjects Page Shimmer Skeleton
 */
export function LoadingSubjectsPage() {
  return (
    <div className="w-full p-6 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="space-y-2">
          <ShimmerBox className="h-8 w-48" />
          <ShimmerBox className="h-4 w-72" />
        </div>
        <ShimmerBox className="h-10 w-full sm:w-64 rounded-xl" />
      </div>
      <LoadingCardGrid count={6} />
    </div>
  );
}

/**
 * Resources Page Shimmer Skeleton
 */
export function LoadingResourcesPage() {
  return (
    <div className="w-full p-6 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="space-y-2">
          <ShimmerBox className="h-8 w-52" />
          <ShimmerBox className="h-4 w-72" />
        </div>
        <ShimmerBox className="h-10 w-full sm:w-72 rounded-xl" />
      </div>
      <LoadingTable rows={6} />
    </div>
  );
}
