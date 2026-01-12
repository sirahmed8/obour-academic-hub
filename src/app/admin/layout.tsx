"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts";
import { Loader2 } from "lucide-react";
import { UserPermission } from "@/types";

const PERMISSION_MAP: Record<string, UserPermission | "owner"> = {
  "/admin/team": "manage_users",
  "/admin/users": "manage_users",
  "/admin/inbox": "access_inbox",
  "/admin/notifications": "manage_announcements",
  "/admin/banners": "manage_announcements",
  "/admin/subjects": "manage_subjects",
  "/admin/resources": "manage_resources",
  "/admin/analytics": "view_analytics",
  "/admin/logs": "owner",
  "/admin/errors": "owner",
  "/admin/settings": "owner",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, isAdmin, isOwner, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthorized = useMemo(() => {
    if (loading) return true;
    if (!isAdmin) return false;
    if (isOwner) return true;

    // Check exact matches or prefixes
    const required = Object.entries(PERMISSION_MAP).find(([path]) => pathname.startsWith(path));

    if (!required) return true; // Default to allow if not in map (like /admin dashboard)

    const permission = required[1];
    if (permission === "owner") return isOwner;
    return hasPermission(permission);
  }, [loading, isAdmin, isOwner, hasPermission, pathname]);

  useEffect(() => {
    if (!loading && !isAuthorized) {
      if (!isAdmin) {
        router.push("/dashboard");
      } else {
        router.push("/admin"); // Redirect to admin home if lacks specific permission
      }
    }
  }, [loading, isAdmin, isAuthorized, router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
