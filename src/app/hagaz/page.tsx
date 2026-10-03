"use client";

import { Suspense } from "react";
import { HagazView } from "@/components/features/HagazView";
import { SkeletonHagazView } from "@/components/ui/Skeleton";

export default function HagazPage() {
  return (
    <Suspense fallback={<SkeletonHagazView />}>
      <HagazView />
    </Suspense>
  );
}
