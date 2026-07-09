"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import ClientAuthGuard from "@/components/auth/ClientAuthGuard";
import dynamic from "next/dynamic";

const AIChatbot = dynamic(
  () => import("@/components/features/AIChatbot").then((mod) => mod.AIChatbot),
  { ssr: false }
);

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Routes that should NOT have the sidebar/navbar layout
  const isPublicPage = pathname === "/" || pathname === "/404" || pathname.startsWith("/legal");

  if (isPublicPage) {
    return (
      <>
        {children}
        <AIChatbot />
      </>
    );
  }

  return (
    <ClientAuthGuard>
      <div className="relative min-h-screen overflow-hidden bg-background font-sans selection:bg-primary/30 selection:text-primary">
        <AppShell>{children}</AppShell>
      </div>
    </ClientAuthGuard>
  );
}
