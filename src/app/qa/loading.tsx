import { Skeleton, SkeletonHeaderBanner, SkeletonCardGrid } from "@/components/ui/Skeleton";

export default function QaLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 w-full min-h-screen max-w-5xl mx-auto">
      <SkeletonHeaderBanner />
      <div className="flex items-center gap-3">
        <Skeleton variant="rectangular" height={44} className="flex-1 rounded-2xl" />
        <Skeleton variant="rectangular" height={44} className="w-32 rounded-2xl" />
      </div>
      <SkeletonCardGrid count={4} cols="grid-cols-1" />
    </div>
  );
}
