import { SkeletonHeaderBanner, SkeletonCardGrid } from "@/components/ui/Skeleton";

export default function MarketLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 w-full min-h-screen max-w-5xl mx-auto">
      <SkeletonHeaderBanner />
      <SkeletonCardGrid count={4} cols="grid-cols-1 md:grid-cols-2" />
    </div>
  );
}
