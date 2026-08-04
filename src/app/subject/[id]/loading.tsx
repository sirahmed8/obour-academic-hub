import { SkeletonHeaderBanner, SkeletonCardGrid } from "@/components/ui/Skeleton";

export default function SubjectDetailLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 w-full max-w-7xl mx-auto animate-fadeIn">
      <SkeletonHeaderBanner />
      <SkeletonCardGrid count={4} cols="grid-cols-1 md:grid-cols-2" />
    </div>
  );
}
