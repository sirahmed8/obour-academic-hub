"use client";

import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth, useLanguage } from "@/contexts";
import { auth } from "@/lib/firebase";
import { User, UserPermission } from "@/types";
import { userService } from "@/services/user.service";
import {
  ConfirmModalState,
  EditUserModalState,
  ViewUserModalState,
  ChangeRoleModalState,
  AlertModalState,
} from "./types";

function getDateMillis(value: User["createdAt"] | User["lastLogin"] | undefined) {
  if (!value) {
    return 0;
  }

  if (typeof value === "string") {
    return new Date(value).getTime();
  }

  if ("toDate" in value && typeof value.toDate === "function") {
    return value.toDate().getTime();
  }

  if ("seconds" in value) {
    return value.seconds * 1000;
  }

  return 0;
}

const EMPTY_CONFIRM_MODAL: ConfirmModalState = {
  isOpen: false,
  title: "",
  message: "",
  action: () => {},
};

const EMPTY_EDIT_MODAL: EditUserModalState = {
  isOpen: false,
  user: null,
  name: "",
  code: "",
  permissions: [],
};

const EMPTY_VIEW_MODAL: ViewUserModalState = {
  isOpen: false,
  user: null,
};

export interface AdminUsersController {
  canEditUser: (user: User) => boolean;
  closeEditModal: () => void;
  confirmModal: ConfirmModalState;
  currentUser: User | null;
  editModal: EditUserModalState;
  alertModal: AlertModalState;
  setAlertModal: Dispatch<SetStateAction<AlertModalState>>;
  handleSendAlert: () => Promise<void>;
  handleBanUser: (user: User) => void;
  handleKickUser: (user: User) => void;
  handleUnbanUser: (user: User) => void;
  handleDeleteUser: (user: User) => void;
  filteredUsers: User[];
  handleBulkRoleChange: (newRole: "student" | "admin" | "owner") => Promise<void>;
  handleEditUser: () => Promise<void>;
  handleToggleVipUser: (user: User) => Promise<void>;
  handleExportCSV: () => void;
  handleLoadMore: () => void;
  changeRoleModal: ChangeRoleModalState;
  setChangeRoleModal: Dispatch<SetStateAction<ChangeRoleModalState>>;
  handleChangeRoleConfirm: (role: "student" | "moderator" | "admin" | "owner") => Promise<void>;
  imageError: Record<string, boolean>;
  isAllSelectableSelected: boolean;
  language: string;
  limitCount: number;
  loading: boolean;
  searchTerm: string;
  selectedUsers: Set<string>;
  setConfirmModal: Dispatch<SetStateAction<ConfirmModalState>>;
  setEditModal: Dispatch<SetStateAction<EditUserModalState>>;
  setImageError: Dispatch<SetStateAction<Record<string, boolean>>>;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  setSelectedUsers: Dispatch<SetStateAction<Set<string>>>;
  setViewModal: Dispatch<SetStateAction<ViewUserModalState>>;
  showLoadMore: boolean;
  toggleUserSelection: (uid: string) => void;
  viewModal: ViewUserModalState;
}

export function useAdminUsers(): AdminUsersController {
  const { language } = useLanguage();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [limitCount, setLimitCount] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>(EMPTY_CONFIRM_MODAL);
  const [editModal, setEditModal] = useState<EditUserModalState>(EMPTY_EDIT_MODAL);
  const [viewModal, setViewModal] = useState<ViewUserModalState>(EMPTY_VIEW_MODAL);
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    user: null,
    title: "",
    message: "",
  });
  const [changeRoleModal, setChangeRoleModal] = useState<ChangeRoleModalState>({
    isOpen: false,
    user: null,
  });

  const canEditUser = useCallback(
    (targetUser: { role?: string; email?: string }) => {
      if (!currentUser) return false;

      const ownerEmail = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "a7medorabe7@gmail.com")
        .trim()
        .toLowerCase();
      const isOwner =
        currentUser.role === "owner" || currentUser.email.toLowerCase() === ownerEmail;

      if (isOwner) return true;

      // Admins can edit students and users with no role
      if (currentUser.role === "admin") {
        return !targetUser.role || targetUser.role === "student";
      }

      return false;
    },
    [currentUser]
  );

  const closeEditModal = () => {
    setEditModal(EMPTY_EDIT_MODAL);
  };

  const handleEditUser = async () => {
    if (!editModal.user) {
      return;
    }

    try {
      await userService.update(editModal.user.uid, {
        displayName: editModal.name,
        studentCode: editModal.code,
        permissions: editModal.permissions,
      });
      toast.success(language === "ar" ? "تم تحديث البيانات" : "User updated");
      closeEditModal();
    } catch {
      toast.error(language === "ar" ? "فشل التحديث" : "Update failed");
    }
  };

  const handleSendAlert = async () => {
    if (!alertModal.user || !alertModal.title || !alertModal.message) return;
    try {
      const idToken = await auth?.currentUser?.getIdToken();
      if (!idToken) throw new Error("No id token");

      const res = await fetch(`/api/admin/users/${alertModal.user.uid}/alert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          title: alertModal.title,
          message: alertModal.message,
        }),
      });
      if (!res.ok) throw new Error("Failed to send alert");
      toast.success(language === "ar" ? "تم إرسال التنبيه" : "Alert sent successfully");
      setAlertModal((prev) => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error(error);
      toast.error(language === "ar" ? "فشل إرسال التنبيه" : "Failed to send alert");
    }
  };

  const handleToggleVipUser = async (user: User) => {
    const nextVip = !user.isVip;
    try {
      await userService.update(user.uid, {
        isVip: nextVip,
        subscriptionTier: nextVip ? "vip" : "free",
        vipType: nextVip ? "gifted" : undefined,
        vipGrantedBy: nextVip
          ? currentUser?.displayName || currentUser?.email || "Owner/Admin"
          : undefined,
        vipGrantedAt: nextVip ? new Date().toISOString() : undefined,
      });
      toast.success(
        language === "ar"
          ? nextVip
            ? "👑 تم تفعيل العبور بلس للمستخدم مجاناً بنجاح!"
            : "تم إلغاء تفعيل العبور بلس"
          : nextVip
            ? "👑 Complimentary VIP Pass granted to user!"
            : "VIP Pass deactivated for user"
      );
    } catch (err) {
      console.error("Failed to toggle VIP status:", err);
      toast.error(language === "ar" ? "فشل تغيير حالة الاشتراك" : "Failed to change VIP status");
    }
  };

  const handleBanUser = (user: User) => {
    setConfirmModal({
      isOpen: true,
      title: language === "ar" ? "تأكيد الحظر" : "Confirm Ban",
      message:
        language === "ar"
          ? `هل أنت متأكد من حظر ${user.displayName}؟ لن يتمكن من تسجيل الدخول.`
          : `Are you sure you want to ban ${user.displayName}? They will not be able to log in.`,
      action: async () => {
        try {
          const idToken = await auth?.currentUser?.getIdToken();
          const res = await fetch(`/api/admin/users/${user.uid}/ban`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (!res.ok) throw new Error("Failed to ban");
          toast.success(language === "ar" ? "تم حظر المستخدم" : "User banned successfully");
          setConfirmModal(EMPTY_CONFIRM_MODAL);
        } catch (error) {
          console.error(error);
          toast.error(language === "ar" ? "فشل حظر المستخدم" : "Failed to ban user");
        }
      },
    });
  };

  const handleKickUser = (user: User) => {
    setConfirmModal({
      isOpen: true,
      title: language === "ar" ? "تأكيد الطرد" : "Confirm Kick",
      message:
        language === "ar"
          ? `هل أنت متأكد من طرد ${user.displayName}؟ سيتم تسجيل خروجه من جميع الأجهزة.`
          : `Are you sure you want to kick ${user.displayName}? They will be logged out of all devices.`,
      action: async () => {
        try {
          const idToken = await auth?.currentUser?.getIdToken();
          const res = await fetch(`/api/admin/users/${user.uid}/kick`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (!res.ok) throw new Error("Failed to kick");
          toast.success(language === "ar" ? "تم طرد المستخدم" : "User kicked successfully");
          setConfirmModal(EMPTY_CONFIRM_MODAL);
        } catch (error) {
          console.error(error);
          toast.error(language === "ar" ? "فشل طرد المستخدم" : "Failed to kick user");
        }
      },
    });
  };

  const handleUnbanUser = (user: User) => {
    setConfirmModal({
      isOpen: true,
      title: language === "ar" ? "إلغاء الحظر" : "Unban User",
      message:
        language === "ar"
          ? `هل أنت متأكد من إلغاء حظر ${user.displayName}؟`
          : `Are you sure you want to unban ${user.displayName}?`,
      action: async () => {
        try {
          const idToken = await auth?.currentUser?.getIdToken();
          const res = await fetch(`/api/admin/users/${user.uid}/unban`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (!res.ok) throw new Error("Failed to unban");
          toast.success(language === "ar" ? "تم إلغاء الحظر" : "User unbanned successfully");
          setConfirmModal(EMPTY_CONFIRM_MODAL);
        } catch (error) {
          console.error(error);
          toast.error(language === "ar" ? "فشل إلغاء الحظر" : "Failed to unban user");
        }
      },
    });
  };

  const handleDeleteUser = (user: User) => {
    setConfirmModal({
      isOpen: true,
      title: language === "ar" ? "حذف المستخدم نهائياً" : "Delete User Permanently",
      message:
        language === "ar"
          ? `هل أنت متأكد من حذف الحساب الخاص بـ ${user.displayName || user.email} نهائياً؟ هذا الإجراء لا يمكن التراجع عنه وسيحذف كافة بياناته.`
          : `Are you sure you want to delete ${user.displayName || user.email} permanently? This action cannot be undone and will delete all their data.`,
      action: async () => {
        try {
          const idToken = await auth?.currentUser?.getIdToken();
          const res = await fetch(`/api/admin/users/${user.uid}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${idToken}` },
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to delete");
          }
          toast.success(language === "ar" ? "تم حذف الحساب بنجاح" : "User deleted successfully");
          setConfirmModal(EMPTY_CONFIRM_MODAL);
        } catch (error) {
          const err = error as Error;
          console.error(err);
          toast.error(
            language === "ar"
              ? `فشل حذف الحساب: ${err.message}`
              : `Failed to delete user: ${err.message}`
          );
        }
      },
    });
  };

  useEffect(() => {
    const unsubscribe = userService.subscribeToAll(limitCount, (allUsers) => {
      allUsers.sort((left, right) => {
        const leftDate = getDateMillis(left.createdAt);
        const rightDate = getDateMillis(right.createdAt);
        return rightDate - leftDate;
      });

      setUsers(allUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [limitCount]);

  const handleChangeRoleConfirm = async (role: "student" | "moderator" | "admin" | "owner") => {
    if (!changeRoleModal.user) return;
    const { uid, email } = changeRoleModal.user;

    try {
      if (role === "admin") {
        await userService.promoteToAdmin(uid, email || "");
      } else {
        const defaultModeratorPermissions: UserPermission[] = [
          "delete_chats",
          "send_notifications",
        ];
        await userService.update(uid, {
          role: role as "student" | "moderator" | "owner",
          permissions:
            role === "student"
              ? []
              : role === "moderator"
                ? defaultModeratorPermissions
                : undefined,
        });
      }
      toast.success(language === "ar" ? "تم تحديث الدور" : "Role updated");
      setChangeRoleModal({ isOpen: false, user: null });
    } catch (error) {
      console.error("Role update error:", error);
      toast.error(language === "ar" ? "فشل التحديث" : "Update failed");
    }
  };

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          (user.displayName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.studentCode || "").includes(searchTerm)
      ),
    [searchTerm, users]
  );

  const selectableUsers = useMemo(
    () => filteredUsers.filter((user) => user.uid !== currentUser?.uid),
    [currentUser?.uid, filteredUsers]
  );

  const isAllSelectableSelected =
    selectedUsers.size === selectableUsers.length && selectableUsers.length > 0;

  const toggleUserSelection = (uid: string) => {
    if (uid === currentUser?.uid) {
      return;
    }

    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) {
        next.delete(uid);
      } else {
        next.add(uid);
      }
      return next;
    });
  };

  const handleBulkRoleChange = async (newRole: "student" | "admin" | "owner") => {
    if (newRole === "owner") {
      toast.error(
        language === "ar"
          ? "لا يمكن الترقية لمالك بشكل جماعي"
          : "Bulk owner promotion is not allowed"
      );
      return;
    }

    const batchPromises = Array.from(selectedUsers).map((uid) =>
      userService.update(uid, {
        role: newRole as "student" | "admin",
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
      .filter((user) => selectedUsers.has(user.uid))
      .map((user) => [user.uid, user.displayName, user.email, user.role, user.studentCode || ""]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((entry) => entry.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadMore = () => {
    setLoading(true);
    setLimitCount((prev) => prev + 50);
  };

  return {
    canEditUser,
    closeEditModal,
    confirmModal,
    currentUser,
    editModal,
    alertModal,
    setAlertModal,
    handleSendAlert,
    handleBanUser,
    handleKickUser,
    handleUnbanUser,
    handleDeleteUser,
    filteredUsers,
    handleBulkRoleChange,
    handleEditUser,
    handleToggleVipUser,
    handleExportCSV,
    handleLoadMore,
    changeRoleModal,
    setChangeRoleModal,
    handleChangeRoleConfirm,
    imageError,
    isAllSelectableSelected,
    language,
    limitCount,
    loading,
    searchTerm,
    selectedUsers,
    setConfirmModal,
    setEditModal,
    setImageError,
    setSearchTerm,
    setSelectedUsers,
    setViewModal,
    showLoadMore: users.length >= limitCount,
    toggleUserSelection,
    viewModal,
  };
}
