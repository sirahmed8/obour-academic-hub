"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Search,
  Command,
  X,
  BookOpen,
  Users,
  Trophy,
  CheckSquare,
  Home,
  Moon,
  Sun,
  Sparkles,
  ArrowRight,
  MessageSquare,
  User,
  Bell,
} from "lucide-react";
import { useLanguage } from "@/contexts";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SiteSettings } from "@/types";

interface CommandItem {
  id: string;
  labelEn: string;
  labelAr: string;
  categoryEn: string;
  categoryAr: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandListItemProps {
  item: CommandItem;
  index: number;
  isSelected: boolean;
  isAr: boolean;
  onSelect: (item: CommandItem) => void;
  onHoverIndex: (index: number) => void;
}

const CommandListItem = React.memo(function CommandListItem({
  item,
  index,
  isSelected,
  isAr,
  onSelect,
  onHoverIndex,
}: CommandListItemProps) {
  const handleMouseEnter = useCallback(() => {
    onHoverIndex(index);
  }, [onHoverIndex, index]);

  const handleClick = useCallback(() => {
    onSelect(item);
  }, [onSelect, item]);

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors text-start",
        isSelected
          ? "bg-primary/10 text-primary font-medium"
          : "hover:bg-muted/50 text-foreground/90"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className={cn("p-2 rounded-lg shrink-0", isSelected ? "bg-primary/20" : "bg-muted")}>
          {item.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="leading-tight truncate font-medium">
            {isAr ? item.labelAr : item.labelEn}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
            {isAr ? item.categoryAr : item.categoryEn}
          </div>
        </div>
      </div>
      <ArrowRight
        className={cn(
          "w-4 h-4 shrink-0 transition-all duration-200",
          isSelected ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
        )}
      />
    </button>
  );
});

export function SearchBar() {
  const { language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiEnabled, setAiEnabled] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isAr = language === "ar";

  // Listen for global settings to check if AI Mode is enabled
  useEffect(() => {
    if (!db) return;
    const settingsRef = doc(db, "settings", "global");
    const unsubscribe = onSnapshot(
      settingsRef,
      (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data() as SiteSettings;
        setAiEnabled(data.aiEnabled ?? true);
      },
      (error) => {
        console.error("SearchBar settings listener error:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      {
        id: "nav-home",
        labelEn: "Dashboard & Home",
        labelAr: "الرئيسية ولوحة التحكم",
        categoryEn: "Navigation",
        categoryAr: "التنقل",
        icon: <Home className="w-4 h-4 text-blue-500" />,
        action: () => router.push("/"),
      },
      {
        id: "nav-subjects",
        labelEn: "Academic Subjects Hub",
        labelAr: "المواد الدراسية والمحاضرات",
        categoryEn: "Navigation",
        categoryAr: "التنقل",
        icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
        action: () => router.push("/subject"),
      },
      {
        id: "nav-community",
        labelEn: "Student Community Forum",
        labelAr: "منتدى مجتمع الطلاب",
        categoryEn: "Navigation",
        categoryAr: "التنقل",
        icon: <Users className="w-4 h-4 text-purple-500" />,
        action: () => router.push("/community"),
      },
      {
        id: "nav-global-chat",
        labelEn: "Live Global Student Chat",
        labelAr: "المحادثة العامة للطلاب",
        categoryEn: "Navigation",
        categoryAr: "التنقل",
        icon: <MessageSquare className="w-4 h-4 text-cyan-500" />,
        action: () => router.push("/community/chat"),
      },
      {
        id: "nav-leaderboard",
        labelEn: "Academic Honor Leaderboard",
        labelAr: "لوحة الشرف وتصنيف الطلاب",
        categoryEn: "Navigation",
        categoryAr: "التنقل",
        icon: <Trophy className="w-4 h-4 text-amber-500" />,
        action: () => router.push("/community/leaderboard"),
      },
      {
        id: "nav-todo",
        labelEn: "My Academic Tasks & Todos",
        labelAr: "مهامي وواجباتي الدراسية",
        categoryEn: "Navigation",
        categoryAr: "التنقل",
        icon: <CheckSquare className="w-4 h-4 text-indigo-500" />,
        action: () => router.push("/todo"),
      },
      {
        id: "nav-profile",
        labelEn: "My Profile & Account Settings",
        labelAr: "الملف الشخصي وإعدادات الحساب",
        categoryEn: "Navigation",
        categoryAr: "التنقل",
        icon: <User className="w-4 h-4 text-violet-500" />,
        action: () => router.push("/profile"),
      },
      {
        id: "nav-notifications",
        labelEn: "Notifications & Alerts Hub",
        labelAr: "مركز التنبيهات والإشعارات",
        categoryEn: "Navigation",
        categoryAr: "التنقل",
        icon: <Bell className="w-4 h-4 text-rose-500" />,
        action: () => router.push("/notifications"),
      },
      {
        id: "act-theme",
        labelEn: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
        labelAr: `التبديل إلى الوضع ${theme === "dark" ? "الفاتح" : "الداكن"}`,
        categoryEn: "Quick Actions",
        categoryAr: "إجراءات سريعة",
        icon:
          theme === "dark" ? (
            <Sun className="w-4 h-4 text-yellow-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          ),
        action: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
    ];

    if (aiEnabled) {
      list.push({
        id: "act-ai",
        labelEn: "Ask Academic Assistant AI",
        labelAr: "اسأل المساعد الذكي للمواد",
        categoryEn: "AI Assistant",
        categoryAr: "المساعد الذكي",
        icon: <Sparkles className="w-4 h-4 text-pink-500" />,
        action: () => {
          window.dispatchEvent(new CustomEvent("openChatbot"));
        },
      });
    }

    return list;
  }, [router, theme, setTheme, aiEnabled]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.labelEn.toLowerCase().includes(q) ||
        item.labelAr.toLowerCase().includes(q) ||
        item.categoryEn.toLowerCase().includes(q) ||
        item.categoryAr.toLowerCase().includes(q)
    );
  }, [items, query]);

  const handleSelect = useCallback((item: CommandItem) => {
    setIsOpen(false);
    setQuery("");
    // Defer navigation to next tick so UI unmounts immediately without blocking
    setTimeout(() => {
      item.action();
    }, 15);
  }, []);

  const handleHoverIndex = useCallback((index: number) => {
    setSelectedIndex((prev) => (prev === index ? prev : index));
  }, []);

  // Global Keyboard Shortcuts (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Handle keyboard navigation within command palette
  useEffect(() => {
    if (!isOpen) return;
    const handleNavigation = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) =>
            (prev - 1 + Math.max(1, filteredItems.length)) % Math.max(1, filteredItems.length)
        );
      } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredItems[selectedIndex]);
      }
    };
    window.addEventListener("keydown", handleNavigation);
    return () => window.removeEventListener("keydown", handleNavigation);
  }, [isOpen, filteredItems, selectedIndex, handleSelect]);

  return (
    <>
      {/* Search trigger button in Navbar */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setQuery("");
        }}
        className="flex items-center justify-between w-full max-w-md h-10 px-4 transition-all duration-300 rounded-xl border bg-muted/30 border-border/60 hover:bg-muted/50 hover:border-primary/40 text-muted-foreground hover:text-foreground group"
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-sm truncate">
            {isAr ? "ابحث في المنصة ومحاضراتك..." : "Search subjects, forums, tools..."}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-muted-foreground/20 bg-muted/50">
          <Command className="w-2.5 h-2.5 text-muted-foreground/60" />
          <span className="text-[10px] font-medium text-muted-foreground/60">K</span>
        </div>
      </button>

      {/* Spotlight Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-10"
            >
              {/* Search Input Bar */}
              <div className="flex items-center gap-3 px-5 border-b border-border/80 bg-card/95">
                <Search className="w-5 h-5 text-primary shrink-0" />
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder={
                    isAr
                      ? "اكتب للبحث عن مادة، قسم، أداة دراسية..."
                      : "Type a command or search academic resources..."
                  }
                  className="no-focus-ring w-full flex-1 h-14 py-3 bg-transparent border-0 outline-none ring-0 shadow-none text-base font-normal placeholder:text-muted-foreground/50 text-foreground caret-primary focus:outline-none focus:ring-0 leading-normal"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-1.5 hover:bg-muted/80 rounded-xl text-muted-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Command List */}
              <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
                {filteredItems.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    {isAr ? "لا توجد نتائج مطابقة للبحث" : "No matching results found"}
                  </div>
                ) : (
                  filteredItems.map((item, index) => (
                    <CommandListItem
                      key={item.id}
                      item={item}
                      index={index}
                      isSelected={index === selectedIndex}
                      isAr={isAr}
                      onSelect={handleSelect}
                      onHoverIndex={handleHoverIndex}
                    />
                  ))
                )}
              </div>

              {/* Footer navigation hints */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>{isAr ? "تنقل بواسطة الأسهم" : "Navigate with arrows"}</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-background border font-mono text-[9px]">
                    ↑↓
                  </kbd>
                </div>
                <div className="flex items-center gap-2">
                  <span>{isAr ? "اختيار" : "Select"}</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-background border font-mono text-[9px]">
                    Enter
                  </kbd>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
