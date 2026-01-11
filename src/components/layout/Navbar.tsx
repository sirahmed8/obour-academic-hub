"use client";

import { useState, useRef } from "react";
import { Menu } from "lucide-react"; // Only imported what is used
import { useAuth, useLanguage } from "@/contexts";
import Image from "next/image";
import { ProfileMenu } from "./ProfileMenu";
import { AnimatePresence } from "framer-motion";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null); // Renamed for clarity
  const profileMenuButtonRef = useRef<HTMLButtonElement>(null); // Added for clarity

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 transition-all duration-300 overflow-visible bg-background/60 dark:bg-background/60 backdrop-blur-xl backdrop-saturate-150 border-b border-white/10 shadow-sm rounded-b-[2rem]">
      {/* Inner Glow Removed */}

      {/* VIVID Spotlight Removed */}

      {/* Content Layer */}
      <div className="relative z-10 h-full flex items-center justify-between px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 hover:bg-white/10 rounded-full lg:hidden transition-colors active:scale-95"
          ref={mobileMenuButtonRef}
        >
          <Menu className="w-6 h-6 text-foreground" />
        </button>

        {/* Logo - Visible on Desktop Only */}
        <div className="hidden lg:flex items-center gap-2">
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
            <span className="font-harman text-base font-bold leading-none">
              {t("navbar.title")}
            </span>
            <span className="text-[9px] text-muted-foreground font-medium">
              {t("navbar.subtitle")}
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Settings Dropdown */}
        <div className="relative">
          <button
            ref={profileMenuButtonRef}
            onClick={() => setShowSettings(!showSettings)}
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

          <AnimatePresence>
            {showSettings && (
              <ProfileMenu
                onClose={() => setShowSettings(false)}
                triggerRef={profileMenuButtonRef as React.RefObject<HTMLElement>}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
