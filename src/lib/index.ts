/**
 * Lib Utilities - Barrel Export
 * Import all utilities from this single file
 * Usage: import { cn, formatDate, db } from "@/lib";
 */

// Utilities
export {
  cn,
  formatDate,
  formatDateArabic,
  getGreeting,
  generateAvatarUrl,
  formatFileSize,
} from "./utils";

// Firebase
// app is default export in firebase.ts
export { default as app, auth, db, rtdb, storage, googleProvider } from "./firebase";

// Analytics
export { initializeAnalytics, logEvent, analyticsEvents } from "./analytics";

// AI
export { getAIModel, SYSTEM_PROMPT, AI_MODELS } from "./ai";
export type { AIModelProvider } from "./ai";

// Chat Utilities
export {
  sendMessage,
  markMessagesAsSeen,
  toggleReaction,
  deleteMessage,
  clearChatHistory,
} from "./chatUtils";

// Cloud Services
export { uploadToCloudinary, getCloudinaryUrl } from "./cloudinary";
export type { UploadResult } from "./cloudinary";

// Notifications
export {
  isMessagingSupported,
  initializeMessaging,
  requestNotificationPermission,
  onForegroundMessage,
  showLocalNotification,
} from "./notifications";

// Profanity Filter
export { filterProfanity, containsProfanity } from "./profanityFilter";

// Motion Variants
export {
  fadeIn,
  slideUp,
  slideInRight,
  scaleIn,
  staggerContainer,
  listContainer,
  listItem,
} from "./motion";

// Error Logger
export { errorLogger } from "./errorLogger";
