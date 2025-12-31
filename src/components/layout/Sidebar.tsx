"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Bell,
  Shield,
  Wand2,
  Users,
  LogOut,
  Menu,
  X,
  BarChart3,
  MessageSquare,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useAuth, useLanguage } from "@/contexts";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, isOwner, logout } = useAuth();
  const { t, language } = useLanguage();

  const navItems = [
    { name: t("nav.home"), path: "/main", icon: LayoutDashboard },
    { name: t("nav.notifications"), path: "/notifications", icon: Bell },
    { name: t("nav.team"), path: "/team", icon: Users },
  ];

  // Helper function to check if path is active (handles both / and /main for home)
  const isActivePath = (itemPath: string) => {
    if (itemPath === "/main") {
      return pathname === "/main" || pathname === "/";
    }
    return pathname === itemPath;
  };

  const adminItems = [
    { name: t("admin.subjects"), path: "/admin/subjects", icon: FileText },
    { name: t("admin.resources"), path: "/admin/resources", icon: FileText },
    { name: t("admin.users"), path: "/admin/users", icon: Users },
    { name: t("admin.inbox"), path: "/admin/inbox", icon: MessageSquare },
    { name: t("admin.analytics"), path: "/admin/analytics", icon: BarChart3 },
  ];

  const ownerItems = [
    { name: t("admin.logs"), path: "/admin/logs", icon: FileText },
    { name: t("admin.errors"), path: "/admin/errors", icon: AlertTriangle },
  ];

  // Auto-scroll to active link
  useEffect(() => {
    const activeLink = document.querySelector(".active-link");
    if (activeLink) {
      activeLink.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [pathname]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 h-full w-72 bg-card shadow-2xl z-50 transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:shadow-none border-r border-border",
          language === "ar" ? "right-0" : "left-0",
          isOpen
            ? "translate-x-0"
            : language === "ar"
            ? "translate-x-full"
            : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-20 flex items-center justify-center border-b border-border px-4">
            <div className="flex items-center gap-3">
              <Image
                src="/obour-logo.png"
                alt="Obour Logo"
                width={40}
                height={40}
                className="rounded-xl shadow-lg"
              />
              <div>
                <h1 className="font-bold text-foreground text-lg leading-tight">
                  {language === "ar" ? "معاهد العبور" : "Obour Hub"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {language === "ar"
                    ? "نظام إدارة التعلم الذكي"
                    : "Smart Learning System"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
            {/* Main Nav */}
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                      isActive
                        ? "bg-primary/10 text-primary border-l-4 border-primary active-link"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Admin Section */}
            {isAdmin && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4">
                  {t("nav.admin")}
                </p>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                        isActive
                          ? "bg-primary/10 text-primary border-l-4 border-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Owner Section */}
            {isOwner && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4">
                  Owner
                </p>
                {ownerItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                        isActive
                          ? "bg-primary/10 text-primary border-l-4 border-primary active-link"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
