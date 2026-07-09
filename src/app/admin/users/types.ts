import { User, UserPermission } from "@/types";

export interface PermissionDefinition {
  key: UserPermission;
  label: string;
  labelAr: string;
}

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  action: () => void;
}

export interface EditUserModalState {
  isOpen: boolean;
  user: User | null;
  name: string;
  code: string;
  permissions: UserPermission[];
}

export interface ViewUserModalState {
  isOpen: boolean;
  user: User | null;
}

export interface ChangeRoleModalState {
  isOpen: boolean;
  user: User | null;
}

export interface AlertModalState {
  isOpen: boolean;
  user: User | null;
  title: string;
  message: string;
}
