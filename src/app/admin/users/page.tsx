"use client";

import { AnimatePresence } from "framer-motion";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { BulkActionsBar } from "@/components/admin/BulkActionsBar";
import { UserDetailModal } from "@/components/admin/UserDetailModal";
import { ChangeRoleModal } from "./_components/ChangeRoleModal";
import { EditUserModal } from "./_components/EditUserModal";
import { UsersHeader } from "./_components/UsersHeader";
import { UsersList } from "./_components/UsersList";
import { useAdminUsers } from "./useAdminUsers";

export default function AdminUsersPage() {
  const usersPage = useAdminUsers();

  return (
    <>
      <div className="flex min-h-0 w-full flex-col overflow-x-hidden p-4 lg:p-10">
        <UsersHeader
          language={usersPage.language}
          searchTerm={usersPage.searchTerm}
          setSearchTerm={usersPage.setSearchTerm}
        />

        <UsersList
          canEditUser={usersPage.canEditUser}
          currentUser={usersPage.currentUser}
          filteredUsers={usersPage.filteredUsers}
          setChangeRoleModal={usersPage.setChangeRoleModal}
          imageError={usersPage.imageError}
          isAllSelectableSelected={usersPage.isAllSelectableSelected}
          language={usersPage.language}
          loading={usersPage.loading}
          onLoadMore={usersPage.handleLoadMore}
          selectedUsers={usersPage.selectedUsers}
          setEditModal={usersPage.setEditModal}
          setImageError={usersPage.setImageError}
          setSelectedUsers={usersPage.setSelectedUsers}
          setViewModal={usersPage.setViewModal}
          showLoadMore={usersPage.showLoadMore}
          toggleUserSelection={usersPage.toggleUserSelection}
          setAlertModal={usersPage.setAlertModal}
          onBanClick={usersPage.handleBanUser}
          onKickClick={usersPage.handleKickUser}
          onUnbanClick={usersPage.handleUnbanUser}
          onDeleteClick={usersPage.handleDeleteUser}
          onToggleVip={usersPage.handleToggleVipUser}
        />

        <ConfirmationModal
          isOpen={usersPage.confirmModal.isOpen}
          onClose={() => usersPage.setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={usersPage.confirmModal.action}
          title={usersPage.confirmModal.title}
          message={usersPage.confirmModal.message}
        />

        <AnimatePresence>
          {usersPage.alertModal.isOpen && usersPage.alertModal.user && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl dark:bg-zinc-900">
                <h2 className="mb-4 text-xl font-bold">
                  {usersPage.language === "ar" ? "إرسال تنبيه" : "Send Alert"}
                </h2>
                <div className="mb-4">
                  <label className="mb-1 text-sm font-medium">
                    {usersPage.language === "ar" ? "عنوان التنبيه" : "Alert Title"}
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                    value={usersPage.alertModal.title}
                    onChange={(e) =>
                      usersPage.setAlertModal((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
                <div className="mb-6">
                  <label className="mb-1 text-sm font-medium">
                    {usersPage.language === "ar" ? "رسالة التنبيه" : "Alert Message"}
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-border bg-transparent px-4 py-2"
                    value={usersPage.alertModal.message}
                    onChange={(e) =>
                      usersPage.setAlertModal((prev) => ({ ...prev, message: e.target.value }))
                    }
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => usersPage.setAlertModal((prev) => ({ ...prev, isOpen: false }))}
                    className="rounded-lg px-4 py-2 font-medium text-muted-foreground hover:bg-muted"
                  >
                    {usersPage.language === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    onClick={usersPage.handleSendAlert}
                    className="rounded-lg bg-yellow-600 px-4 py-2 font-medium text-white hover:bg-yellow-700"
                  >
                    {usersPage.language === "ar" ? "إرسال" : "Send"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {usersPage.viewModal.isOpen && usersPage.viewModal.user && (
            <UserDetailModal
              user={usersPage.viewModal.user}
              language={usersPage.language as "en" | "ar"}
              onClose={() => usersPage.setViewModal({ isOpen: false, user: null })}
            />
          )}
        </AnimatePresence>

        <EditUserModal
          editModal={usersPage.editModal}
          language={usersPage.language}
          onClose={usersPage.closeEditModal}
          onSave={usersPage.handleEditUser}
          setEditModal={usersPage.setEditModal}
        />

        <ChangeRoleModal
          isOpen={usersPage.changeRoleModal.isOpen}
          onClose={() => usersPage.setChangeRoleModal({ isOpen: false, user: null })}
          user={usersPage.changeRoleModal.user}
          language={usersPage.language}
          onConfirm={usersPage.handleChangeRoleConfirm}
          isOwner={usersPage.currentUser?.role === "owner"}
        />
      </div>

      <BulkActionsBar
        selectedUsers={usersPage.selectedUsers}
        users={usersPage.filteredUsers}
        onClearSelection={() => usersPage.setSelectedUsers(new Set())}
        onBulkRoleChange={usersPage.handleBulkRoleChange}
        onExportCSV={usersPage.handleExportCSV}
        language={usersPage.language as "en" | "ar"}
      />
    </>
  );
}
