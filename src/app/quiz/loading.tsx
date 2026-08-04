import { SkeletonCardGrid, SkeletonHeaderBanner } from "@/components/ui/Skeleton";

export default function QuizLoading() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 animate-fade-in">
      <SkeletonHeaderBanner />
      <SkeletonCardGrid count={3} cols="grid-cols-1" />
    </div>
  );
}
