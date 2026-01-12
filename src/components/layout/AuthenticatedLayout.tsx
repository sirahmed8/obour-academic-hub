"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Routes that should NOT have the sidebar/navbar layout
  const isPublicPage = pathname === "/";

  if (isPublicPage) {
    return <>{children}</>;
  }

  // Use the existing AppShell to wrap all other pages
  // This ensures the AppShell instance persists across navigation
  return <AppShell>{children}</AppShell>;
}
