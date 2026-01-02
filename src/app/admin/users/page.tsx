"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useLanguage, useAuth } from "@/contexts";
import { AppShell } from "@/components/layout/AppShell";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Users, Shield, User, Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { User as UserType } from "@/types";
import Image from "next/image";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
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

  const { language, t } = useLanguage();
  const { isOwner } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Edit user modal state
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

  // Check if current user can edit target user
  const canEditUser = (targetUser: UserType): boolean => {
    if (isOwner) return true; // Owner can edit anyone
    // Admins can only edit students
    return targetUser.role === "student";
  };

  const handleEditUser = async () => {
    if (!editModal.user) return;

    try {
      await updateDoc(doc(db, "users", editModal.user.uid), {
        displayName: editModal.name,
        studentCode: editModal.code,
      });
      toast.success(language === "ar" ? "تم تحديث البيانات" : "User updated");
      setEditModal({ isOpen: false, user: null, name: "", code: "" });
    } catch {
      toast.error(language === "ar" ? "فشل التحديث" : "Update failed");
    }
  };

  // Permissions configuration
  const PERMISSIONS = [
    {
      key: "delete_chats",
      label: language === "ar" ? "حذف المحادثات" : "Delete Chats",
    },
    {
      key: "send_notifications",
      label: language === "ar" ? "إرسال إشعارات" : "Send Notifications",
    },
    {
      key: "manage_subjects",
      label: language === "ar" ? "إدارة المواد" : "Manage Subjects",
    },
    {
      key: "manage_resources",
      label: language === "ar" ? "إدارة المصادر" : "Manage Resources",
    },
  ];

  useEffect(() => {
    // Don't orderBy createdAt server-side - some users may not have it
    // Fetch ALL users then sort client-side
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allUsers = snapshot.docs.map(
        (d) => ({ ...d.data(), uid: d.id } as UserType)
      );
      // Sort by createdAt descending (newest first), handle missing dates
      allUsers.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setUsers(allUsers);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleRole = (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "student" : "admin";
    setConfirmModal({
      isOpen: true,
      title: language === "ar" ? "تغيير الدور" : "Change Role",
      message:
        language === "ar"
          ? `هل أنت متأكد من تغيير دور المستخدم إلى ${
              newRole === "admin" ? "مسؤول" : "طالب"
            }؟`
          : `Are you sure you want to change user role to ${newRole}?`,
      action: async () => {
        try {
          await updateDoc(doc(db, "users", userId), {
            role: newRole,
            permissions: newRole === "student" ? [] : undefined,
          });
          toast.success(language === "ar" ? "تم تحديث الدور" : "Role updated");
        } catch {
          toast.error(language === "ar" ? "فشل التحديث" : "Update failed");
        }
      },
    });
  };

  const togglePermission = async (
    userId: string,
    currentPermissions: string[] = [],
    permission: string
  ) => {
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter((p) => p !== permission)
      : [...currentPermissions, permission];

    try {
      await updateDoc(doc(db, "users", userId), {
        permissions: newPermissions,
      });
      toast.success(
        language === "ar" ? "تم تحديث الصلاحيات" : "Permissions updated"
      );
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

  return (
    <AppShell>
      <div className="p-6 lg:p-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Users className="text-primary" />
            {t("admin.users")}
          </h1>

          <div className="flex gap-4 w-full md:w-auto items-center">
            {/* Invite Admin */}
            {/* Invite Admin Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const emailInput = form.elements.namedItem(
                  "invite-email"
                ) as HTMLInputElement;
                const email = emailInput.value;

                if (!email || !email.includes("@"))
                  return toast.error("Invalid email");

                try {
                  const { setDoc, doc, serverTimestamp } = await import(
                    "firebase/firestore"
                  );
                  await setDoc(doc(db, "whitelisted_admins", email), {
                    email,
                    invitedBy: "admin",
                    createdAt: serverTimestamp(),
                  });
                  toast.success("Admin invited successfully");
                  form.reset();
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to invite");
                }
              }}
              className="flex gap-2"
            >
              <input
                name="invite-email"
                placeholder={
                  language === "ar"
                    ? "إضافة بريد إلكتروني كأدمن..."
                    : "Invite admin by email..."
                }
                className="px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm w-64"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                title={language === "ar" ? "دعوة" : "Invite"}
              >
                +
              </button>
            </form>

            <input
              placeholder={
                language === "ar" ? "بحث عن مستخدم..." : "Search users..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 md:w-64 px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">
                    {language === "ar" ? "المستخدم" : "User"}
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">
                    {language === "ar" ? "كود الطالب" : "Student Code"}
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">
                    {language === "ar" ? "الدور" : "Role"}
                  </th>
                  <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">
                    {language === "ar" ? "الإجراءات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center">
                      <Loader2
                        className="animate-spin mx-auto text-primary"
                        size={30}
                      />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-10 text-center text-muted-foreground"
                    >
                      {language === "ar"
                        ? "لا يوجد مستخدمين"
                        : "No users found"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.uid}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={
                              user.photoURL ||
                              `https://ui-avatars.com/api/?name=${user.displayName}&background=6366f1&color=fff`
                            }
                            alt={user.displayName}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div>
                            <div className="font-bold text-foreground">
                              {user.displayName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm">
                        {user.studentCode || (
                          <span className="text-muted-foreground italic">
                            {language === "ar" ? "غير محدد" : "Not set"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
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
                      </td>
                      <td className="px-6 py-4">
                        {user.role !== "owner" && (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  handleToggleRole(user.uid, user.role)
                                }
                                className="text-xs text-primary hover:text-primary/80 font-medium"
                              >
                                {language === "ar"
                                  ? "تبديل الدور"
                                  : "Switch Role"}
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
                                  <label
                                    key={def.key}
                                    className="flex items-center gap-2 cursor-pointer"
                                  >
                                    <input
                                      type="checkbox"
                                      className="rounded border-input text-primary focus:ring-primary w-3 h-3"
                                      checked={user.permissions?.includes(
                                        def.key
                                      )}
                                      onChange={() =>
                                        togglePermission(
                                          user.uid,
                                          user.permissions,
                                          def.key
                                        )
                                      }
                                    />
                                    <span className="text-xs">{def.label}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() =>
            setConfirmModal((prev) => ({ ...prev, isOpen: false }))
          }
          onConfirm={confirmModal.action}
          title={confirmModal.title}
          message={confirmModal.message}
        />

        {/* Edit User Modal */}
        {editModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
                    placeholder={
                      language === "ar" ? "اسم المستخدم" : "User name"
                    }
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
    </AppShell>
  );
}
