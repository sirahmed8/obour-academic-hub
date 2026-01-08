"use client";

import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useLanguage, useAuth } from "@/contexts";
import { User as UserType, UserPermission } from "@/types";
import { userService } from "@/services/user.service";
import { authService } from "@/services/auth.service";
import { Loader2, Shield, User, Pencil, X, Users } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";

import { BulkActionsBar } from "@/components/admin/BulkActionsBar";
import { UserDetailModal } from "@/components/admin/UserDetailModal";
import { FixedSizeList } from "react-window";

// Define permissions
const PERMISSIONS: { key: UserPermission; label: string }[] = [
  { key: "manage_users", label: "Manage Users" },
  { key: "manage_subjects", label: "Manage Subjects" },
  { key: "manage_resources", label: "Manage Resources" },
  { key: "send_notifications", label: "Send Notifications" },
  { key: "delete_chats", label: "Delete Chats" },
];

export default function AdminUsersPage() {
  const { language } = useLanguage();

  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [limitCount, setLimitCount] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Custom Resize Logic Replaces AutoSizer
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const listContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = listContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

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
  }>({
    isOpen: false,
    user: null,
    name: "",
    code: "",
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

  const handleEditUser = async () => {
    if (!editModal.user) return;
    try {
      await userService.update(editModal.user.uid, {
        displayName: editModal.name,
        studentCode: editModal.code,
      });
      toast.success(language === "ar" ? "تم تحديث البيانات" : "User updated");
      setEditModal({ isOpen: false, user: null, name: "", code: "" });
    } catch {
      toast.error(language === "ar" ? "فشل التحديث" : "Update failed");
    }
  };

  useEffect(() => {
    const unsubscribe = userService.subscribeToAll(limitCount, (allUsers) => {
      // Sort client side as backup if index is missing, though Firestore usually handles it if query worked
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
    // Special handling for owner email - allow full cycle
    const isOwnerEmail = userEmail === process.env.NEXT_PUBLIC_OWNER_EMAIL;

    let newRole: string;
    if (isOwnerEmail) {
      // Owner can cycle: student → admin → owner → student
      if (currentRole === "student") newRole = "admin";
      else if (currentRole === "admin") newRole = "owner";
      else newRole = "student";
    } else {
      // Regular users: only toggle between admin and student
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
          await userService.update(userId, {
            role: newRole as "student" | "admin" | "owner",
            permissions: newRole === "student" ? [] : undefined,
          });
          toast.success(language === "ar" ? "تم تحديث الدور" : "Role updated");
        } catch (error) {
          console.error("Role update error:", error);
          toast.error(language === "ar" ? "فشل التحديث" : "Update failed");
        }
      },
    });
  };

  const togglePermission = async (
    userId: string,
    currentPermissions: UserPermission[] = [],
    permission: UserPermission
  ) => {
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter((p) => p !== permission)
      : [...currentPermissions, permission];

    try {
      await userService.update(userId, {
        permissions: newPermissions,
      });
      toast.success(language === "ar" ? "تم تحديث الصلاحيات" : "Permissions updated");
    } catch {
      toast.error(language === "ar" ? "فشل التحديث" : "Update failed");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.studentCode?.includes(searchTerm)
  );

  // Row selection handler
  // Row selection handler - Prevent selecting yourself
  const toggleUserSelection = (uid: string) => {
    // Prevent selecting yourself (owner protection)
    if (uid === currentUser?.uid) return;

    const newSelected = new Set(selectedUsers);
    if (newSelected.has(uid)) newSelected.delete(uid);
    else newSelected.add(uid);
    setSelectedUsers(newSelected);
  };

  // Virtualizer Row Component
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const user = filteredUsers[index];
    if (!user) return null;

    const isSelected = selectedUsers.has(user.uid);

    return (
      <div
        style={style}
        className={cn(
          "grid grid-cols-[3fr_1.5fr_1.5fr_2fr] border-b border-border transition-colors items-center",
          isSelected ? "bg-primary/5" : "hover:bg-muted/30"
        )}
      >
        {/* User Column */}
        <div className="px-6 py-4 flex items-center gap-3 overflow-hidden">
          {/* Hide checkbox for current user (owner can't select themselves) */}
          {user.uid !== currentUser?.uid ? (
            <AnimatedCheckbox
              checked={isSelected}
              onChange={() => toggleUserSelection(user.uid)}
              className="mr-2"
            />
          ) : (
            <div className="w-4 h-4 mr-2" /> // Spacer for alignment
          )}
          <Image
            src={
              user.photoURL ||
              `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`
            }
            alt={user.displayName}
            width={40}
            height={40}
            className="rounded-full shrink-0"
          />
          <div className="truncate">
            <div className="font-bold text-foreground truncate">{user.displayName}</div>
            <div className="text-sm text-muted-foreground truncate">{user.email}</div>
          </div>
        </div>

        {/* Student Code Column */}
        <div className="px-6 py-4 font-mono text-sm truncate">
          {user.studentCode || (
            <span className="text-muted-foreground italic">
              {language === "ar" ? "غير محدد" : "Not set"}
            </span>
          )}
        </div>

        {/* Role Column */}
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

        {/* Actions Column */}
        <div className="px-6 py-4">
          {user.role !== "owner" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleRole(user.uid, user.role, user.email)}
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                  {language === "ar" ? "تبديل الدور" : "Switch Role"}
                </button>
                {/* User Data Button (Owner Only) */}
                {currentUser?.role === "owner" && (
                  <button
                    onClick={() => setViewModal({ isOpen: true, user })}
                    className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
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
                      })
                    }
                    className="text-xs text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                  >
                    <Pencil size={12} />
                    {language === "ar" ? "تعديل" : "Edit"}
                  </button>
                )}
              </div>

              {user.role === "admin" && (
                <div className="space-y-1 mt-2 border-t pt-2">
                  <p className="text-[10px] uppercase text-muted-foreground font-semibold">
                    Permissions
                  </p>
                  {PERMISSIONS.map((def) => (
                    <label key={def.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-input text-primary focus:ring-primary w-3 h-3"
                        checked={user.permissions?.includes(def.key)}
                        onChange={() => togglePermission(user.uid, user.permissions, def.key)}
                      />
                      <span className="text-xs">{def.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      <div className="p-4 lg:p-10 w-full h-[calc(100vh-100px)] flex flex-col overflow-x-hidden">
        {/* Header Section */}
        <div className="flex flex-col gap-4 mb-6 shrink-0">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Users className="text-primary" />
            {language === "ar" ? "المستخدمين" : "Users"}
          </h1>

          {/* Search - Full width on mobile */}
          <input
            placeholder={language === "ar" ? "بحث عن مستخدم..." : "Search users..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
          />

          {/* Invite Admin Form - Hidden on mobile, shown on desktop */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const emailInput = form.elements.namedItem("invite-email") as HTMLInputElement;
              const email = emailInput.value;

              if (!email || !email.includes("@")) return toast.error("Invalid email");

              try {
                await authService.addToWhitelist(email, "admin");
                toast.success("Admin invited successfully");
                form.reset();
              } catch (err) {
                console.error(err);
                toast.error("Failed to invite");
              }
            }}
            className="flex gap-2 flex-col sm:flex-row"
          >
            <input
              name="invite-email"
              placeholder={
                language === "ar" ? "إضافة بريد إلكتروني كأدمن..." : "Invite admin by email..."
              }
              className="px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm flex-1 md:w-64"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              title={language === "ar" ? "دعوة" : "Invite"}
            >
              +
            </button>
          </form>
        </div>

        {/* User List - Mobile: Cards, Desktop: Table */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden flex-1 flex flex-col min-h-[400px] overflow-x-hidden">
          {/* Table Header - Desktop Only */}
          <div className="hidden lg:grid grid-cols-[3fr_1.5fr_1.5fr_2fr] bg-muted/50 border-b border-border font-semibold text-muted-foreground text-sm">
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
                    // Select all EXCEPT current user
                    setSelectedUsers(new Set(selectableUsers.map((u) => u.uid)));
                  }
                }}
                className="mr-2"
              />
              {language === "ar" ? "المستخدم" : "User"}
            </div>
            <div className="px-6 py-4">{language === "ar" ? "كود الطالب" : "Student Code"}</div>
            <div className="px-6 py-4">{language === "ar" ? "الدور" : "Role"}</div>
            <div className="px-6 py-4">{language === "ar" ? "الإجراءات" : "Actions"}</div>
          </div>

          {/* List Content */}
          <div ref={listContainerRef} className="flex-1 w-full min-h-0 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full py-12">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground py-12">
                {language === "ar" ? "لا يوجد مستخدمين" : "No users found"}
              </div>
            ) : (
              <>
                {/* Mobile Cards View */}
                <div className="lg:hidden divide-y divide-border">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUsers.has(user.uid);
                    return (
                      <div
                        key={user.uid}
                        className={cn("p-4 transition-colors", isSelected ? "bg-primary/5" : "")}
                      >
                        {/* Top Row: Checkbox, Avatar, Name & Email */}
                        <div className="flex items-center gap-3 mb-3">
                          {user.uid !== currentUser?.uid ? (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleUserSelection(user.uid)}
                              className="rounded border-input text-primary w-5 h-5 shrink-0"
                            />
                          ) : (
                            <div className="w-5 h-5 shrink-0" />
                          )}
                          <Image
                            src={
                              user.photoURL ||
                              `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`
                            }
                            alt={user.displayName}
                            width={44}
                            height={44}
                            className="rounded-full shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-foreground truncate">
                              {user.displayName}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {user.email}
                            </div>
                          </div>
                          {/* Role Badge */}
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
                            {user.role === "admin" ? (
                              <Shield className="w-3 h-3 mr-1" />
                            ) : (
                              <User className="w-3 h-3 mr-1" />
                            )}
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
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleToggleRole(user.uid, user.role, user.email)}
                                className="text-sm text-primary hover:text-primary/80 font-medium"
                              >
                                {language === "ar" ? "تبديل الدور" : "Switch Role"}
                              </button>
                              {canEditUser(user) && (
                                <button
                                  onClick={() =>
                                    setEditModal({
                                      isOpen: true,
                                      user: user,
                                      name: user.displayName || "",
                                      code: user.studentCode || "",
                                    })
                                  }
                                  className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                                >
                                  <Pencil size={14} />
                                  {language === "ar" ? "تعديل" : "Edit"}
                                </button>
                              )}
                            </div>

                            {/* Permissions for Admin */}
                            {user.role === "admin" && (
                              <div className="space-y-2 border-t pt-3">
                                <p className="text-xs uppercase text-muted-foreground font-semibold">
                                  {language === "ar" ? "الصلاحيات" : "Permissions"}
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {PERMISSIONS.map((def) => (
                                    <label
                                      key={def.key}
                                      className="flex items-center gap-2 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                                        checked={user.permissions?.includes(def.key)}
                                        onChange={() =>
                                          togglePermission(user.uid, user.permissions, def.key)
                                        }
                                      />
                                      <span className="text-xs">{def.label}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <FixedSizeList
                    height={containerSize.height}
                    itemCount={filteredUsers.length}
                    itemSize={64}
                    width={containerSize.width}
                  >
                    {Row}
                  </FixedSizeList>
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
        {viewModal.isOpen && viewModal.user && (
          <UserDetailModal
            user={viewModal.user}
            language={language}
            onClose={() => setViewModal({ isOpen: false, user: null })}
          />
        )}

        {/* Edit User Modal */}
        {editModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">
                  {language === "ar" ? "تعديل بيانات المستخدم" : "Edit User"}
                </h3>
                <button
                  onClick={() =>
                    setEditModal({
                      isOpen: false,
                      user: null,
                      name: "",
                      code: "",
                    })
                  }
                  className="p-1 hover:bg-muted rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {language === "ar" ? "الاسم" : "Name"}
                  </label>
                  <input
                    value={editModal.name}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full p-3 rounded-xl border border-border bg-background"
                    placeholder={language === "ar" ? "اسم المستخدم" : "User name"}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {language === "ar" ? "كود الطالب" : "Student Code"}
                  </label>
                  <input
                    value={editModal.code}
                    onChange={(e) => {
                      if (e.target.value.length <= 6) {
                        setEditModal((prev) => ({
                          ...prev,
                          code: e.target.value,
                        }));
                      }
                    }}
                    className="w-full p-3 rounded-xl border border-border bg-background font-mono tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() =>
                      setEditModal({
                        isOpen: false,
                        user: null,
                        name: "",
                        code: "",
                      })
                    }
                    className="flex-1 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
                  >
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    onClick={handleEditUser}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                  >
                    {language === "ar" ? "حفظ" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
    </AppShell>
  );
}
