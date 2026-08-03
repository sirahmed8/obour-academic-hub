// Type definitions for Obour Academic Hub

export type UserRole = "student" | "moderator" | "admin" | "owner";

export type UserPermission =
  | "manage_subjects"
  | "manage_resources"
  | "send_notifications"
  | "delete_chats"
  | "manage_users"
  | "access_inbox"
  | "manage_announcements"
  | "view_analytics"
  | "view_audit_logs";

export type FirestoreDate =
  | string
  | {
      seconds: number;
      nanoseconds: number;
    }
  | {
      toDate: () => Date;
    };

export interface User {
  uid: string;
  email: string;
  displayName: string;
  studentCode?: string;
  role: UserRole;
  status?: "active" | "banned";
  permissions?: UserPermission[];
  notificationSettings?: {
    push: boolean;
    email: boolean;
  };
  photoURL?: string;
  createdAt: FirestoreDate;
  lastLogin?: FirestoreDate;
  points?: number;
  completedResources?: string[];
  institute?: string;
  academicYear?: string;
  department?: string;
  streakDays?: number;
  onboardingCompleted?: boolean;
  isVip?: boolean;
  subscriptionTier?: "free" | "vip";
  vipExpiresAt?: string;
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
  createdAt: FirestoreDate;
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
  descriptionAr?: string;
  icon: string;
  color: string;
  orderIndex: number;
  createdAt: FirestoreDate;
  views?: number;
  year?: string;
  department?: string;
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
  displayAsFile?: boolean; // When true, link type renders as a file card
  icon?: string; // Custom icon name for the resource
  orderIndex: number;
  createdAt: FirestoreDate;
  downloads?: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName?: string;
  timestamp: { seconds: number; nanoseconds: number } | Date | null;
  status: "sent" | "delivered" | "seen";
  replyTo?: {
    id: string;
    text: string;
    senderName: string;
    attachmentUrl?: string;
    attachmentType?: string;
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
  taskData?: Partial<TodoTask>;
  seenBy?: string[];
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
  type?: string;
  path?: string;
  timestamp: FirestoreDate;
}

export interface SystemError {
  id: string;
  error: string;
  context: string;
  stack?: string;
  timestamp: FirestoreDate;
  resolved: boolean;
}

export interface AdminPermissions {
  email: string;
  role: "admin" | "owner";
  permissions: string[];
  addedAt: FirestoreDate;
}

export interface SiteSettings {
  announcement?: string;
  announcementType?: "info" | "warning" | "success";
  maintenanceMode?: boolean;
  aiEnabled?: boolean;
  chatbotEnabled?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: { seconds: number; nanoseconds: number } | Date | null;
  unreadCount: number; // For User (how many admin messages they haven't seen)
  adminUnreadCount: number; // For Admin (how many user messages admin hasn't seen)
  isTyping?: boolean;
  isPinned?: boolean;
  userImage?: string; // Profile picture URL
  status?: string;
  isOnline?: boolean;
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
  subjectId?: string; // Links task to a subject
  sourceName?: string; // Links task to a study source/material
  sourceUrl?: string; // URL to the resource or subject page
  subtasks?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  orderIndex: number;
  createdAt: string | { seconds: number; nanoseconds: number };
  status?: "todo" | "in-progress" | "done";
}
export interface UserPresence {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  lastActive: number;
  status: "online" | "offline";
  currentPath?: string;
}
