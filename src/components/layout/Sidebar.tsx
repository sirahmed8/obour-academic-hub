"use client";

import { useEffect, useState, useRef } from "react";
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
  ListTodo,
  X,
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
    const notifQuery = query(collection(db, "notifications"), orderBy("createdAt", "desc"));

    const unsubNotif = onSnapshot(notifQuery, (snapshot) => {
      const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as AppNotification);
      const relevant = all.filter((n) => {
        if (n.target === "all" || !n.target) return true;
        if (n.target === "admins" && isAdmin) return true;
        if (n.target === user.uid) return true;
        return false;
      });

      const unread = relevant.filter((n) => !n.readBy?.includes(user.uid)).length;
      setUnreadCount(unread);
    });

    // 2. Chat Listener (For Admin Inbox Badge)
    let unsubChats = () => {};
    if (isAdmin) {
      const chatQuery = query(collection(db, "chats"));
      unsubChats = onSnapshot(chatQuery, (snapshot) => {
        // Sum all adminUnreadCount from all chat sessions
        let count = 0;
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          count += data.adminUnreadCount || 0;
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
    { name: t("nav.todo"), path: "/todo", icon: ListTodo },
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

  const navRef = useRef<HTMLElement>(null);

  // Persist scroll position across navigations
  useEffect(() => {
    const savedScroll = sessionStorage.getItem("sidebarScroll");
    if (navRef.current && savedScroll) {
      navRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, []);

  const handleScroll = () => {
    if (navRef.current) {
      sessionStorage.setItem("sidebarScroll", navRef.current.scrollTop.toString());
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-[90] lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "glass-fixed fixed top-0 h-full w-[85vw] max-w-[280px] lg:max-w-none lg:w-72 bg-white/10 dark:bg-black/10 backdrop-blur-xl backdrop-saturate-150 shadow-2xl z-[100] transition-transform duration-300 ease-in-out supports-[backdrop-filter]:bg-white/5 supports-[backdrop-filter]:dark:bg-black/10 border-none border-r-0",
          "lg:z-40 lg:translate-x-0 lg:shadow-none lg:border-r lg:border-white/5", // Desktop: Fixed z-40 (Below Navbar z-50)
          language === "ar" ? "right-0 lg:right-0" : "left-0 lg:left-0",
          isOpen ? "translate-x-0" : language === "ar" ? "translate-x-full" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header - Mobile Only */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/5 dark:border-white/5 lg:hidden flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex-shrink-0 bg-transparent rounded-full p-0.5 overflow-hidden z-20">
                <Image
                  src="/obour-logo.png"
                  alt="Obour Logo"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full opacity-100"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-harman text-lg font-bold leading-tight">Obour Hub</span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  Smart Learning System
                </span>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <nav
            ref={navRef}
            onScroll={handleScroll}
            className="flex-1 px-4 space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none] pt-4 lg:pt-20" // Add top padding (16 + 4) for Desktop to clear Navbar
          >
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
                    prefetch={false}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 font-medium select-none active:scale-95",
                      isActive
                        ? "bg-primary/10 text-primary border-l-4 border-primary active-link"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80"
                    )}
                  >
                    <div className="relative">
                      <Icon size={18} className="lg:w-5 lg:h-5" />
                      {item.badge && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                          {item.badge > 9 ? "9+" : item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-sm lg:text-base">{item.name}</span>
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
                      prefetch={false}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 font-medium select-none active:scale-95",
                        isActive
                          ? "bg-primary/10 text-primary border-l-4 border-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80"
                      )}
                    >
                      <div className="relative">
                        <Icon size={18} className="lg:w-5 lg:h-5" />
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                            {item.badge > 9 ? "9+" : item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-sm lg:text-base">{item.name}</span>
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
                      prefetch={false}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 font-medium select-none active:scale-95",
                        isActive
                          ? "bg-primary/10 text-primary border-l-4 border-primary active-link"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80"
                      )}
                    >
                      <Icon size={18} className="lg:w-5 lg:h-5" />
                      <span className="text-sm lg:text-base">{item.name}</span>
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
