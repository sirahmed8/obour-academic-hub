"use client";

import { LoadingTable } from "@/components/ui/Loading";
import { AnimatedCheckbox } from "@/components/ui/AnimatedCheckbox";
import { StaggerChildren } from "@/components/ui/Animations";
import { User } from "@/types";
import {
  EditUserModalState,
  ViewUserModalState,
  ChangeRoleModalState,
  AlertModalState,
} from "../types";
import { UserMobileCard } from "./UserMobileCard";
import { UserTableRow } from "./UserTableRow";

interface UsersListProps {
  canEditUser: (user: User) => boolean;
  currentUser: User | null;
  filteredUsers: User[];
  setChangeRoleModal: React.Dispatch<React.SetStateAction<ChangeRoleModalState>>;
  imageError: Record<string, boolean>;
  isAllSelectableSelected: boolean;
  language: string;
  loading: boolean;
  onLoadMore: () => void;
  selectedUsers: Set<string>;
  setEditModal: React.Dispatch<React.SetStateAction<EditUserModalState>>;
  setImageError: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setSelectedUsers: React.Dispatch<React.SetStateAction<Set<string>>>;
  setViewModal: React.Dispatch<React.SetStateAction<ViewUserModalState>>;
  showLoadMore: boolean;
  toggleUserSelection: (uid: string) => void;
  setAlertModal: React.Dispatch<React.SetStateAction<AlertModalState>>;
  onBanClick: (user: User) => void;
  onKickClick: (user: User) => void;
  onUnbanClick: (user: User) => void;
  onDeleteClick: (user: User) => void;
}

export function UsersList({
  canEditUser,
  currentUser,
  filteredUsers,
  setChangeRoleModal,
  imageError,
  isAllSelectableSelected,
  language,
  loading,
  onLoadMore,
  selectedUsers,
  setEditModal,
  setImageError,
  setSelectedUsers,
  setViewModal,
  showLoadMore,
  toggleUserSelection,
  setAlertModal,
  onBanClick,
  onKickClick,
  onUnbanClick,
  onDeleteClick,
}: UsersListProps) {
  const selectableUsers = filteredUsers.filter((user) => user.uid !== currentUser?.uid);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="sticky top-0 z-10 hidden grid-cols-[3fr_1.5fr_1.5fr_2fr] border-b border-border bg-muted/50 text-sm font-semibold text-muted-foreground backdrop-blur-md lg:grid">
        <div className="flex items-center gap-2 px-6 py-4">
          <AnimatedCheckbox
            checked={isAllSelectableSelected}
            onChange={() => {
              if (isAllSelectableSelected) {
                setSelectedUsers(new Set());
              } else {
                setSelectedUsers(new Set(selectableUsers.map((user) => user.uid)));
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

      <div className="custom-scrollbar max-h-[365px] w-full overflow-y-auto bg-background/30">
        {loading ? (
          <div className="p-4">
            <LoadingTable rows={6} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground">
            {language === "ar" ? "لا يوجد مستخدمين" : "No users found"}
          </div>
        ) : (
          <>
            <StaggerChildren className="divide-y divide-border lg:hidden">
              {filteredUsers.map((user) => (
                <UserMobileCard
                  key={user.uid}
                  canEditUser={canEditUser}
                  currentUser={currentUser}
                  setChangeRoleModal={setChangeRoleModal}
                  imageError={imageError}
                  isSelected={selectedUsers.has(user.uid)}
                  language={language}
                  setEditModal={setEditModal}
                  setImageError={setImageError}
                  setViewModal={setViewModal}
                  toggleUserSelection={toggleUserSelection}
                  setAlertModal={setAlertModal}
                  onBanClick={onBanClick}
                  onKickClick={onKickClick}
                  onUnbanClick={onUnbanClick}
                  onDeleteClick={onDeleteClick}
                  user={user}
                />
              ))}
            </StaggerChildren>

            <div className="hidden lg:block">
              <div className="min-h-[200px]">
                {filteredUsers.map((user) => (
                  <UserTableRow
                    key={user.uid}
                    canEditUser={canEditUser}
                    currentUser={currentUser}
                    setChangeRoleModal={setChangeRoleModal}
                    imageError={imageError}
                    isSelected={selectedUsers.has(user.uid)}
                    language={language}
                    setEditModal={setEditModal}
                    setImageError={setImageError}
                    setViewModal={setViewModal}
                    toggleUserSelection={toggleUserSelection}
                    setAlertModal={setAlertModal}
                    onBanClick={onBanClick}
                    onKickClick={onKickClick}
                    onUnbanClick={onUnbanClick}
                    onDeleteClick={onDeleteClick}
                    user={user}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {showLoadMore && !loading && (
        <div className="flex justify-center border-t border-border bg-muted/10 p-2">
          <button onClick={onLoadMore} className="text-xs font-medium text-primary hover:underline">
            {language === "ar" ? "تحميل المزيد من قاعدة البيانات" : "Load more from database"}
          </button>
        </div>
      )}
    </div>
  );
}
