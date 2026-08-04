import { SkeletonHeaderBanner, SkeletonTable } from "@/components/ui/Skeleton";

export default function NotificationsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-8 w-full max-w-5xl mx-auto animate-fadeIn">
      <SkeletonHeaderBanner />
      <SkeletonTable rows={6} />
    </div>
  );
}
