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
  Brain,
  FileAudio,
  Calendar,
  Layers,
  Compass,
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
  badge?: string;
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
        "w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm transition-all duration-200 text-start group relative border",
        isSelected
          ? "bg-primary/10 border-primary/30 text-primary font-bold shadow-md shadow-primary/5"
          : "border-transparent hover:bg-muted/60 text-foreground/90"
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div
          className={cn(
            "p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110",
            isSelected
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground"
          )}
        >
          {item.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="leading-snug truncate font-bold text-foreground flex items-center gap-2">
            <span>{isAr ? item.labelAr : item.labelEn}</span>
            {item.badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20 font-black">
                {item.badge}
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate flex items-center gap-1">
            <span>{isAr ? item.categoryAr : item.categoryEn}</span>
          </div>
        </div>
      </div>
      <ArrowRight
        className={cn(
          "w-4 h-4 shrink-0 transition-all duration-200",
          isSelected
            ? "opacity-100 translate-x-0 text-primary"
            : "opacity-0 -translate-x-2 text-muted-foreground"
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
  const [activeCategory, setActiveCategory] = useState<string>("all");
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
        icon: <Home className="w-4 h-4" />,
        action: () => router.push("/"),
      },
      {
        id: "nav-subjects",
        labelEn: "Academic Subjects Hub",
        labelAr: "المواد الدراسية والمحاضرات",
        categoryEn: "Navigation",
        categoryAr: "التنقل",
        badge: "Core",
        icon: <BookOpen className="w-4 h-4" />,
        action: () => router.push("/subject"),
      },
      {
        id: "nav-community",
        labelEn: "Student Community Forum",
        labelAr: "منتدى مجتمع الطلاب",
        categoryEn: "Navigation",
        categoryAr: "التنقل",
        icon: <Users className="w-4 h-4" />,
        action: () => router.push("/community"),
      },
      {
        id: "nav-global-chat",
        labelEn: "Live Global Student Chat",
        labelAr: "المحادثة العامة للطلاب",
        categoryEn: "Navigation",
        categoryAr: "التنقل",
        badge: "Live",
        icon: <MessageSquare className="w-4 h-4" />,
        action: () => router.push("/community/chat"),
      },
      {
        id: "nav-leaderboard",
        labelEn: "Academic Honor Leaderboard",
        labelAr: "لوحة الشرف وتصنيف الطلاب",
        categoryEn: "Navigation",
        categoryAr: "التنقل",
        icon: <Trophy className="w-4 h-4" />,
        action: () => router.push("/community/leaderboard"),
      },
      {
        id: "nav-todo",
        labelEn: "My Academic Tasks & Todos",
        labelAr: "مهامي وواجباتي الدراسية",
        categoryEn: "Navigation",
        categoryAr: "التنقل",
        icon: <CheckSquare className="w-4 h-4" />,
        action: () => router.push("/todo"),
      },
      {
        id: "tool-transcribe",
        labelEn: "AI Lecture Transcriber",
        labelAr: "تحويل المحاضرات الصوتية إلى نص",
        categoryEn: "AI Tools",
        categoryAr: "أدوات الذكاء الاصطناعي",
        badge: "AI ⚡",
        icon: <FileAudio className="w-4 h-4" />,
        action: () => router.push("/transcribe"),
      },
      {
        id: "tool-mindmap",
        labelEn: "AI Mind Map Generator",
        labelAr: "منشئ الخرائط الذهنية الذكي",
        categoryEn: "AI Tools",
        categoryAr: "أدوات الذكاء الاصطناعي",
        badge: "AI 🧠",
        icon: <Brain className="w-4 h-4" />,
        action: () => router.push("/mindmap"),
      },
      {
        id: "tool-quiz",
        labelEn: "AI Practice Quiz Generator",
        labelAr: "مولد الاختبارات والأسئلة الذكية",
        categoryEn: "AI Tools",
        categoryAr: "أدوات الذكاء الاصطناعي",
        badge: "AI 🎯",
        icon: <Layers className="w-4 h-4" />,
        action: () => router.push("/quiz"),
      },
      {
        id: "tool-hagaz",
        labelEn: "Book Study Slot (Hagaz)",
        labelAr: "حجز مواعيد واستشارات دراسية",
        categoryEn: "Academic Tools",
        categoryAr: "أدوات أكاديمية",
        icon: <Calendar className="w-4 h-4" />,
        action: () => router.push("/hagaz"),
      },
      {
        id: "nav-profile",
        labelEn: "My Profile & Account Settings",
        labelAr: "الملف الشخصي وإعدادات الحساب",
        categoryEn: "Account",
        categoryAr: "الحساب",
        icon: <User className="w-4 h-4" />,
        action: () => router.push("/profile"),
      },
      {
        id: "nav-notifications",
        labelEn: "Notifications & Alerts Hub",
        labelAr: "مركز التنبيهات والإشعارات",
        categoryEn: "Account",
        categoryAr: "الحساب",
        icon: <Bell className="w-4 h-4" />,
        action: () => router.push("/notifications"),
      },
      {
        id: "act-theme",
        labelEn: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
        labelAr: `التبديل إلى الوضع ${theme === "dark" ? "الفاتح" : "الداكن"}`,
        categoryEn: "Settings",
        categoryAr: "الإعدادات",
        icon:
          theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          ),
        action: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
    ];

    if (aiEnabled) {
      list.push({
        id: "act-ai",
        labelEn: "Ask Academic Assistant AI",
        labelAr: "اسأل المساعد الذكي للمواد",
        categoryEn: "AI Tools",
        categoryAr: "المساعد الذكي",
        badge: "Pro",
        icon: <Sparkles className="w-4 h-4 text-pink-500" />,
        action: () => {
          window.dispatchEvent(new CustomEvent("openChatbot"));
        },
      });
    }

    return list;
  }, [router, theme, setTheme, aiEnabled]);

  const filteredItems = useMemo(() => {
    let result = items;

    if (activeCategory !== "all") {
      result = result.filter((item) => {
        if (activeCategory === "nav") return item.categoryEn === "Navigation";
        if (activeCategory === "ai") return item.categoryEn === "AI Tools";
        if (activeCategory === "account") return item.categoryEn === "Account";
        return true;
      });
    }

    if (!query.trim()) return result;
    const q = query.toLowerCase();
    return result.filter(
      (item) =>
        item.labelEn.toLowerCase().includes(q) ||
        item.labelAr.toLowerCase().includes(q) ||
        item.categoryEn.toLowerCase().includes(q) ||
        item.categoryAr.toLowerCase().includes(q)
    );
  }, [items, query, activeCategory]);

  const handleSelect = useCallback((item: CommandItem) => {
    setIsOpen(false);
    setQuery("");
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
        className="flex items-center justify-between w-full max-w-md h-10 px-4 transition-all duration-300 rounded-2xl border bg-card/60 hover:bg-card border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground group shadow-sm"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          <span className="text-xs sm:text-sm font-medium truncate">
            {isAr ? "ابحث في المنصة ومحاضراتك..." : "Search subjects, tools, tasks..."}
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg border border-border/80 bg-muted/60">
          <Command className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] font-black text-muted-foreground">K</span>
        </div>
      </button>

      {/* Spotlight Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-3 sm:px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -15 }}
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              className="relative w-full max-w-xl bg-card/95 backdrop-blur-3xl border border-border/80 rounded-3xl shadow-2xl overflow-hidden z-10"
            >
              {/* Search Header Container - Seamless Raycast / Linear Style */}
              <div className="border-b border-border/60 bg-card">
                <div className="flex items-center gap-3.5 px-5 h-16">
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
                    className="no-focus-ring flex-1 w-full bg-transparent border-0 outline-none ring-0 shadow-none text-base sm:text-lg font-medium placeholder:text-muted-foreground/40 text-foreground caret-primary focus:outline-none focus:ring-0 pl-4 pr-2 my-0 h-full leading-[64px]"
                    style={{ height: "100%", lineHeight: "64px" }}
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="p-1.5 hover:bg-muted rounded-xl text-muted-foreground transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-1.5 px-5 pb-3 overflow-x-auto no-scrollbar">
                  {[
                    { id: "all", labelEn: "All Items", labelAr: "الكل", icon: Compass },
                    { id: "nav", labelEn: "Navigation", labelAr: "التنقل", icon: Home },
                    { id: "ai", labelEn: "AI Tools", labelAr: "ذكاء اصطناعي", icon: Sparkles },
                    { id: "account", labelEn: "Account", labelAr: "الحساب", icon: User },
                  ].map((cat) => {
                    const CatIcon = cat.icon;
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setSelectedIndex(0);
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 border",
                          isActive
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-muted/40 text-muted-foreground hover:bg-muted border-border/40"
                        )}
                      >
                        <CatIcon size={12} />
                        <span>{isAr ? cat.labelAr : cat.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Command List Body */}
              <div className="max-h-[380px] overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {filteredItems.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <Search className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm font-bold text-foreground">
                      {isAr ? "لا توجد نتائج مطابقة للبحث" : "No matching results found"}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {isAr
                        ? "جرب البحث عن كلمات أخرى مثل: مواد، واجبات، شرف"
                        : "Try searching for terms like: subjects, todo, leaderboard"}
                    </p>
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

              {/* Spotlight Modal Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-border/60 bg-muted/30 text-[11px] text-muted-foreground font-medium">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-bold">
                      ↑↓
                    </kbd>
                    <span>{isAr ? "للتنقل" : "Navigate"}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-bold">
                      ↵
                    </kbd>
                    <span>{isAr ? "للاختيار" : "Select"}</span>
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-bold">
                    ESC
                  </kbd>
                  <span>{isAr ? "إغلاق" : "Close"}</span>
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
