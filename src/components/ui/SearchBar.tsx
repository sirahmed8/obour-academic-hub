"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Command, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function SearchBar() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut Ctrl+K to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    // Redirect to a search results page or filter current view
    router.push(`/subject?search=${encodeURIComponent(query)}`);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="relative w-full max-w-md group">
      <form onSubmit={handleSearch} className="relative flex items-center w-full">
        <div
          className={cn(
            "relative flex items-center w-full h-10 px-3 transition-all duration-300 rounded-xl border",
            isFocused
              ? "bg-background border-primary shadow-[0_0_15px_-3px_rgba(var(--primary),0.2)] ring-2 ring-primary/10"
              : "bg-muted/30 border-transparent hover:bg-muted/50"
          )}
        >
          <Search
            className={cn(
              "w-4 h-4 transition-colors",
              isFocused ? "text-primary" : "text-muted-foreground"
            )}
          />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder={t("common.search") + "..."}
            className="flex-1 h-full px-3 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/60 w-full"
          />

          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => setQuery("")}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>

          {!isFocused && !query && (
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-muted-foreground/20 bg-muted/50 ml-2">
              <Command className="w-2.5 h-2.5 text-muted-foreground/60" />
              <span className="text-[10px] font-medium text-muted-foreground/60">K</span>
            </div>
          )}

          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary ml-2" />}
        </div>
      </form>
    </div>
  );
}
