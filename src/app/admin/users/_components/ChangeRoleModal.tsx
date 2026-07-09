"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Shield, X, User as UserIcon, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { User, UserRole } from "@/types";

interface ChangeRoleModalProps {
  isOpen: boolean;
  user: User | null;
  language: string;
  onClose: () => void;
  onConfirm: (role: UserRole) => Promise<void>;
  isOwner: boolean;
}

export function ChangeRoleModal({
  isOpen,
  user,
  language,
  onClose,
  onConfirm,
  isOwner,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | "">(user?.role || "");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedRole || !user || selectedRole === user.role) {
      onClose();
      return;
    }
    setLoading(true);
    await onConfirm(selectedRole as UserRole);
    setLoading(false);
    onClose();
  };

  const roles = [
    {
      id: "student",
      label: language === "ar" ? "عضو / طالب" : "Member / Student",
      icon: UserIcon,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      activeBorder: "border-green-500",
      allowed: true,
    },
    {
      id: "moderator",
      label: language === "ar" ? "مشرف" : "Moderator",
      icon: Shield,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      activeBorder: "border-blue-500",
      allowed: true,
    },
    {
      id: "admin",
      label: language === "ar" ? "مسؤول" : "Admin",
      icon: ShieldAlert,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      activeBorder: "border-purple-500",
      allowed: true,
    },
    {
      id: "owner",
      label: language === "ar" ? "مالك" : "Owner",
      icon: Sparkles,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      activeBorder: "border-amber-500",
      allowed: isOwner,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-background/95 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h3 className="text-xl font-bold">
                {language === "ar" ? "تغيير الصلاحيات" : "Change Role"}
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                {language === "ar"
                  ? `الرجاء اختيار مستوى الصلاحيات الجديد للمستخدم ${user.displayName || user.email}`
                  : `Please select the new role level for ${user.displayName || user.email}`}
              </p>

              <div className="grid gap-3">
                {roles
                  .filter((r) => r.allowed)
                  .map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id as UserRole)}
                        className={cn(
                          "flex items-center gap-4 rounded-xl border p-4 text-left transition-all",
                          isSelected
                            ? cn("bg-black/5 dark:bg-white/5", role.activeBorder)
                            : cn("hover:bg-black/5 dark:hover:bg-white/5", "border-border")
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                            role.bg,
                            role.color
                          )}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <div className="font-semibold">{role.label}</div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-white/10 p-6">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 py-3 font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || selectedRole === user.role}
                className="flex-1 rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-pulse">...</span>
                ) : language === "ar" ? (
                  "تأكيد"
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
