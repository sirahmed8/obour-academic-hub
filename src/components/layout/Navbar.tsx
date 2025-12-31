"use client";

import { useState } from "react";
import { Menu, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth, useLanguage } from "@/contexts";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const themes = [
    { value: "light", icon: Sun, label: t("profile.lightMode") },
    { value: "dark", icon: Moon, label: t("profile.darkMode") },
    { value: "system", icon: Monitor, label: t("profile.systemMode") },
  ];

  // Close menu with animation
  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSettings(false);
      setIsClosing(false);
    }, 150);
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
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
          className="flex items-center gap-2 p-2 hover:bg-muted rounded-xl transition-colors"
        >
          {user && (
            <Image
              src={
                user.photoURL ||
                `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`
              }
              alt={user.displayName}
              width={36}
              height={36}
              className="rounded-full border-2 border-primary/20"
            />
          )}
        </button>

        {showSettings && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeMenu} />
            <div
              className={cn(
                "absolute top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-2xl z-50 p-4 space-y-4",
                "transition-all duration-150 ease-out",
                isClosing ? "animate-scale-out" : "animate-scale-in",
                language === "ar"
                  ? "left-0 origin-top-left"
                  : "right-0 origin-top-right"
              )}
            >
              <div className="pt-2 border-t border-border">
                {user && (
                  <div className="flex flex-col gap-1 mb-3 px-1">
                    <p className="font-bold text-sm text-foreground">
                      {user.displayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                )}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setLanguage("en")}
                    className={cn(
                      "flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all text-xs font-medium",
                      language === "en"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage("ar")}
                    className={cn(
                      "flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-all text-xs font-medium",
                      language === "ar"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    العربية
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("profile.theme")}
                  </p>
                  <div className="flex bg-muted/50 p-1 rounded-lg">
                    {themes.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.value}
                          onClick={() => setTheme(t.value)}
                          className={cn(
                            "flex-1 p-1.5 rounded-md flex items-center justify-center transition-all",
                            theme === t.value
                              ? "bg-background text-primary shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                          title={t.label}
                        >
                          <Icon size={16} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("notifications.title")}
                  </p>
                  <button
                    onClick={async () => {
                      if (Notification.permission === "granted") {
                        toast.info(
                          language === "ar"
                            ? "يجب إيقاف الإشعارات من إعدادات المتصفح"
                            : "Please disable notifications from site settings"
                        );
                      } else {
                        const result = await Notification.requestPermission();
                        if (result === "granted") {
                          toast.success(
                            language === "ar"
                              ? "تم تفعيل الإشعارات"
                              : "Notifications enabled"
                          );
                        }
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-200 active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-3 text-sm font-medium">
                      <span
                        className={cn(
                          "w-2.5 h-2.5 rounded-full transition-all",
                          typeof window !== "undefined" &&
                            Notification.permission === "granted"
                            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                            : "bg-red-500"
                        )}
                      />
                      {language === "ar" ? "الإشعارات" : "Notifications"}
                    </span>
                    {/* iOS-style toggle */}
                    <div
                      className={cn(
                        "w-11 h-6 rounded-full p-0.5 transition-colors duration-200",
                        typeof window !== "undefined" &&
                          Notification.permission === "granted"
                          ? "bg-green-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      )}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                          typeof window !== "undefined" &&
                            Notification.permission === "granted"
                            ? "translate-x-5"
                            : "translate-x-0"
                        )}
                      />
                    </div>
                  </button>
                </div>
              </div>

              {/* Logout Button */}
              {user && (
                <div className="pt-2 border-t border-border mt-2">
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    {language === "ar" ? "تسجيل خروج" : "Log out"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
