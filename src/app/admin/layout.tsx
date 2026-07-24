"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts";
import { LoadingPage } from "@/components/ui/Loading";
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
  "/admin/logs": "view_audit_logs",
  "/admin/errors": "owner",
  "/admin/settings": "owner",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isOwner, loading, hasPermission } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthorized = useMemo(() => {
    if (loading) return false;
    if (!isAdmin) return false;
    if (isOwner) return true;

    const cleanPath = pathname ? pathname.replace(/\/+$/, "") || "/" : "";

    // Direct match check
    const mapped = PERMISSION_MAP[cleanPath];
    if (mapped) {
      if (mapped === "owner") return false;
      return hasPermission(mapped);
    }

    // Prefix match check for nested dynamic routes (e.g., /admin/subjects/123)
    const matchingPrefix = Object.keys(PERMISSION_MAP).find((route) => cleanPath.startsWith(route));
    if (!matchingPrefix) return true; // Default admin access if no specific permission required

    const permission = PERMISSION_MAP[matchingPrefix];
    if (permission === "owner") return false;
    return hasPermission(permission);
  }, [loading, isAdmin, isOwner, hasPermission, pathname]);

  useEffect(() => {
    if (!loading && !isAuthorized) {
      if (!isAdmin) {
        router.push("/main");
      } else {
        router.push("/admin"); // Redirect to admin home if lacks specific permission
      }
    }
  }, [loading, isAdmin, isAuthorized, router]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
