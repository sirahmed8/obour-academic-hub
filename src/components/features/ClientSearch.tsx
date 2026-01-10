"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  title: string;
  type: "subject" | "resource";
  description?: string;
  url: string;
}

interface ClientSearchProps {
  data: SearchResult[];
  placeholder?: string;
  onResultClick?: (result: SearchResult) => void;
}

export function ClientSearch({
  data,
  placeholder = "Search...",
  onResultClick,
}: ClientSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    return data
      .filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm) ||
          item.description?.toLowerCase().includes(searchTerm)
      )
      .slice(0, 10); // Limit to 10 results
  }, [query, data]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        aria-label="Open search"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm text-muted-foreground">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Search modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
              aria-hidden="true"
            />

            {/* Search dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white/10 dark:bg-black/10 backdrop-blur-xl backdrop-saturate-150 border border-white/20 dark:border-white/10 rounded-lg shadow-lg z-50 overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Search"
            >
              {/* Search input */}
              <div className="flex items-center gap-2 px-4 py-3 border-b">
                <Search className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  autoFocus
                  aria-label="Search input"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search results */}
              <div className="max-h-96 overflow-y-auto">
                {results.length > 0 ? (
                  <ul role="listbox" aria-label="Search results">
                    {results.map((result) => (
                      <li key={result.id} role="option" aria-selected="false">
                        <button
                          onClick={() => {
                            onResultClick?.(result);
                            setIsOpen(false);
                          }}
                          className="w-full px-4 py-3 hover:bg-secondary transition-colors text-left flex items-start gap-3"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-foreground">{result.title}</div>
                            {result.description && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {result.description}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              {result.type === "subject" ? "Subject" : "Resource"}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : query.trim() ? (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    Start typing to search...
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
