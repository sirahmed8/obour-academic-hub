import { SkeletonCardGrid, SkeletonHeaderBanner } from "@/components/ui/Skeleton";

export default function MarketLoading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 animate-fade-in">
      <SkeletonHeaderBanner />
      <SkeletonCardGrid count={6} cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
    </div>
  );
}
