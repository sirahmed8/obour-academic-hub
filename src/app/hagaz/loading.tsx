import { Skeleton, SkeletonHeaderBanner, SkeletonCardGrid } from "@/components/ui/Skeleton";

export default function HagazLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 w-full min-h-screen max-w-5xl mx-auto">
      <SkeletonHeaderBanner />
      <div className="flex justify-between items-center gap-3">
        <Skeleton variant="rectangular" height={40} className="w-64 rounded-full" />
        <Skeleton variant="rectangular" height={40} className="w-36 rounded-2xl" />
      </div>
      <SkeletonCardGrid count={3} cols="grid-cols-1 md:grid-cols-2" />
    </div>
  );
}
