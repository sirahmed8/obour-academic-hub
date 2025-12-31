"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Bell,
  Users,
  BarChart3,
  MessageSquare,
  FileText,
  AlertTriangle,
  Megaphone,
  LucideIcon,
} from "lucide-react";
import { useAuth, useLanguage } from "@/contexts";
import { Notification as AppNotification } from "@/types";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, isOwner } = useAuth();
  const { t, language } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);

  // Listen for unread chats (Admin only) and Notifications
  useEffect(() => {
    if (!user) return;

    // 1. Notifications Listener
    const notifQuery = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc")
    );

    const unsubNotif = onSnapshot(notifQuery, (snapshot) => {
      const all = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as AppNotification)
      );
      const relevant = all.filter((n) => {
        if (n.target === "all" || !n.target) return true;
        if (n.target === "admins" && isAdmin) return true;
        if (n.target === user.uid) return true;
        return false;
      });

      const unread = relevant.filter(
        (n) => !n.readBy?.includes(user.uid)
      ).length;
      setUnreadCount(unread);
    });

    // 2. Chat Listener (For Admin Inbox Badge)
    let unsubChats = () => {};
    if (isAdmin) {
      // In a real scenario, we might want a compound query or just filter client side for 'unread' chats.
      // Assuming 'chats' collection documents have a field 'unreadCount' or similar.
      // If not, we iterate.
      const chatQuery = query(collection(db, "chats"));
      unsubChats = onSnapshot(chatQuery, (snapshot) => {
        // Count chats that have unread messages for admin.
        // We look for a field like 'hasUnreadMessages' or 'adminUnread'
        let count = 0;
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          // Assuming 'hasUnreadMessages' is the field set by backend or sender
          if (data.hasUnreadMessages) count++;
        });
        setInboxUnreadCount(count);
      });
    }

    return () => {
      unsubNotif();
      unsubChats();
    };
  }, [user, isAdmin]);

  const navItems = [
    { name: t("nav.home"), path: "/main", icon: LayoutDashboard },
    {
      name: t("nav.notifications"),
      path: "/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  // Helper function to check if path is active (handles both / and /main for home)
  const isActivePath = (itemPath: string) => {
    if (itemPath === "/main") {
      return pathname === "/main" || pathname === "/";
    }
    return pathname === itemPath;
  };

  interface NavItem {
    name: string;
    path: string;
    icon: LucideIcon;
    badge?: number;
  }

  const adminItems: NavItem[] = [
    { name: t("admin.subjects"), path: "/admin/subjects", icon: FileText },
    { name: t("admin.resources"), path: "/admin/resources", icon: FileText },
    {
      name: language === "ar" ? "الإعلانات" : "Banners",
      path: "/admin/banners",
      icon: Megaphone,
    },
    { name: t("nav.team"), path: "/team", icon: Users },
    { name: t("admin.users"), path: "/admin/users", icon: Users },
    {
      name: t("admin.inbox"),
      path: "/admin/inbox",
      icon: MessageSquare,
      badge: inboxUnreadCount > 0 ? inboxUnreadCount : undefined,
    },
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
          <div className="p-4 flex items-center gap-3 border-b border-border/50">
            <div className="relative w-10 h-10 flex-shrink-0 bg-white rounded-full p-1 overflow-hidden">
              <Image
                src="/obour-logo.png"
                alt="Obour Logo"
                width={40}
                height={40}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg leading-tight truncate">
                {language === "ar" ? "معاهد العبور" : "Obour Hub"}
              </h1>
              <p className="text-[10px] text-muted-foreground truncate opacity-80">
                {language === "ar"
                  ? "نظام إدارة التعلم الذكي"
                  : "Smart Learning System"}
              </p>
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
                    <div className="relative">
                      <Icon size={20} />
                      {item.badge && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                          {item.badge > 9 ? "9+" : item.badge}
                        </span>
                      )}
                    </div>
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
                      <div className="relative">
                        <Icon size={20} />
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                            {item.badge > 9 ? "9+" : item.badge}
                          </span>
                        )}
                      </div>
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
