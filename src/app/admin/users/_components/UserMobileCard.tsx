"use client";

import Image from "next/image";
import { Pencil, User as UserIcon } from "lucide-react";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { ScaleIn } from "@/components/ui/Animations";
import { cn } from "@/lib/utils";
import { User, UserPermission } from "@/types";
import {
  EditUserModalState,
  ViewUserModalState,
  ChangeRoleModalState,
  AlertModalState,
} from "../types";

interface UserMobileCardProps {
  canEditUser: (user: User) => boolean;
  currentUser: User | null;
  setChangeRoleModal: React.Dispatch<React.SetStateAction<ChangeRoleModalState>>;
  imageError: Record<string, boolean>;
  isSelected: boolean;
  language: string;
  setEditModal: React.Dispatch<React.SetStateAction<EditUserModalState>>;
  setAlertModal: React.Dispatch<React.SetStateAction<AlertModalState>>;
  setImageError: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setViewModal: React.Dispatch<React.SetStateAction<ViewUserModalState>>;
  toggleUserSelection: (uid: string) => void;
  onBanClick: (user: User) => void;
  onKickClick: (user: User) => void;
  onUnbanClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
  user: User;
}

export function UserMobileCard({
  canEditUser,
  currentUser,
  setChangeRoleModal,
  imageError,
  isSelected,
  language,
  setEditModal,
  setAlertModal,
  setImageError,
  setViewModal,
  toggleUserSelection,
  onBanClick,
  onKickClick,
  onUnbanClick,
  onDeleteClick,
  user,
}: UserMobileCardProps) {
  return (
    <ScaleIn className={cn("p-4 transition-colors", isSelected ? "bg-primary/5" : "")}>
      <div className="mb-3 flex items-center gap-3">
        {user.uid !== currentUser?.uid ? (
          <AnimatedCheckbox
            checked={isSelected}
            onChange={() => toggleUserSelection(user.uid)}
            className="mr-2"
          />
        ) : (
          <div className="h-5 w-5 shrink-0" />
        )}
        <Image
          src={
            user.photoURL && !imageError[user.uid]
              ? user.photoURL
              : `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`
          }
          alt={user.displayName || "User"}
          width={44}
          height={44}
          unoptimized
          onError={() => setImageError((prev) => ({ ...prev, [user.uid]: true }))}
          className="h-11 w-11 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold text-foreground">{user.displayName}</div>
          <div className="truncate text-sm text-muted-foreground">{user.email}</div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
            user.role === "owner"
              ? "bg-amber-100 text-amber-800"
              : user.role === "admin"
                ? "bg-purple-100 text-purple-800"
                : user.role === "moderator"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
          )}
        >
          {user.role}
        </span>
      </div>

      <div className="mb-3 flex items-center justify-between px-8">
        <span className="text-sm text-muted-foreground">
          {language === "ar" ? "كود الطالب:" : "Student Code:"}
        </span>
        <span className="font-mono text-sm font-medium">
          {user.studentCode || (
            <span className="italic text-muted-foreground">
              {language === "ar" ? "غير محدد" : "Not set"}
            </span>
          )}
        </span>
      </div>

      {(user.role !== "owner" || currentUser?.role === "owner") && (
        <div className="space-y-3 px-8">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setChangeRoleModal({ isOpen: true, user })}
              className="rounded-lg bg-indigo-50/50 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-all hover:bg-indigo-100 active:scale-95 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
            >
              {language === "ar" ? "تبديل الدور" : "Switch Role"}
            </button>
            {currentUser?.role === "owner" && (
              <button
                onClick={() => setViewModal({ isOpen: true, user })}
                className="flex items-center gap-1.5 rounded-lg bg-blue-50/50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-all hover:bg-blue-100 active:scale-95 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
              >
                <UserIcon size={14} />
                {language === "ar" ? "البيانات" : "Data"}
              </button>
            )}
            {canEditUser(user) && (
              <>
                <button
                  onClick={() =>
                    setEditModal({
                      isOpen: true,
                      user,
                      name: user.displayName || "",
                      code: user.studentCode || "",
                      permissions: (user.permissions || []) as UserPermission[],
                    })
                  }
                  className="flex items-center gap-1.5 rounded-lg bg-orange-50/50 px-3 py-1.5 text-xs font-semibold text-orange-600 transition-all hover:bg-orange-100 active:scale-95 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40"
                >
                  <Pencil size={14} />
                  {language === "ar" ? "تعديل" : "Edit"}
                </button>
                <button
                  onClick={() => setAlertModal({ isOpen: true, user, title: "", message: "" })}
                  className="flex items-center gap-1.5 rounded-lg bg-yellow-50/50 px-3 py-1.5 text-xs font-semibold text-yellow-600 transition-all hover:bg-yellow-100 active:scale-95 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/40"
                >
                  {language === "ar" ? "تنبيه" : "Alert"}
                </button>
                <button
                  onClick={() => onKickClick(user)}
                  className="flex items-center gap-1.5 rounded-lg bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                >
                  {language === "ar" ? "طرد" : "Kick"}
                </button>
                {user.status === "banned" ? (
                  <button
                    onClick={() => onUnbanClick(user)}
                    className="flex items-center gap-1.5 rounded-lg bg-green-50/50 px-3 py-1.5 text-xs font-semibold text-green-600 transition-all hover:bg-green-100 active:scale-95 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
                  >
                    {language === "ar" ? "إلغاء حظر" : "Unban"}
                  </button>
                ) : (
                  <button
                    onClick={() => onBanClick(user)}
                    className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-all hover:bg-zinc-200 active:scale-95 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  >
                    {language === "ar" ? "حظر" : "Ban"}
                  </button>
                )}
                <button
                  onClick={() => onDeleteClick(user)}
                  className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 transition-all hover:bg-red-200 active:scale-95 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60"
                >
                  {language === "ar" ? "حذف" : "Delete"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </ScaleIn>
  );
}
