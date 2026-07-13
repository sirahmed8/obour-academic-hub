"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingPage } from "@/components/ui/Loading";

interface ClientAuthGuardProps {
  children: React.ReactNode;
}

export default function ClientAuthGuard({ children }: ClientAuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    const isProtectedPath =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/todo");

    const session = typeof window !== "undefined" && document.cookie.includes("__session");

    if (isProtectedPath && !user && !session) {
      router.replace("/");
    } else {
      setIsAuthorized(true);
    }
  }, [user, loading, pathname, router]);

  if (loading || !isAuthorized) {
    return <LoadingPage />;
  }

  return <>{children}</>;
}
