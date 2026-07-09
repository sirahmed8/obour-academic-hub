"use client";

import { Search, Users } from "lucide-react";

interface UsersHeaderProps {
  language: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export function UsersHeader({ language, searchTerm, setSearchTerm }: UsersHeaderProps) {
  return (
    <div className="mb-6 flex shrink-0 flex-col gap-4">
      <h1 className="flex items-center gap-3 text-primary text-2xl font-bold">
        <Users className="text-primary" />
        {language === "ar" ? "المستخدمين" : "Users"}
      </h1>

      <div className="relative flex-1 md:min-w-[320px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
        <input
          type="text"
          placeholder={language === "ar" ? "بحث عن مستخدم..." : "Search users..."}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 pl-10 text-sm shadow-sm outline-none transition-all duration-300 placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 dark:bg-white/2 rtl:pr-10"
        />
      </div>
    </div>
  );
}
