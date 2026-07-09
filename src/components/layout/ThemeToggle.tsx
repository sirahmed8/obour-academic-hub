"use client";

import { useTheme } from "next-themes";
import { useLanguage } from "@/contexts";
import { Sun, Moon, Monitor } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  const themes = [
    { value: "light", icon: Sun, label: t("profile.lightMode") },
    { value: "dark", icon: Moon, label: t("profile.darkMode") },
    { value: "system", icon: Monitor, label: t("profile.systemMode") },
  ];

  return (
    <div className="space-y-2" role="radiogroup" aria-labelledby="theme-label">
      <p
        id="theme-label"
        className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
      >
        {t("profile.theme")}
      </p>
      <div className="flex bg-muted/50 p-1 rounded-lg relative">
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = theme === t.value;
          return (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              role="radio"
              aria-checked={isActive}
              aria-label={t.label}
              className={cn(
                "flex-1 p-1.5 rounded-md flex items-center justify-center transition-all relative z-10",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              )}
              title={t.label}
            >
              {isActive && (
                <motion.div
                  layoutId="theme-knob"
                  className="absolute inset-0 bg-background shadow-sm rounded-md"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                />
              )}
              <span className="relative z-10">
                <Icon size={16} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
