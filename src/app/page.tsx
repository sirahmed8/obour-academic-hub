"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts";
import { Loader2 } from "lucide-react";
const LoginScreen = dynamic(
  () => import("@/components/features/LoginScreen").then((mod) => mod.LoginScreen),
  {
    loading: () => (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
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
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // If we are here, we are not loading and have no user
  // Render LoginScreen directly (no AppShell to prevent loops)
  return <LoginScreen />;
}
