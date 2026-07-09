import { UserPermission } from "@/types";

export const DEFAULT_ADMIN_PERMISSIONS: UserPermission[] = [
  "manage_subjects",
  "manage_resources",
  "send_notifications",
  "manage_announcements",
];

export const AUTH_CONFIG = {
  TOKEN_EXPIRY_MS: 3600000, // 1 hour
  BOOTSTRAP_RETRY_LIMIT: 3,
};
