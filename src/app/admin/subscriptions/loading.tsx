import { ShimmerBox } from "@/components/ui/Loading";

export default function AdminSubscriptionsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border">
        <div className="space-y-2.5">
          <ShimmerBox className="h-8 w-64" />
          <ShimmerBox className="h-4 w-96 max-w-full" />
        </div>
        <ShimmerBox className="h-10 w-28 rounded-xl" />
      </div>

      {/* 4 Financial Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-card border border-border space-y-3">
            <div className="flex items-center justify-between">
              <ShimmerBox className="h-4 w-24" />
              <ShimmerBox className="h-8 w-8 rounded-xl" />
            </div>
            <ShimmerBox className="h-8 w-32" />
            <ShimmerBox className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* Filter Tabs & Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-2 w-full sm:w-auto">
          {[1, 2, 3, 4].map((i) => (
            <ShimmerBox key={i} className="h-10 w-24 rounded-xl" />
          ))}
        </div>
        <ShimmerBox className="h-10 w-full sm:w-64 rounded-xl" />
      </div>

      {/* Request Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShimmerBox className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <ShimmerBox className="h-4 w-36" />
                  <ShimmerBox className="h-3 w-48" />
                </div>
              </div>
              <ShimmerBox className="h-6 w-20 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <ShimmerBox className="h-12 rounded-xl" />
              <ShimmerBox className="h-12 rounded-xl" />
              <ShimmerBox className="h-12 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
