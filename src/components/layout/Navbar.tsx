"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts";
import Image from "next/image";
import { ProfileMenu } from "./ProfileMenu";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { user } = useAuth();

  // Close menu with animation
  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSettings(false);
      setIsClosing(false);
    }, 150);
  };

  return (
    <header className="glass-fixed h-16 bg-white/10 dark:bg-black/10 backdrop-blur-xl backdrop-saturate-150 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50 transition-all duration-300 ease-out border-b border-white/5 dark:border-white/5 supports-[backdrop-filter]:bg-white/5 supports-[backdrop-filter]:dark:bg-black/10">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1" />

      {/* Settings Dropdown */}
      <div className="relative">
        <button
          onClick={() => (showSettings ? closeMenu() : setShowSettings(true))}
          className="flex items-center gap-2 p-2 hover:bg-muted rounded-xl transition-colors relative"
        >
          {user && (
            <>
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.displayName}
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-primary/20"
                />
              ) : (
                <div className="w-9 h-9 rounded-full border-2 border-primary/20 bg-muted flex items-center justify-center">
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
