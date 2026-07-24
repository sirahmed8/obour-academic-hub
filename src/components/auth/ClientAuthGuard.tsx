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

    const cleanPath = pathname ? pathname.replace(/\/+$/, "") || "/" : "";

    const isProtectedPath =
      cleanPath.startsWith("/admin") ||
      cleanPath.startsWith("/profile") ||
      cleanPath.startsWith("/todo");

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
