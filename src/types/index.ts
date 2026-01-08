// Type definitions for Obour Academic Hub

export type UserRole = "student" | "admin" | "owner";

export type UserPermission =
  | "manage_subjects"
  | "manage_resources"
  | "send_notifications"
  | "delete_chats"
  | "manage_users";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  studentCode?: string;
  role: UserRole;
  permissions?: UserPermission[];
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
  text: string;
  senderId: string;
  senderName?: string;
  timestamp: { seconds: number; nanoseconds: number } | null;
  status: "sent" | "delivered" | "seen";
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
  };
  reactions?: Record<string, string>;
  isDeleted?: boolean;
  type?: "text" | "image" | "file" | "system";
  context?: "bot" | "live";
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentType?: string;
  role?: "user" | "assistant" | "system";
  action?: "confirm_task" | "live_chat";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  taskData?: any;
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

export interface ChatSession {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: { seconds: number; nanoseconds: number } | null;
  unreadCount: number; // For User (how many admin messages they haven't seen)
  adminUnreadCount: number; // For Admin (how many user messages admin hasn't seen)
  isTyping?: boolean;
  isPinned?: boolean;
}

export interface TodoTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  reminder?: boolean;
  repeat?: "daily" | "weekly" | "monthly" | "none";
  subtasks?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  orderIndex: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdAt: any;
}
