// Home Page Component
"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts";
import { LoadingPage } from "@/components/ui/Loading";

const WelcomePage = dynamic(
  () => import("@/components/features/WelcomePage").then((mod) => mod.WelcomePage),
  {
    loading: () => <LoadingPage />,
  }
);

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/main");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return <LoadingPage />;
  }

  return <WelcomePage />;
}
