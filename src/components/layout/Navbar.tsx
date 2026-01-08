"use client";

import { useState } from "react";
import { Menu } from "lucide-react"; // Only imported what is used
import { useAuth, useLanguage } from "@/contexts";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ProfileMenu } from "./ProfileMenu";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  // Close menu with animation
  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSettings(false);
      setIsClosing(false);
    }, 150);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 lg:px-6 z-50 bg-white/10 dark:bg-black/10 backdrop-blur-xl backdrop-saturate-150">
      {/* Partial Bottom Border (Skips Logo area on Desktop to merge with Sidebar) */}
      <div className="absolute bottom-0 right-0 h-[1px] bg-white/5 dark:bg-white/5 left-0 lg:left-[18rem] transition-all duration-300" />
      {/* LEFT SIDE: Logo (Desktop) & Menu Button (Mobile) */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-muted-foreground hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>

        {/* Logo & Title - Visible on Desktop & Mobile (Merged Top Bar) */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex-shrink-0 bg-transparent rounded-full overflow-hidden">
            <Image
              src="/obour-logo.png"
              alt="Obour Logo"
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-harman text-lg font-bold leading-tight hidden lg:block">
              Obour Hub
            </span>
            <span className="font-harman text-base font-bold leading-tight lg:hidden">
              Obour Hub
            </span>
            <span className="text-[10px] text-muted-foreground font-medium hidden lg:block">
              {language === "ar" ? "نظام إدارة التعلم الذكي" : "Smart Learning System"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Settings Dropdown */}
      <div className="relative">
        <button
          onClick={() => (showSettings ? closeMenu() : setShowSettings(true))}
          className="flex items-center gap-2 p-2 hover:bg-muted/20 rounded-xl transition-colors relative"
        >
          {user && (
            <>
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-primary/20"
                />
              ) : (
                <div className="w-9 h-9 rounded-full border-2 border-primary/20 bg-muted/50 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
              {/* Red dot for incomplete profile */}
              {!user.studentCode && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-card animate-pulse" />
              )}
            </>
          )}
        </button>

        {showSettings && <ProfileMenu onClose={closeMenu} isClosing={isClosing} />}
      </div>
    </header>
  );
}
