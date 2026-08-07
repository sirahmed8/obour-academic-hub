"use client";

import { useState } from "react";
import { CheckSquare, Square, Download, UserCog } from "lucide-react";
import { User } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/ui-variants";

interface BulkActionsBarProps {
  selectedUsers: Set<string>;
  users: User[];
  onClearSelection: () => void;
  onBulkRoleChange: (role: "student" | "admin" | "owner") => void;
  onExportCSV: () => void;
  language: "en" | "ar";
}

export function BulkActionsBar({
  selectedUsers,
  users,
  onClearSelection,
  onBulkRoleChange,
  onExportCSV,
  language,
}: BulkActionsBarProps) {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const selectedCount = selectedUsers.size;
  const allSelected = selectedCount === users.length && users.length > 0;
  const someSelected = selectedCount > 0 && selectedCount < users.length;

  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-primary/70 backdrop-blur-xl backdrop-saturate-150 text-primary-foreground rounded-full shadow-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-4 border border-white/20 w-[max-content] max-w-[95vw] overflow-x-auto hide-scrollbar"
      >
        {/* Selection count */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {allSelected ? (
            <CheckSquare className="w-5 h-5" />
          ) : someSelected ? (
            <Square className="w-5 h-5 fill-current opacity-50" />
          ) : (
            <Square className="w-5 h-5" />
          )}
          <span className="font-semibold">
            {selectedCount} {language === "ar" ? "محدد" : "selected"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-l border-primary-foreground/30 pl-3 sm:pl-4 shrink-0">
          {/* Change role */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "flex items-center gap-2"
              )}
              aria-label={language === "ar" ? "تغيير الدور" : "Change role"}
            >
              <UserCog className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">
                {language === "ar" ? "تغيير الدور" : "Change Role"}
              </span>
            </button>

            {showRoleMenu && (
              <div className="absolute bottom-full mb-2 left-0 bg-background text-foreground rounded-lg shadow-lg overflow-hidden min-w-[150px]">
                {["student", "admin"].map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      onBulkRoleChange(role as "student" | "admin" | "owner");
                      setShowRoleMenu(false);
                    }}
                    className="w-full px-4 py-2 hover:bg-secondary transition-colors text-left capitalize"
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "flex items-center gap-2"
            )}
            aria-label={language === "ar" ? "تصدير CSV" : "Export CSV"}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">
              {language === "ar" ? "تصدير" : "Export CSV"}
            </span>
          </button>

          {/* Clear selection */}
          <button
            onClick={onClearSelection}
            className={buttonVariants({ variant: "destructive", size: "sm" })}
          >
            {language === "ar" ? "إلغاء" : "Clear"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
