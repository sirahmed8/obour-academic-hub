import { Skeleton, SkeletonHeaderBanner, SkeletonCardGrid } from "@/components/ui/Skeleton";

export default function MainLoading() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner Skeleton */}
      <SkeletonHeaderBanner />

      {/* Quick Stats Pills Bar Skeleton */}
      <div className="flex flex-wrap gap-3 items-center">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={36} className="w-32 rounded-full" />
        ))}
      </div>

      {/* Main Grid Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Activity & Subjects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-4">
            <Skeleton variant="text" height={24} className="w-1/3" />
            <Skeleton variant="rectangular" height={160} className="w-full rounded-2xl" />
          </div>
          <SkeletonCardGrid count={4} cols="grid-cols-1 sm:grid-cols-2" />
        </div>

        {/* Right 1 Column: Widgets */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-4">
            <Skeleton variant="circular" width={48} height={48} />
            <Skeleton variant="text" height={20} className="w-2/3" />
            <Skeleton variant="text" height={14} className="w-full" />
          </div>
          <div className="p-6 rounded-3xl bg-card border border-border shadow-md space-y-3">
            <Skeleton variant="text" height={20} className="w-1/2" />
            <Skeleton variant="rectangular" height={100} className="w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
