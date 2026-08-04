import { Skeleton, SkeletonHeaderBanner } from "@/components/ui/Skeleton";

export default function TranscribeLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 w-full max-w-5xl mx-auto animate-fadeIn">
      <SkeletonHeaderBanner />
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-md space-y-4">
        <Skeleton variant="text" height={20} className="w-1/3" />
        <Skeleton variant="rectangular" height={120} className="w-full rounded-2xl" />
        <Skeleton variant="rectangular" height={48} className="w-full rounded-2xl mt-4" />
      </div>
    </div>
  );
}
