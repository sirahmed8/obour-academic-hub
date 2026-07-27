import { SkeletonHeaderBanner, SkeletonTable } from "@/components/ui/Skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 w-full min-h-screen max-w-5xl mx-auto">
      <SkeletonHeaderBanner />
      <SkeletonTable rows={10} />
    </div>
  );
}
