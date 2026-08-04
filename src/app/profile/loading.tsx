import { SkeletonHeaderBanner, SkeletonTable } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 animate-fade-in">
      <SkeletonHeaderBanner />
      <SkeletonTable rows={4} />
    </div>
  );
}
