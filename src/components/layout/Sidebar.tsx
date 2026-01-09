"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth, useLanguage } from "@/contexts";
import { Notification as AppNotification } from "@/types";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";
import { X } from "lucide-react";

// Animation JSON data (for lottie-react)
import activityAnim from "react-useanimations/lib/activity/activity.json";
import archiveAnim from "react-useanimations/lib/archive/archive.json";
import userPlusAnim from "react-useanimations/lib/userPlus/userPlus.json";
import alertCircleAnim from "react-useanimations/lib/alertCircle/alertCircle.json";
import homeAnim from "react-useanimations/lib/home/home.json";
import checkBoxAnim from "react-useanimations/lib/checkBox/checkBox.json";
import notificationAnim from "react-useanimations/lib/notification/notification.json";
import folderAnim from "react-useanimations/lib/folder/folder.json";
import mailAnim from "react-useanimations/lib/mail/mail.json";
import editAnim from "react-useanimations/lib/edit/edit.json";
import settingsAnim from "react-useanimations/lib/settings/settings.json";

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

  // Helper function to check if path is active
  const isActivePath = (itemPath: string) => {
    if (itemPath === "/main") {
      return pathname === "/main" || pathname === "/";
    }
    return pathname === itemPath;
  };

  const navItems = [
    { name: t("nav.home"), path: "/main", icon: homeAnim, useAnimation: true },
    { name: t("nav.todo"), path: "/todo", icon: checkBoxAnim, useAnimation: true },
    {
      name: t("nav.notifications"),
      path: "/notifications",
      icon: notificationAnim,
      useAnimation: true,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  const adminItems = [
    // 1. Team Management
    {
      name: language === "ar" ? "إدارة الفريق" : "Team Management",
      path: "/admin/team",
      icon: settingsAnim,
      useAnimation: true,
    },
    // 2. Users
    { name: t("admin.users"), path: "/admin/users", icon: userPlusAnim, useAnimation: true },
    // 3. Inbox
    {
      name: t("admin.inbox"),
      path: "/admin/inbox",
      icon: mailAnim,
      useAnimation: true,
      badge: inboxUnreadCount > 0 ? inboxUnreadCount : undefined,
    },
    // 4. Announcements
    {
      name: language === "ar" ? "الإعلانات" : "Announcements",
      path: "/admin/notifications",
      icon: notificationAnim,
      useAnimation: true,
    },
    // 5. Subject Management (formerly "Subjects")
    {
      name: language === "ar" ? "إدارة المواد" : "Subject Management",
      path: "/admin/subjects",
      icon: folderAnim,
      useAnimation: true,
    },
    // 6. Sources
    {
      name: language === "ar" ? "المصادر" : "Sources",
      path: "/admin/resources",
      icon: archiveAnim,
      useAnimation: true,
    },
    // 7. Analytics
    {
      name: t("admin.analytics"),
      path: "/admin/analytics",
      icon: activityAnim,
      useAnimation: true,
      iconName: "Activity",
    },
  ];

  const ownerItems = [
    { name: t("admin.logs"), path: "/admin/logs", icon: editAnim, useAnimation: true },
    { name: t("admin.errors"), path: "/admin/errors", icon: alertCircleAnim, useAnimation: true },
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

  // Interface for sidebar navigation items
  interface SidebarItem {
    name: string;
    path: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    useAnimation: boolean;
    badge?: number;
    iconName?: string;
  }

  const SidebarLink = ({ item }: { item: SidebarItem }) => {
    const isActive = isActivePath(item.path);
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Link
        href={item.path}
        onClick={onClose}
        prefetch={false}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl transition-all duration-300 font-medium select-none group relative overflow-hidden",
          isActive
            ? "bg-primary/10 text-primary font-bold border-l-4 border-primary shadow-sm dark:bg-primary/20"
            : "text-foreground/80 hover:bg-slate-200/80 dark:hover:bg-white/5 hover:text-foreground hover:translate-x-1"
        )}
      >
        {/* Active Background Glow for Dark Mode */}
        {isActive && <div className="absolute inset-0 bg-primary/5 blur-sm -z-10" />}

        <div className="relative">
          <AnimatedIcon
            icon={item.icon}
            iconName={item.iconName}
            size={24}
            className={cn(
              "lg:w-6 lg:h-6 transition-all duration-200",
              // LUCIDE ICONS: Use text color classes
              !item.useAnimation && isActive && "text-primary",
              !item.useAnimation && !isActive && "text-foreground/70 group-hover:text-foreground",

              // LOTTIE ICONS (Black by default): Use filters
              // Inactive: White in Dark Mode
              item.useAnimation &&
                !isActive &&
                "dark:brightness-0 dark:invert opacity-70 group-hover:opacity-100",
              // Active: Blue Filter (Approximate #3B82F6) -> Handled via style prop below or class if possible
              // We use a specific class or style for active lottie
              item.useAnimation && isActive && "lottie-active-filter"
            )}
            style={{
              // FOR LOTTIE: Filter to turn Black -> Blue
              filter:
                item.useAnimation && isActive
                  ? "invert(48%) sepia(79%) saturate(2476%) hue-rotate(200deg) brightness(118%) contrast(119%)"
                  : undefined,
              // FOR LUCIDE: Explicit Color to ensure Blue (#3B82F6 matches standard primary)
              color: !item.useAnimation && isActive ? "#3B82F6" : undefined,
            }}
            active={isActive || isHovered}
            useAnimation={item.useAnimation}
          />
          {item.badge && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse z-10">
              {item.badge > 9 ? "9+" : item.badge}
            </span>
          )}
        </div>
        <span className="text-sm lg:text-base relative z-10">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 h-full w-[85vw] max-w-[280px] lg:max-w-none lg:w-72 z-[100] transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ease-in-out lg:z-40 lg:translate-x-0 lg:shadow-none mr-0 overflow-hidden",
          // Mobile: rounded on right edge
          "rounded-r-2xl",
          // Desktop: height full, no top offset (content scrolls behind navbar)
          "lg:h-full lg:rounded-tr-2xl lg:rounded-br-2xl",
          language === "ar"
            ? "right-0 lg:right-0 rounded-r-none rounded-l-2xl lg:rounded-l-none lg:rounded-tl-2xl lg:rounded-bl-2xl lg:rounded-tr-none lg:rounded-br-none"
            : "left-0 lg:left-0",
          isOpen ? "translate-x-0" : language === "ar" ? "translate-x-full" : "-translate-x-full"
        )}
      >
        {/* Visual Background Layer - Full Glass */}
        <div
          className={cn(
            "absolute inset-0 glass-premium border-r border-white/10 dark:border-white/5 shadow-2xl transition-all rounded-tr-2xl rounded-br-2xl",
            "lg:shadow-none lg:top-16", // Background starts below navbar on desktop
            language === "ar" &&
              "border-r-0 border-l rounded-tr-none rounded-br-none rounded-tl-2xl rounded-bl-2xl"
          )}
        />

        {/* Scrollable Content Container - Full Height */}
        <div className="relative z-10 h-full lg:h-[calc(100%-70px)] overflow-y-auto scrollbar-none lg:mt-[70px]">
          {/* Sticky Header - Mobile Only */}
          <div className="sticky top-0 z-20 h-16 flex items-center justify-between px-4 border-b border-white/10 lg:hidden">
            {/* Translucent background with blur to show content behind */}
            <div className="absolute inset-0 bg-background/40 backdrop-blur-xl backdrop-saturate-150 -z-10" />

            <div className="flex items-center gap-3">
              {/* Square Logo with Rounded Corners */}
              <div className="relative w-10 h-10 flex-shrink-0 rounded-xl overflow-hidden ring-2 ring-white/20 shadow-lg bg-white">
                <Image
                  src="/obour-logo.png"
                  alt="Obour Logo"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-harman text-lg font-bold leading-tight">Obour Hub</span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  Smart Learning System
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Content */}
          <div className="py-4">
            <nav ref={navRef} onScroll={handleScroll} className="space-y-1 px-2">
              {/* Main Nav */}
              <div className="space-y-2">
                {navItems.map((item) => (
                  <SidebarLink key={item.path} item={item} />
                ))}
              </div>

              {/* Admin Section */}
              {isAdmin && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                    {t("nav.admin")}
                  </p>
                  {adminItems.map((item) => (
                    <SidebarLink key={item.path} item={item} />
                  ))}
                </div>
              )}

              {/* Owner Section */}
              {isOwner && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                    Owner
                  </p>
                  {ownerItems.map((item) => (
                    <SidebarLink key={item.path} item={item} />
                  ))}
                </div>
              )}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
