// Home Page Component
"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts";
import { Loader2 } from "lucide-react";
// Force fresh deployment hash: 2
import { FadeIn } from "@/components/ui/Animations";

const WelcomePage = dynamic(
  () => import("@/components/features/WelcomePage").then((mod) => mod.WelcomePage),
  {
    loading: () => (
      <FadeIn className="h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-primary" size={40} />
      </FadeIn>
    ),
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
    return (
      <FadeIn className="h-screen w-full flex items-center justify-center bg-black">
        <Loader2 className="animate-spin text-primary" size={40} />
      </FadeIn>
    );
  }

  return <WelcomePage />;
}
