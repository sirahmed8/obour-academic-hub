"use client";

import Image from "next/image";
import { Crown, Pencil, Shield, User as UserIcon } from "lucide-react";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { cn } from "@/lib/utils";
import { User, UserPermission } from "@/types";
import {
  EditUserModalState,
  ViewUserModalState,
  ChangeRoleModalState,
  AlertModalState,
} from "../types";

interface UserTableRowProps {
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
  onToggleVip: (user: User) => Promise<void>;
  user: User;
}

export function UserTableRow({
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
  onToggleVip,
  user,
}: UserTableRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[3fr_1.5fr_1.5fr_2fr] items-center border-b border-border transition-colors",
        isSelected ? "bg-primary/5" : "hover:bg-muted/30"
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden px-6 py-4">
        {user.uid !== currentUser?.uid ? (
          <AnimatedCheckbox
            checked={isSelected}
            onChange={() => toggleUserSelection(user.uid)}
            className="mr-2"
          />
        ) : (
          <div className="mr-2 h-4 w-4" />
        )}
        <Image
          src={
            user.photoURL && !imageError[user.uid]
              ? user.photoURL
              : `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`
          }
          alt={user.displayName || "User"}
          width={40}
          height={40}
          unoptimized
          onError={() => setImageError((prev) => ({ ...prev, [user.uid]: true }))}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
        <div className="truncate">
          <div className="truncate font-bold text-foreground">{user.displayName}</div>
          <div className="truncate text-sm text-muted-foreground">{user.email}</div>
        </div>
      </div>

      <div className="truncate px-6 py-4 font-mono text-sm">
        {user.studentCode || (
          <span className="italic text-muted-foreground">
            {language === "ar" ? "غير محدد" : "Not set"}
          </span>
        )}
      </div>

      <div className="px-6 py-4">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
            user.role === "owner"
              ? "bg-amber-100 text-amber-800"
              : user.role === "admin"
                ? "bg-purple-100 text-purple-800"
                : user.role === "moderator"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
          )}
        >
          {user.role === "admin" ? (
            <Shield className="mr-1 h-3 w-3" />
          ) : (
            <UserIcon className="mr-1 h-3 w-3" />
          )}
          {user.role}
        </span>
      </div>

      <div className="px-6 py-4">
        {(user.role !== "owner" || currentUser?.role === "owner") && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {canEditUser(user) && user.role === "student" && (
                <button
                  onClick={() => onToggleVip(user)}
                  title={
                    language === "ar"
                      ? user.isVip
                        ? "إلغاء بلس 👑"
                        : "منح بلس 👑"
                      : user.isVip
                        ? "Revoke VIP 👑"
                        : "Grant VIP 👑"
                  }
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all active:scale-95",
                    user.isVip
                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                      : "bg-amber-50/50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-500 dark:hover:bg-amber-900/40"
                  )}
                >
                  <Crown size={10} />
                  {user.isVip
                    ? language === "ar"
                      ? "إلغاء بلس"
                      : "Revoke VIP"
                    : language === "ar"
                      ? "منح بلس"
                      : "Grant VIP"}
                </button>
              )}
              <button
                onClick={() => setChangeRoleModal({ isOpen: true, user })}
                className="rounded-lg bg-indigo-50/50 px-2.5 py-1 text-[10px] font-bold text-indigo-600 transition-all hover:bg-indigo-100 active:scale-95 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40"
              >
                {language === "ar" ? "تبديل الدور" : "Switch Role"}
              </button>
              {currentUser?.role === "owner" && (
                <button
                  onClick={() => setViewModal({ isOpen: true, user })}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-50/50 px-2.5 py-1 text-[10px] font-bold text-blue-600 transition-all hover:bg-blue-100 active:scale-95 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                  title={language === "ar" ? "عرض البيانات" : "View Data"}
                >
                  <UserIcon size={12} />
                  {language === "ar" ? "البيانات" : "Data"}
                </button>
              )}
              {canEditUser(user) && (
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
                  className="flex items-center gap-1.5 rounded-lg bg-orange-50/50 px-2.5 py-1 text-[10px] font-bold text-orange-600 transition-all hover:bg-orange-100 active:scale-95 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40"
                >
                  <Pencil size={12} />
                  {language === "ar" ? "تعديل" : "Edit"}
                </button>
              )}
              {canEditUser(user) && (
                <>
                  <button
                    onClick={() => setAlertModal({ isOpen: true, user, title: "", message: "" })}
                    className="flex items-center gap-1.5 rounded-lg bg-yellow-50/50 px-2.5 py-1 text-[10px] font-bold text-yellow-600 transition-all hover:bg-yellow-100 active:scale-95 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/40"
                    title={language === "ar" ? "إرسال تنبيه" : "Send Alert"}
                  >
                    {language === "ar" ? "تنبيه" : "Alert"}
                  </button>
                  <button
                    onClick={() => onKickClick(user)}
                    className="flex items-center gap-1.5 rounded-lg bg-red-50/50 px-2.5 py-1 text-[10px] font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                    title={language === "ar" ? "طرد المستخدم" : "Kick User"}
                  >
                    {language === "ar" ? "طرد" : "Kick"}
                  </button>
                  {user.status === "banned" ? (
                    <button
                      onClick={() => onUnbanClick(user)}
                      className="flex items-center gap-1.5 rounded-lg bg-green-50/50 px-2.5 py-1 text-[10px] font-bold text-green-600 transition-all hover:bg-green-100 active:scale-95 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
                      title={language === "ar" ? "إلغاء الحظر" : "Unban User"}
                    >
                      {language === "ar" ? "إلغاء حظر" : "Unban"}
                    </button>
                  ) : (
                    <button
                      onClick={() => onBanClick(user)}
                      className="flex items-center gap-1.5 rounded-lg bg-zinc-100 px-2.5 py-1 text-[10px] font-bold text-zinc-600 transition-all hover:bg-zinc-200 active:scale-95 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                      title={language === "ar" ? "حظر المستخدم" : "Ban User"}
                    >
                      {language === "ar" ? "حظر" : "Ban"}
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteClick(user)}
                    className="flex items-center gap-1.5 rounded-lg bg-red-100 px-2.5 py-1 text-[10px] font-bold text-red-700 transition-all hover:bg-red-200 active:scale-95 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60"
                    title={language === "ar" ? "حذف الحساب نهائياً" : "Delete User Permanently"}
                  >
                    {language === "ar" ? "حذف" : "Delete"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
