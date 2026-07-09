"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

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
      pathname.startsWith("/main") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/subject");

    const session = typeof window !== "undefined" && document.cookie.includes("__session");

    if (isProtectedPath && !user && !session) {
      router.replace("/");
    } else {
      setIsAuthorized(true);
    }
  }, [user, loading, pathname, router]);

  if (loading || !isAuthorized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-white font-medium animate-pulse">
            {pathname.includes("/admin") ? "Verifying Permissions..." : "Securing Session..."}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
