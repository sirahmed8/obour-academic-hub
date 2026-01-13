"use client";

import { useEffect, useState, useRef, memo, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth, useLanguage, useSolidMode } from "@/contexts";
import { UserPermission } from "@/types";

import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { notificationService } from "@/services/notification.service";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedIcon } from "@/components/ui/AnimatedIcon";

// Animation JSON data (for lottie-react)
import homeAnim from "react-useanimations/lib/home/home.json";
import checkBoxAnim from "react-useanimations/lib/checkBox/checkBox.json";
import notificationAnim from "react-useanimations/lib/notification/notification.json";
import folderAnim from "react-useanimations/lib/folder/folder.json";
import mailAnim from "react-useanimations/lib/mail/mail.json";
import editAnim from "react-useanimations/lib/edit/edit.json";
import settingsAnim from "react-useanimations/lib/settings/settings.json";
import archiveAnim from "react-useanimations/lib/archive/archive.json";
import userPlusAnim from "react-useanimations/lib/userPlus/userPlus.json";
import alertCircleAnim from "react-useanimations/lib/alertCircle/alertCircle.json";
import activityAnim from "react-useanimations/lib/activity/activity.json";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, isOwner } = useAuth();
  const { t, language } = useLanguage();
  const { isSolid } = useSolidMode();
  const [unreadCount, setUnreadCount] = useState(0);
  const [inboxUnreadCount, setInboxUnreadCount] = useState(0);

  const [persistentAdmin, setPersistentAdmin] = useState(isAdmin);
  const [persistentOwner, setPersistentOwner] = useState(isOwner);

  // Sync persistent roles to prevent flickering during navigation
  useEffect(() => {
    if (!user) {
      setPersistentAdmin(false);
      setPersistentOwner(false);
      return;
    }
    if (isAdmin) setPersistentAdmin(true);
    if (isOwner) setPersistentOwner(true);
  }, [user, isAdmin, isOwner]);

  // Listen for unread chats (Admin only) and Notifications
  useEffect(() => {
    if (!user) return;

    // 1. Notifications Listener (Secure Component-Level Subscription)
    const unsubNotif = notificationService.subscribeToUser(
      user.uid,
      (notifications) => {
        const relevant = notifications.filter((n) => {
          if (n.target === "all" || !n.target) return true;
          if (n.target === "admins" && isAdmin) return true;
          if (n.target === user.uid) return true;
          return false;
        });

        const unread = relevant.filter((n) => !n.readBy?.includes(user.uid)).length;
        setUnreadCount(unread);
      },
      (error) => {
        console.error("Sidebar: Notification listener error", error);
      }
    );

    // 2. Chat Listener (For Admin Inbox Badge)
    let unsubChats = () => {};
    if (isAdmin) {
      const chatQuery = query(collection(db, "chats"));
      unsubChats = onSnapshot(
        chatQuery,
        (snapshot) => {
          let count = 0;
          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            count += data.adminUnreadCount || 0;
          });
          setInboxUnreadCount(count);
        },
        (error) => {
          console.error("Sidebar: Chat listener error (likely permissions)", error);
          setInboxUnreadCount(0);
        }
      );
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

  const navItems = useMemo<SidebarItem[]>(
    () => [
      { name: t("nav.home"), path: "/main", icon: homeAnim, useAnimation: true },
      { name: t("nav.todo"), path: "/todo", icon: checkBoxAnim, useAnimation: true },
      {
        name: t("nav.notifications"),
        path: "/notifications",
        icon: notificationAnim,
        useAnimation: true,
        badge: unreadCount > 0 ? unreadCount : undefined,
      },
    ],
    [t, unreadCount]
  );

  const adminItems = useMemo<SidebarItem[]>(
    () => [
      // 1. Team Management
      {
        name: t("nav.teamManagement"),
        path: "/admin/team",
        icon: settingsAnim,
        useAnimation: true,
        requiredPermission: "manage_users" as UserPermission,
      },
      // 2. Users
      {
        name: t("admin.users"),
        path: "/admin/users",
        icon: userPlusAnim,
        useAnimation: true,
        requiredPermission: "manage_users" as UserPermission,
      },
      // 3. Inbox
      {
        name: t("admin.inbox"),
        path: "/admin/inbox",
        icon: mailAnim,
        useAnimation: true,
        badge: inboxUnreadCount > 0 ? inboxUnreadCount : undefined,
        requiredPermission: "access_inbox" as UserPermission,
      },
      // 4. Announcements
      {
        name: t("nav.announcements"),
        path: "/admin/notifications",
        icon: notificationAnim,
        useAnimation: true,
        requiredPermission: "manage_announcements" as UserPermission,
      },
      // 5. Subject Management (formerly "Subjects")
      {
        name: t("nav.subjectManagement"),
        path: "/admin/subjects",
        icon: folderAnim,
        useAnimation: true,
        requiredPermission: "manage_subjects" as UserPermission,
      },
      // 6. Sources
      {
        name: t("nav.sources"),
        path: "/admin/resources",
        icon: archiveAnim,
        useAnimation: true,
        requiredPermission: "manage_resources" as UserPermission,
      },
      // 7. Analytics
      {
        name: t("admin.analytics"),
        path: "/admin/analytics",
        icon: activityAnim,
        useAnimation: true,
        requiredPermission: "view_analytics" as UserPermission,
      },
    ],
    [t, inboxUnreadCount]
  );

  const ownerItems = useMemo<SidebarItem[]>(
    () => [
      { name: t("nav.settings"), path: "/admin/settings", icon: settingsAnim, useAnimation: true },
      { name: t("admin.logs"), path: "/admin/logs", icon: editAnim, useAnimation: true },
      { name: t("admin.errors"), path: "/admin/errors", icon: alertCircleAnim, useAnimation: true },
    ],
    [t]
  );

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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-60 bg-black/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 h-full w-[85vw] max-w-[280px] lg:max-w-none lg:w-72 z-60 lg:z-30 transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ease-in-out lg:translate-x-0 lg:shadow-none mr-0 overflow-hidden",
          // Mobile: rounded
          "rounded-r-[2.5rem]",
          // Desktop: Top-0 for blur, NO top-right round (covered by curtain/navbar)
          "lg:rounded-tr-none lg:rounded-br-[2.5rem]",
          language === "ar"
            ? "right-0 lg:right-0 rounded-r-none rounded-l-[2.5rem] lg:rounded-l-none lg:rounded-tl-[2.5rem] lg:rounded-bl-[2.5rem] lg:rounded-tr-none lg:rounded-br-none"
            : "left-0 lg:left-0",
          isOpen ? "translate-x-0" : language === "ar" ? "translate-x-full" : "-translate-x-full"
        )}
      >
        {/* Visual Background Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* 1. Full Height Blur Track (No Borders) */}
          <div
            className={cn(
              "absolute inset-0 transition-all duration-300",
              !isSolid && "backdrop-blur-xl backdrop-saturate-150"
            )}
          />

          {/* 2. Top Border Segment: Only for the area behind Navbar (Logo area) */}
          <div
            className={cn(
              "absolute top-0 h-16 w-full transition-all border-black/5 dark:border-white/5",
              language === "ar" ? "border-l" : "border-r"
            )}
          />

          {/* 3. Main Body: Color Fill + Corner Highlight + Borders */}
          {/* We start at top-16 and use a slightly more opaque background for better definition */}
          <div
            className={cn(
              "absolute top-16 bottom-0 inset-x-0 transition-all duration-300 border-black/5 dark:border-white/5",
              isSolid ? "bg-background shadow-lg" : "bg-background/60",
              // Borders and Corners based on language
              language === "ar"
                ? "border-l border-b rounded-bl-[2.5rem]"
                : "border-r border-b rounded-br-[2.5rem]"
            )}
          />
        </div>

        {/* Scrollable Content Container - Starts from top-0 to allow content under Navbar (blur) */}
        <div className="relative z-10 h-full flex flex-col lg:mr-1">
          {/* Mobile Header - Visible only on Mobile */}
          <div className="absolute top-0 left-0 right-0 z-20 h-16 flex items-center justify-between px-4 border-b border-white/10 lg:hidden pointer-events-none">
            <div
              className={cn(
                "absolute inset-0 transition-all duration-300 -z-10",
                isSolid
                  ? "bg-background"
                  : "bg-background/60 backdrop-blur-xl backdrop-saturate-150"
              )}
            />
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 shrink-0 rounded-xl overflow-hidden ring-2 ring-white/20 shadow-lg bg-white">
                <Image
                  src="/obour-logo.png"
                  alt="Obour Logo"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-harman text-lg font-bold leading-tight">
                  {t("navbar.title")}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {t("navbar.subtitle")}
                </span>
              </div>
            </div>
          </div>

          {/* 
            Navigation Content - Scrollable: h-full allows scrolling behind Navbar.
            We use a custom style for the scrollbar track to force it to start below the Navbar (64px).
          */}
          <div
            className={cn(
              "flex-1 overflow-y-auto overscroll-contain h-full pt-17 lg:pt-[68px]",
              "[&::-webkit-scrollbar-track]:mt-[64px]"
            )}
          >
            {/* Custom Scrollbar applied via CSS or class if needed, or default browser scrollbar inside clipped area */}
            <div className="pb-4">
              <nav ref={navRef} onScroll={handleScroll} className="space-y-1 px-2">
                {/* Main Nav */}
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <SidebarLink
                      key={item.path}
                      name={item.name}
                      path={item.path}
                      icon={item.icon}
                      useAnimation={item.useAnimation}
                      badge={item.badge}
                      iconName={item.iconName}
                      isActive={isActivePath(item.path)}
                      onClose={onClose}
                    />
                  ))}
                </div>

                {/* Admin Section */}
                <div className={cn("space-y-2 pt-2", !persistentAdmin && "hidden")}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                    {t("nav.admin")}
                  </p>
                  <div className="space-y-1">
                    {adminItems
                      .filter((item) => {
                        if (isOwner) return true;
                        if (!item.requiredPermission) return true;
                        return user?.permissions?.includes(item.requiredPermission);
                      })
                      .map((item) => (
                        <SidebarLink
                          key={item.path}
                          name={item.name}
                          path={item.path}
                          icon={item.icon}
                          useAnimation={item.useAnimation}
                          badge={item.badge}
                          iconName={item.iconName}
                          isActive={isActivePath(item.path)}
                          onClose={onClose}
                        />
                      ))}
                  </div>
                </div>

                {/* Owner Section */}
                <div className={cn("space-y-2 pt-2", !persistentOwner && "hidden")}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                    {t("nav.owner")}
                  </p>
                  {ownerItems.map((item) => (
                    <SidebarLink
                      key={item.path}
                      name={item.name}
                      path={item.path}
                      icon={item.icon}
                      useAnimation={item.useAnimation}
                      badge={item.badge}
                      iconName={item.iconName}
                      isActive={isActivePath(item.path)}
                      onClose={onClose}
                    />
                  ))}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// Navigation item data structure
interface SidebarItem {
  name: string;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  useAnimation: boolean;
  badge?: number;
  iconName?: string;
  requiredPermission?: UserPermission;
}

// Extracted Component to prevent re-renders on parent state change
interface SidebarLinkProps {
  name: string;
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  useAnimation: boolean;
  badge?: number;
  iconName?: string;
  isActive: boolean;
  onClose: () => void;
}

const SidebarLink = memo(
  ({ name, path, icon, useAnimation, badge, iconName, isActive, onClose }: SidebarLinkProps) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Link
        href={path}
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
            icon={icon}
            iconName={iconName}
            size={24}
            className={cn(
              "lg:w-6 lg:h-6 transition-all duration-200",
              // LUCIDE ICONS: Use text color classes
              !useAnimation && isActive && "text-primary",
              !useAnimation && !isActive && "text-foreground/70 group-hover:text-foreground",

              // LOTTIE ICONS (Black by default): Use filters
              // Inactive: White in Dark Mode
              useAnimation &&
                !isActive &&
                "dark:brightness-0 dark:invert opacity-70 group-hover:opacity-100",
              // Active: Blue Filter (Approximate #3B82F6) -> Handled via style prop below or class if possible
              // We use a specific class or style for active lottie
              useAnimation && isActive && "lottie-active-filter"
            )}
            style={{
              // FOR LOTTIE: Filter to turn Black -> Blue
              filter:
                useAnimation && isActive
                  ? "invert(48%) sepia(79%) saturate(2476%) hue-rotate(200deg) brightness(118%) contrast(119%)"
                  : undefined,
              // FOR LUCIDE: Explicit Color to ensure Blue (#3B82F6 matches standard primary)
              color: !useAnimation && isActive ? "#3B82F6" : undefined,
            }}
            active={isActive || isHovered}
            useAnimation={useAnimation}
          />
          {badge && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center z-10 shadow-sm">
              {badge > 9 ? "9+" : badge}
            </span>
          )}
        </div>
        <span className="text-sm lg:text-base relative z-10">{name}</span>
      </Link>
    );
  }
);

SidebarLink.displayName = "SidebarLink";
