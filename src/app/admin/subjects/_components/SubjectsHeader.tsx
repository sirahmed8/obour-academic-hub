"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Plus, Search } from "lucide-react";

interface SubjectsHeaderProps {
  language: string;
  onAdd: () => void;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  searchQuery: string;
}

export function SubjectsHeader({
  language,
  onAdd,
  onSearchChange,
  onSearchClear,
  searchQuery,
}: SubjectsHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div className="space-y-2">
        <h1 className="flex items-center gap-3 font-harman text-3xl font-bold">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-7 w-7" />
          </span>
          {language === "ar" ? "إدارة المواد الدراسية" : "Subject Management"}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          {language === "ar"
            ? "إدارة جميع المواد الدراسية، المحاضرين، والهوية البصرية."
            : "Manage all subjects, professors, and visual identity."}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full md:w-64">
          <div className="pointer-events-none absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={language === "ar" ? "بحث عن مادة..." : "Search subjects..."}
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-10 pr-10 text-sm shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={onSearchClear}
                className="absolute right-3 top-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={onAdd}
          className="flex h-12 items-center gap-2 whitespace-nowrap rounded-2xl bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          {language === "ar" ? "إضافة مادة" : "Add Subject"}
        </button>
      </div>
    </div>
  );
}
