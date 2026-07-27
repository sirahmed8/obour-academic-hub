import { Skeleton, SkeletonHeaderBanner, SkeletonCardGrid } from "@/components/ui/Skeleton";

export default function MainDashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 w-full min-h-screen max-w-7xl mx-auto">
      {/* Feature Tips Placeholder */}
      <Skeleton variant="rectangular" height={44} className="w-full rounded-2xl" />

      {/* Hero Banner Placeholder */}
      <SkeletonHeaderBanner />

      {/* Shortcuts Bar Placeholder */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={90} className="w-full rounded-3xl" />
        ))}
      </div>

      {/* Grid Content Placeholder */}
      <SkeletonCardGrid count={2} />
    </div>
  );
}
