"use client";

import { useState, useEffect } from "react";

import { useLanguage, useAuth } from "@/contexts";
import { User as UserType, UserPermission } from "@/types";
import { userService } from "@/services/user.service";
import { Loader2, Shield, User, Pencil, X, Users, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { StaggerChildren, ScaleIn } from "@/components/ui/Animations";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

import { BulkActionsBar } from "@/components/admin/BulkActionsBar";
import { UserDetailModal } from "@/components/admin/UserDetailModal";

// Define permissions
const PERMISSIONS: { key: UserPermission; label: string; labelAr: string }[] = [
  { key: "manage_users", label: "Manage Users", labelAr: "إدارة المستخدمين" },
  { key: "manage_subjects", label: "Manage Subjects", labelAr: "إدارة المواد" },
  { key: "manage_resources", label: "Manage Resources", labelAr: "إدارة المصادر" },
  { key: "send_notifications", label: "Send Notifications", labelAr: "إرسال إشعارات" },
  { key: "delete_chats", label: "Delete Chats", labelAr: "حذف المحادثات" },
  { key: "access_inbox", label: "Access Inbox", labelAr: "الوصول للصندوق الوارد" },
  {
    key: "manage_announcements",
    label: "Manage Announcements",
    labelAr: "إدارة الإعلانات",
  },
  { key: "view_analytics", label: "View Analytics", labelAr: "عرض الإحصائيات" },
];

interface UserRowProps {
  user: UserType;
  isSelected: boolean;
  currentUser: UserType | null;
  language: string;
  toggleUserSelection: (uid: string) => void;
  handleToggleRole: (uid: string, role: string, email: string) => void;
  setViewModal: (data: { isOpen: boolean; user: UserType | null }) => void;
  setEditModal: (data: {
    isOpen: boolean;
    user: UserType | null;
    name: string;
    code: string;
    permissions: UserPermission[];
  }) => void;
  canEditUser: (u: UserType) => boolean;
  imageError: Record<string, boolean>;
  setImageError: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

// --- Extracted Row Component ---
const TableRow = ({
  user,
  isSelected,
  currentUser,
  language,
  toggleUserSelection,
  handleToggleRole,
  setViewModal,
  setEditModal,
  canEditUser,
  imageError,
  setImageError,
}: UserRowProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-[3fr_1.5fr_1.5fr_2fr] border-b border-border transition-colors items-center",
        isSelected ? "bg-primary/5" : "hover:bg-muted/30"
      )}
    >
      {/* User Column */}
      <div className="px-6 py-4 flex items-center gap-3 overflow-hidden">
        {user.uid !== currentUser?.uid ? (
          <AnimatedCheckbox
            checked={isSelected}
            onChange={() => toggleUserSelection(user.uid)}
            className="mr-2"
            aria-label={
              language === "ar"
                ? `تحديد المستخدم ${user.displayName || ""}`
                : `Select user ${user.displayName || "User"}`
            }
          />
        ) : (
          <div className="w-4 h-4 mr-2" />
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
          className="rounded-full shrink-0 w-10 h-10 object-cover"
        />
        <div className="truncate">
          <div className="font-bold text-foreground truncate">{user.displayName}</div>
          <div className="text-sm text-muted-foreground truncate">{user.email}</div>
        </div>
      </div>

      {/* Student Code */}
      <div className="px-6 py-4 font-mono text-sm truncate">
        {user.studentCode || (
          <span className="text-muted-foreground italic">
            {language === "ar" ? "غير محدد" : "Not set"}
          </span>
        )}
      </div>

      {/* Role */}
      <div className="px-6 py-4">
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
            user.role === "owner"
              ? "bg-amber-100 text-amber-800"
              : user.role === "admin"
                ? "bg-purple-100 text-purple-800"
                : "bg-green-100 text-green-800"
          )}
        >
          {user.role === "admin" ? (
            <Shield className="w-3 h-3 mr-1" />
          ) : (
            <User className="w-3 h-3 mr-1" />
          )}
          {user.role}
        </span>
      </div>

      {/* Actions */}
      <div className="px-6 py-4">
        {user.role !== "owner" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handleToggleRole(user.uid, user.role, user.email)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all active:scale-95"
              >
                {language === "ar" ? "تبديل الدور" : "Switch Role"}
              </button>
              {currentUser?.role === "owner" && (
                <button
                  onClick={() => setViewModal({ isOpen: true, user })}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95"
                  title={language === "ar" ? "عرض البيانات" : "View Data"}
                >
                  <User size={12} />
                  {language === "ar" ? "البيانات" : "Data"}
                </button>
              )}
              {canEditUser(user) && (
                <button
                  onClick={() =>
                    setEditModal({
                      isOpen: true,
                      user: user,
                      name: user.displayName || "",
                      code: user.studentCode || "",
                      permissions: user.permissions || [],
                    })
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all active:scale-95"
                >
                  <Pencil size={12} />
                  {language === "ar" ? "تعديل" : "Edit"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminUsersPage() {
  const { language } = useLanguage();

  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [limitCount, setLimitCount] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: () => {},
  });

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    user: UserType | null;
    name: string;
    code: string;
    permissions: UserPermission[];
  }>({
    isOpen: false,
    user: null,
    name: "",
    code: "",
    permissions: [],
  });

  const [viewModal, setViewModal] = useState<{
    isOpen: boolean;
    user: UserType | null;
  }>({
    isOpen: false,
    user: null,
  });

  const canEditUser = (targetUser: UserType) => {
    if (!currentUser) return false;
    if (currentUser.role === "owner") return true;
    if (currentUser.role === "admin") {
      return targetUser.role === "student";
    }
    return false;
  };

  const handleEditUser = async () => {
    if (!editModal.user) return;
    try {
      await userService.update(editModal.user.uid, {
        displayName: editModal.name,
        studentCode: editModal.code,
        permissions: editModal.permissions,
      });
      toast.success(language === "ar" ? "تم تحديث البيانات" : "User updated");
      setEditModal({ isOpen: false, user: null, name: "", code: "", permissions: [] });
    } catch {
      toast.error(language === "ar" ? "فشل التحديث" : "Update failed");
    }
  };

  useEffect(() => {
    const unsubscribe = userService.subscribeToAll(limitCount, (allUsers) => {
      allUsers.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setUsers(allUsers);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [limitCount]);

  const handleToggleRole = (userId: string, currentRole: string, userEmail: string) => {
    const isOwnerEmail = userEmail === process.env.NEXT_PUBLIC_OWNER_EMAIL;
    let newRole: string;
    if (isOwnerEmail) {
      if (currentRole === "student") newRole = "admin";
      else if (currentRole === "admin") newRole = "owner";
      else newRole = "student";
    } else {
      newRole = currentRole === "admin" ? "student" : "admin";
    }

    setConfirmModal({
      isOpen: true,
      title: language === "ar" ? "تغيير الدور" : "Change Role",
      message:
        language === "ar"
          ? `هل أنت متأكد من تغيير دور المستخدم إلى ${
              newRole === "owner" ? "مالك" : newRole === "admin" ? "مسؤول" : "طالب"
            }؟`
          : `Are you sure you want to change user role to ${newRole}?`,
      action: async () => {
        try {
          if (newRole === "admin") {
            await userService.promoteToAdmin(userId, userEmail);
          } else {
            await userService.update(userId, {
              role: newRole as "student" | "admin" | "owner",
              permissions: newRole === "student" ? [] : undefined,
            });
          }
          toast.success(language === "ar" ? "تم تحديث الدور" : "Role updated");
        } catch (error) {
          console.error("Role update error:", error);
          toast.error(language === "ar" ? "فشل التحديث" : "Update failed");
        }
      },
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentCode?.includes(searchTerm)
  );

  const toggleUserSelection = (uid: string) => {
    if (uid === currentUser?.uid) return;
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(uid)) newSelected.delete(uid);
    else newSelected.add(uid);
    setSelectedUsers(newSelected);
  };

  const handleBulkRoleChange = async (newRole: "student" | "admin" | "owner") => {
    const batchPromises = Array.from(selectedUsers).map((uid) =>
      userService.update(uid, {
        role: newRole,
        permissions: newRole === "student" ? [] : undefined,
      })
    );

    try {
      await Promise.all(batchPromises);
      toast.success(
        language === "ar"
          ? `تم تحديث ${selectedUsers.size} مستخدم`
          : `Updated ${selectedUsers.size} users`
      );
      setSelectedUsers(new Set());
    } catch (error) {
      console.error(error);
      toast.error(language === "ar" ? "فشل التحديث الجماعي" : "Bulk update failed");
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Role", "Student Code"];
    const rows = filteredUsers
      .filter((u) => selectedUsers.has(u.uid))
      .map((u) => [u.uid, u.displayName, u.email, u.role, u.studentCode || ""]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="p-4 lg:p-10 w-full min-h-0 flex flex-col overflow-x-hidden">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-6 shrink-0">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-primary to-purple-600 flex items-center gap-3">
            <Users className="text-primary" />
            {language === "ar" ? "المستخدمين" : "Users"}
          </h1>

          {/* Search - Full width on mobile */}
          <div className="relative flex-1 md:min-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 rtl:right-3 rtl:left-auto pointer-events-none z-10" />
            <input
              type="text"
              placeholder={language === "ar" ? "بحث عن مستخدم..." : "Search users..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 rtl:pr-10 rounded-2xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none text-sm shadow-sm placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* User List - Mobile: Cards, Desktop: Standard Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
          {/* Table Header - Desktop Only */}
          <div className="hidden lg:grid grid-cols-[3fr_1.5fr_1.5fr_2fr] bg-muted/50 border-b border-border font-semibold text-muted-foreground text-sm sticky top-0 z-10 backdrop-blur-md">
            <div className="px-6 py-4 flex items-center gap-2">
              <AnimatedCheckbox
                checked={
                  selectedUsers.size ===
                    filteredUsers.filter((u) => u.uid !== currentUser?.uid).length &&
                  filteredUsers.filter((u) => u.uid !== currentUser?.uid).length > 0
                }
                onChange={() => {
                  const selectableUsers = filteredUsers.filter((u) => u.uid !== currentUser?.uid);
                  if (selectedUsers.size === selectableUsers.length) {
                    setSelectedUsers(new Set());
                  } else {
                    setSelectedUsers(new Set(selectableUsers.map((u) => u.uid)));
                  }
                }}
                className="mr-2"
                aria-label={language === "ar" ? "تحديد جميع المستخدمين" : "Select all users"}
              />
              {language === "ar" ? "المستخدم" : "User"}
            </div>
            <div className="px-6 py-4">{language === "ar" ? "كود الطالب" : "Student Code"}</div>
            <div className="px-6 py-4">{language === "ar" ? "الدور" : "Role"}</div>
            <div className="px-6 py-4">{language === "ar" ? "الإجراءات" : "Actions"}</div>
          </div>

          {/* List Content */}
          <div className="w-full max-h-[365px] overflow-y-auto bg-background/30 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center p-12 text-muted-foreground">
                {language === "ar" ? "لا يوجد مستخدمين" : "No users found"}
              </div>
            ) : (
              <>
                {/* Mobile Cards View */}
                <StaggerChildren className="lg:hidden divide-y divide-border">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUsers.has(user.uid);
                    return (
                      <ScaleIn
                        key={user.uid}
                        className={cn("p-4 transition-colors", isSelected ? "bg-primary/5" : "")}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {user.uid !== currentUser?.uid ? (
                            <AnimatedCheckbox
                              checked={isSelected}
                              onChange={() => toggleUserSelection(user.uid)}
                              className="mr-2"
                              aria-label={
                                language === "ar"
                                  ? `تحديد المستخدم ${user.displayName || ""}`
                                  : `Select user ${user.displayName || "User"}`
                              }
                            />
                          ) : (
                            <div className="w-5 h-5 shrink-0" />
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
                            className="rounded-full shrink-0 w-11 h-11 object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-foreground truncate">
                              {user.displayName}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {user.email}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0",
                              user.role === "owner"
                                ? "bg-amber-100 text-amber-800"
                                : user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-green-100 text-green-800"
                            )}
                          >
                            {user.role}
                          </span>
                        </div>
                        {/* Student Code Row */}
                        <div className="flex items-center justify-between mb-3 px-8">
                          <span className="text-sm text-muted-foreground">
                            {language === "ar" ? "كود الطالب:" : "Student Code:"}
                          </span>
                          <span className="font-mono text-sm font-medium">
                            {user.studentCode || (
                              <span className="text-muted-foreground italic">
                                {language === "ar" ? "غير محدد" : "Not set"}
                              </span>
                            )}
                          </span>
                        </div>
                        {/* Actions Row */}
                        {user.role !== "owner" && (
                          <div className="px-8 space-y-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => handleToggleRole(user.uid, user.role, user.email)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all active:scale-95"
                              >
                                {language === "ar" ? "تبديل الدور" : "Switch Role"}
                              </button>
                              {currentUser?.role === "owner" && (
                                <button
                                  onClick={() => setViewModal({ isOpen: true, user })}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-95"
                                >
                                  <User size={14} />
                                  {language === "ar" ? "البيانات" : "Data"}
                                </button>
                              )}
                              {canEditUser(user) && (
                                <button
                                  onClick={() =>
                                    setEditModal({
                                      isOpen: true,
                                      user: user,
                                      name: user.displayName || "",
                                      code: user.studentCode || "",
                                      permissions: user.permissions || [],
                                    })
                                  }
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all active:scale-95"
                                >
                                  <Pencil size={14} />
                                  {language === "ar" ? "تعديل" : "Edit"}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </ScaleIn>
                    );
                  })}
                </StaggerChildren>

                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <div className="min-h-[200px]">
                    {filteredUsers.map((user) => (
                      <TableRow
                        key={user.uid}
                        user={user}
                        isSelected={selectedUsers.has(user.uid)}
                        currentUser={currentUser}
                        language={language}
                        toggleUserSelection={toggleUserSelection}
                        handleToggleRole={handleToggleRole}
                        setViewModal={setViewModal}
                        setEditModal={setEditModal}
                        canEditUser={canEditUser}
                        imageError={imageError}
                        setImageError={setImageError}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Load More Footer */}
          {users.length >= limitCount && !loading && (
            <div className="p-2 border-t border-border flex justify-center bg-muted/10">
              <button
                onClick={() => {
                  setLoading(true);
                  setLimitCount((prev) => prev + 50);
                }}
                className="text-xs text-primary hover:underline font-medium"
              >
                {language === "ar" ? "تحميل المزيد من قاعدة البيانات" : "Load more from database"}
              </button>
            </div>
          )}
        </div>

        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmModal.action}
          title={confirmModal.title}
          message={confirmModal.message}
        />

        {/* User Data Modal */}
        <AnimatePresence>
          {viewModal.isOpen && viewModal.user && (
            <UserDetailModal
              user={viewModal.user}
              language={language}
              onClose={() => setViewModal({ isOpen: false, user: null })}
            />
          )}
        </AnimatePresence>

        {/* Edit User Modal */}
        <AnimatePresence>
          {editModal.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-card rounded-3xl p-6 w-full max-w-md shadow-2xl border border-border"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Pencil className="text-primary w-5 h-5" />
                    {language === "ar" ? "تعديل بيانات المستخدم" : "Edit User"}
                  </h3>
                  <button
                    onClick={() =>
                      setEditModal({
                        isOpen: false,
                        user: null,
                        name: "",
                        code: "",
                        permissions: [],
                      })
                    }
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium mb-1 block">
                      {language === "ar" ? "الاسم" : "Name"}
                    </label>
                    <input
                      type="text"
                      value={editModal.name}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full p-3 rounded-xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none shadow-sm placeholder:text-muted-foreground/50"
                      placeholder={language === "ar" ? "اسم المستخدم" : "User name"}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium mb-1 block">
                      {language === "ar" ? "كود الطالب" : "Student Code"}
                    </label>
                    <input
                      type="text"
                      value={editModal.code}
                      onChange={(e) => {
                        if (e.target.value.length <= 6) {
                          setEditModal((prev) => ({
                            ...prev,
                            code: e.target.value,
                          }));
                        }
                      }}
                      className="w-full p-3 rounded-xl bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 outline-none shadow-sm placeholder:text-muted-foreground/50 font-mono tracking-widest"
                      placeholder="123456"
                      maxLength={6}
                    />
                  </div>

                  {/* Permissions for Admin */}
                  {editModal.user?.role === "admin" && (
                    <div className="space-y-3 pt-2">
                      <p className="text-sm font-bold text-foreground">
                        {language === "ar" ? "الصلاحيات" : "Admin Permissions"}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {PERMISSIONS.map((def) => {
                          const isChecked = editModal.permissions.includes(def.key);
                          return (
                            <label
                              key={def.key}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer",
                                isChecked
                                  ? "bg-primary/10 border-primary/30 text-primary"
                                  : "bg-muted/30 border-transparent hover:bg-muted/50"
                              )}
                            >
                              <div className="relative flex items-center">
                                <input
                                  type="checkbox"
                                  className="peer sr-only"
                                  checked={isChecked}
                                  onChange={() => {
                                    const newPerms = isChecked
                                      ? editModal.permissions.filter((p) => p !== def.key)
                                      : [...editModal.permissions, def.key];
                                    setEditModal((prev) => ({
                                      ...prev,
                                      permissions: newPerms,
                                    }));
                                  }}
                                />
                                <div className="w-4 h-4 rounded border border-input peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
                                  {isChecked && <div className="w-2 h-2 bg-white rounded-sm" />}
                                </div>
                              </div>
                              <span className="text-xs font-medium">
                                {language === "ar" ? def.labelAr : def.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() =>
                        setEditModal({
                          isOpen: false,
                          user: null,
                          name: "",
                          code: "",
                          permissions: [],
                        })
                      }
                      className="flex-1 py-3 rounded-xl border border-border hover:bg-muted transition-colors font-medium"
                    >
                      {language === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                    <button
                      onClick={handleEditUser}
                      className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
                    >
                      {language === "ar" ? "حفظ" : "Save"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedUsers={selectedUsers}
        users={filteredUsers}
        onClearSelection={() => setSelectedUsers(new Set())}
        onBulkRoleChange={handleBulkRoleChange}
        onExportCSV={handleExportCSV}
        language={language}
      />
    </>
  );
}
