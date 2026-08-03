"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SeasonCeremonyPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/community");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
}
