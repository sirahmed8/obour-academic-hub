"use client";

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { useLanguage } from "@/contexts";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface CommandItem {
  id: string;
  labelEn: string;
  labelAr: string;
  categoryEn: string;
  categoryAr: string;
  icon: React.ReactNode;
  action: () => void;
}

export function SearchBar() {
  const { language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isAr = language === "ar";

  // Define spotlight command items
  const items: CommandItem[] = [
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
      labelEn: "Student Community Forum & Chat",
      labelAr: "مجتمع الطلاب والمحادثة العامة",
      categoryEn: "Navigation",
      categoryAr: "التنقل",
      icon: <Users className="w-4 h-4 text-purple-500" />,
      action: () => router.push("/community"),
    },
    {
      id: "nav-leaderboard",
      labelEn: "Academic Honor Leaderboard",
      labelAr: "لوحة الشرف وتصنيف الطلاب",
      categoryEn: "Navigation",
      categoryAr: "التنقل",
      icon: <Trophy className="w-4 h-4 text-amber-500" />,
      action: () => router.push("/leaderboard"),
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
      id: "act-theme",
      labelEn: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      labelAr: `التبديل إلى الوضع ${theme === "dark" ? "الفاتح" : "الداكن"}`,
      categoryEn: "Actions",
      categoryAr: "إجراءات سريعة",
      icon:
        theme === "dark" ? (
          <Sun className="w-4 h-4 text-yellow-400" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700" />
        ),
      action: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
    {
      id: "act-ai",
      labelEn: "Ask Academic Assistant AI",
      labelAr: "اسأل المساعد الذكي للمواد",
      categoryEn: "Actions",
      categoryAr: "إجراءات سريعة",
      icon: <Sparkles className="w-4 h-4 text-pink-500" />,
      action: () => {
        router.push("/subject");
      },
    },
  ];

  const filteredItems = items.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.labelEn.toLowerCase().includes(q) ||
      item.labelAr.toLowerCase().includes(q) ||
      item.categoryEn.toLowerCase().includes(q) ||
      item.categoryAr.toLowerCase().includes(q)
    );
  });

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
        filteredItems[selectedIndex].action();
        setIsOpen(false);
        setQuery("");
      }
    };
    window.addEventListener("keydown", handleNavigation);
    return () => window.removeEventListener("keydown", handleNavigation);
  }, [isOpen, filteredItems, selectedIndex]);

  return (
    <>
      {/* Search trigger button in Navbar */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(true);
          setQuery("");
        }}
        className="flex items-center justify-between w-full max-w-md h-10 px-3 transition-all duration-300 rounded-xl border bg-muted/30 border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground group"
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
              <div className="flex items-center px-4 border-b border-border bg-muted/20">
                <Search className="w-5 h-5 text-muted-foreground me-3" />
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
                  className="flex-1 h-13 py-3 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/60 text-foreground"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground"
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
                  filteredItems.map((item, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          item.action();
                          setIsOpen(false);
                          setQuery("");
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors text-start",
                          isSelected
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-muted/50 text-foreground/90"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-lg",
                              isSelected ? "bg-primary/20" : "bg-muted"
                            )}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <div className="leading-tight">
                              {isAr ? item.labelAr : item.labelEn}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {isAr ? item.categoryAr : item.categoryEn}
                            </div>
                          </div>
                        </div>
                        <ArrowRight
                          className={cn(
                            "w-4 h-4 transition-transform",
                            isSelected ? "opacity-100 translate-x-0.5" : "opacity-0 -translate-x-1"
                          )}
                        />
                      </button>
                    );
                  })
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
