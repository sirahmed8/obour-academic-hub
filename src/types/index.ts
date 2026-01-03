// Type definitions for Obour Academic Hub

export type UserRole = "student" | "admin" | "owner";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  studentCode?: string;
  role: UserRole;
  permissions?: string[];
  notificationSettings?: {
    push: boolean;
    email: boolean;
  };
  photoURL?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Notification {
  id: string;
  title?: string;
  titleAr?: string;
  titleEn?: string;
  message?: string;
  messageAr?: string;
  messageEn?: string;
  type: "info" | "warning" | "success" | "urgent";
  target?: "all" | "admins" | string;
  readBy?: string[];
  isRead?: boolean;
  createdAt: string;
  createdBy?: string;
  subjectId?: string;
  resourceId?: string;
}

export interface Subject {
  id: string;
  name: string;
  nameAr?: string;
  profName: string;
  profNameAr?: string;
  description?: string;
  icon: string;
  color: string;
  orderIndex: number;
  createdAt: string;
  views?: number;
}

export interface Resource {
  id: string;
  subjectId: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  url: string;
  thumbnailUrl?: string;
  type: "pdf" | "link" | "video" | "image" | "document" | "other";
  orderIndex: number;
  createdAt: string;
  downloads?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  mode?: "ai" | "offline" | "live";
}

export interface InboxMessage {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  message: string;
  timestamp: string;
  status: "pending" | "replied" | "closed";
  adminReply?: string;
  adminReplyAt?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SystemError {
  id: string;
  error: string;
  context: string;
  stack?: string;
  timestamp: string;
  resolved: boolean;
}

export interface AdminPermissions {
  email: string;
  role: "admin" | "owner";
  permissions: string[];
  addedAt: string;
}

export interface SiteSettings {
  announcement?: string;
  announcementType?: "info" | "warning" | "success";
  maintenanceMode?: boolean;
}
