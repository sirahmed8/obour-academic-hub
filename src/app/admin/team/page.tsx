"use client";

import { useState, useEffect, useMemo } from "react";

import { useAuth, useLanguage } from "@/contexts";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { apiFetch } from "@/lib/api-client";
import { Trash2, Settings, Mail, UserPlus, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { User, UserPermission } from "@/types";
import { FadeIn, ScaleIn, StaggerChildren } from "@/components/ui/Animations";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { EditUserModal } from "../users/_components/EditUserModal";
import { EditUserModalState } from "../users/types";
import { userService } from "@/services/user.service";

interface TeamMember {
  email: string;
  role: string;
  addedBy?: string;
  addedAt?: User["createdAt"];
  isWhitelisted?: boolean;
  isActiveUser?: boolean;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  fullUser?: User;
}

// Hardcoded owner email - MUST always appear in team
const OWNER_EMAIL = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "a7medorabe7@gmail.com")
  .trim()
  .toLowerCase();

export default function AdminTeamPage() {
  const { user, isAdmin, isOwner } = useAuth();
  const { language } = useLanguage();
  // --- Manage State ---
  const [whitelistedAdmins, setWhitelistedAdmins] = useState<
    Array<{ email: string; addedBy?: string; addedAt?: User["createdAt"] }>
  >([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "moderator">("admin");
  const [newPermissions, setNewPermissions] = useState<UserPermission[]>([]);
  const [adding, setAdding] = useState(false);
  const [editModal, setEditModal] = useState<EditUserModalState>({
    isOpen: false,
    user: null,
    name: "",
    code: "",
    permissions: [],
  });

  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribers: (() => void)[] = [];

    if (!db) return;

    // Listen to whitelisted admins
    const whitelistUnsub = onSnapshot(collection(db, "whitelisted_admins"), (snapshot) => {
      setWhitelistedAdmins(
        snapshot.docs.map((d) => ({
          email: d.id,
          addedBy: d.data().addedBy,
          addedAt: d.data().addedAt,
        }))
      );
      setLoading(false);
    });
    unsubscribers.push(whitelistUnsub);

    // Listen to actual admin/owner users
    const usersUnsub = onSnapshot(
      query(collection(db, "users"), where("role", "in", ["admin", "owner", "moderator"])),
      (snapshot) => {
        setAdminUsers(
          snapshot.docs.map((d) => {
            const data = d.data() as User;
            return {
              ...data,
              uid: d.id,
            };
          })
        );
      }
    );
    unsubscribers.push(usersUnsub);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [isAdmin]);

  // Compute team members dynamically
  const computedTeamMembers = useMemo(() => {
    const map = new Map<string, TeamMember>();

    // ALWAYS add hardcoded owner first
    map.set(OWNER_EMAIL, {
      email: OWNER_EMAIL,
      role: "owner",
      isActiveUser: true,
      displayName: "Owner",
    });

    whitelistedAdmins.forEach((wa) => {
      if (wa.email !== OWNER_EMAIL) {
        map.set(wa.email, {
          email: wa.email,
          role: "admin",
          addedBy: wa.addedBy,
          addedAt: wa.addedAt,
          isWhitelisted: true,
        });
      }
    });

    adminUsers.forEach((au) => {
      const email = au.email;
      const existing = map.get(email);

      if (email === OWNER_EMAIL) {
        map.set(email, {
          email,
          role: "owner",
          addedBy: existing?.addedBy,
          addedAt: existing?.addedAt || au.createdAt,
          isWhitelisted: existing?.isWhitelisted,
          isActiveUser: true,
          displayName: au.displayName,
          photoURL: au.photoURL,
          fullUser: au as User,
        });
      } else {
        const effectiveRole = au.role === "owner" ? "admin" : au.role;
        map.set(email, {
          email,
          role: effectiveRole,
          addedBy: existing?.addedBy,
          addedAt: existing?.addedAt || au.createdAt,
          isWhitelisted: existing?.isWhitelisted,
          isActiveUser: true,
          displayName: au.displayName,
          photoURL: au.photoURL,
          fullUser: au as User,
        });
      }
    });

    const members = Array.from(map.values());
    members.sort((a, b) => {
      if (a.role === "owner" && b.role !== "owner") return -1;
      if (a.role !== "owner" && b.role === "owner") return 1;
      return a.email.localeCompare(b.email);
    });
    return members;
  }, [whitelistedAdmins, adminUsers]);

  const gridMembers = computedTeamMembers.filter((m) => m.isActiveUser);

  const handleAddAdmin = async () => {
    if (!newEmail.trim() || !user) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast.error(language === "ar" ? "بريد إلكتروني غير صالح" : "Invalid email address");
      return;
    }

    setAdding(true);
    try {
      await apiFetch(`/api/admin/whitelist/${encodeURIComponent(newEmail.trim().toLowerCase())}`, {
        method: "PUT",
        body: JSON.stringify({
          role: newRole,
          permissions: newRole === "admin" ? newPermissions : [],
        }),
      });
      toast.success(
        language === "ar" ? `تمت إضافة ${newEmail} بنجاح` : `Added ${newEmail} successfully`
      );
      setNewEmail("");
      setNewPermissions([]);
    } catch (err) {
      console.error("Error adding member:", err);
      toast.error(language === "ar" ? "فشل الإضافة" : "Failed to add member");
    }
    setAdding(false);
  };

  const [deleteMember, setDeleteMember] = useState<TeamMember | null>(null);

  const handleRemoveAdmin = (member: TeamMember) => {
    setDeleteMember(member);
  };

  const confirmRemoveAdmin = async () => {
    if (!deleteMember) return;

    try {
      const email = deleteMember.email;
      const uid = deleteMember.fullUser?.uid;

      const queryParams = uid ? `?uid=${encodeURIComponent(uid)}` : "";
      await apiFetch(
        `/api/admin/whitelist/${encodeURIComponent(email.toLowerCase())}${queryParams}`,
        {
          method: "DELETE",
        }
      );

      toast.success(language === "ar" ? "تمت الإزالة" : "Removed successfully");
    } catch (err) {
      console.error("Error removing admin:", err);
      toast.error(language === "ar" ? "فشلت الإزالة" : "Failed to remove");
    } finally {
      setDeleteMember(null);
    }
  };

  const handleEditUser = async () => {
    if (!editModal.user) return;
    try {
      await userService.update(editModal.user.uid, {
        displayName: editModal.name,
        studentCode: editModal.code,
        permissions: editModal.permissions,
      });
      toast.success(language === "ar" ? "تم تحديث الصلاحيات" : "Permissions updated");
      setEditModal((prev) => ({ ...prev, isOpen: false }));
    } catch {
      toast.error(language === "ar" ? "فشل التحديث" : "Update failed");
    }
  };

  return (
    <>
      {!isAdmin ? (
        <div className="flex flex-col items-center justify-center p-20 text-center">
          <Shield className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <h2 className="text-xl font-bold">Access Denied</h2>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center p-20">
          <Loader2 className="animate-spin w-8 h-8 text-primary" />
        </div>
      ) : (
        <div className="w-full p-4 md:p-8 space-y-8 page-transition">
          <FadeIn className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                {language === "ar" ? "إدارة الفريق" : "Team Management"}
              </h1>
            </div>
          </FadeIn>

          {isOwner && (
            <FadeIn
              delay={0.1}
              className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-8"
            >
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-500" />
                {language === "ar" ? "إضافة مسؤول أو مشرف جديد" : "Add New Admin or Moderator"}
              </h2>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
                      placeholder={language === "ar" ? "البريد الإلكتروني..." : "Enter email..."}
                      className="w-full bg-white/5 dark:bg-white/2 backdrop-blur-xl border border-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/50 shadow-sm"
                    />
                  </div>
                  <div className="w-[160px] flex-shrink-0">
                    <CustomSelect
                      value={newRole}
                      onChange={(val) => setNewRole(val as "admin" | "moderator")}
                      options={[
                        { value: "admin", label: language === "ar" ? "مسؤول" : "Admin" },
                        { value: "moderator", label: language === "ar" ? "مشرف" : "Moderator" },
                      ]}
                    />
                  </div>
                  <button
                    onClick={handleAddAdmin}
                    disabled={!newEmail.trim() || adding}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px] shadow-lg shadow-primary/20"
                  >
                    {adding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                    {language === "ar" ? "إضافة" : "Add"}
                  </button>
                </div>
                {newRole === "admin" && (
                  <div className="flex flex-wrap gap-3 mt-2">
                    {[
                      {
                        id: "manage_subjects",
                        label: language === "ar" ? "إدارة المواد" : "Manage Subjects",
                      },
                      {
                        id: "manage_resources",
                        label: language === "ar" ? "إدارة الموارد" : "Manage Resources",
                      },
                      {
                        id: "send_notifications",
                        label: language === "ar" ? "إرسال الإشعارات" : "Send Notifications",
                      },
                      {
                        id: "manage_announcements",
                        label: language === "ar" ? "إدارة الإعلانات" : "Manage Announcements",
                      },
                    ].map((perm) => (
                      <div
                        key={perm.id}
                        onClick={() => {
                          const isChecked = newPermissions.includes(perm.id as UserPermission);
                          if (!isChecked) {
                            setNewPermissions([...newPermissions, perm.id as UserPermission]);
                          } else {
                            setNewPermissions(newPermissions.filter((p) => p !== perm.id));
                          }
                        }}
                        className="flex items-center gap-2.5 cursor-pointer bg-muted/30 px-3.5 py-2.5 rounded-xl hover:bg-muted/50 transition-all active:scale-[0.99] border border-border/40 select-none"
                      >
                        <AnimatedCheckbox
                          checked={newPermissions.includes(perm.id as UserPermission)}
                          onChange={() => {}}
                        />
                        <span className="text-sm font-medium text-foreground">{perm.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>
          )}

          <div className="space-y-8">
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-muted/30 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <div className="col-span-6">{language === "ar" ? "المستخدم" : "User"}</div>
                <div className="col-span-4">{language === "ar" ? "الدور" : "Role"}</div>
                <div className="col-span-2 text-right">
                  {language === "ar" ? "الإجراءات" : "Actions"}
                </div>
              </div>
              <div className="divide-y divide-border">
                <StaggerChildren className="contents">
                  <AnimatePresence mode="popLayout">
                    {gridMembers.map((member) => (
                      <ScaleIn
                        key={member.email}
                        layout
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/50 transition-colors group"
                      >
                        <div className="col-span-6 flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-border bg-primary/10 flex items-center justify-center">
                            {member.photoURL ? (
                              <Image
                                src={member.photoURL}
                                alt={member.displayName || "User"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-primary font-bold text-sm">
                                {member.displayName?.charAt(0) ||
                                  member.email.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-foreground text-sm">
                              {member.displayName || member.email}
                            </div>
                            <div className="text-xs text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                        <div className="col-span-4">
                          <span
                            className={cn(
                              "inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                              member.role === "owner"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : member.role === "moderator"
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                                  : "bg-primary/10 text-primary"
                            )}
                          >
                            {member.role === "owner"
                              ? language === "ar"
                                ? "المالك"
                                : "Owner"
                              : member.role === "moderator"
                                ? language === "ar"
                                  ? "مشرف"
                                  : "Moderator"
                                : language === "ar"
                                  ? "مسؤول"
                                  : "Admin"}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-2 mt-2 md:mt-0">
                          {isOwner && member.email !== OWNER_EMAIL && member.fullUser && (
                            <button
                              onClick={() =>
                                setEditModal({
                                  isOpen: true,
                                  user: member.fullUser!,
                                  name: member.fullUser!.displayName || "",
                                  code: member.fullUser!.studentCode || "",
                                  permissions: member.fullUser!.permissions || [],
                                })
                              }
                              className="p-2 rounded-xl text-muted-foreground bg-secondary/50 hover:bg-secondary hover:text-foreground transition-all"
                              title={language === "ar" ? "تعديل الصلاحيات" : "Edit Permissions"}
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          )}
                          {isOwner && member.email !== OWNER_EMAIL && (
                            <button
                              onClick={() => handleRemoveAdmin(member)}
                              className="p-2 bg-destructive/10 text-destructive rounded-xl transition-all hover:bg-destructive hover:text-white"
                              title={language === "ar" ? "إزالة" : "Remove"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </ScaleIn>
                    ))}
                  </AnimatePresence>
                </StaggerChildren>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={!!deleteMember}
        onClose={() => setDeleteMember(null)}
        onConfirm={confirmRemoveAdmin}
        title={language === "ar" ? "إزالة المسؤول" : "Remove Admin"}
        message={
          language === "ar"
            ? `هل أنت متأكد من إزالة ${deleteMember?.email || ""} من قائمة المسؤولين؟`
            : `Are you sure you want to remove ${deleteMember?.email || ""} from the admin whitelist?`
        }
        confirmText={language === "ar" ? "إزالة" : "Remove"}
        cancelText={language === "ar" ? "إلغاء" : "Cancel"}
        type="danger"
      />
      <EditUserModal
        editModal={editModal}
        language={language}
        onClose={() => setEditModal((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleEditUser}
        setEditModal={setEditModal}
      />
    </>
  );
}
