import { SkeletonHeaderBanner, SkeletonCardGrid } from "@/components/ui/Skeleton";

export default function PlusLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 w-full max-w-5xl mx-auto animate-fadeIn">
      <SkeletonHeaderBanner />
      <SkeletonCardGrid count={3} cols="grid-cols-1 md:grid-cols-3" />
    </div>
  );
}
