import { getAnalytics, logEvent as firebaseLogEvent, Analytics } from "firebase/analytics";
import { getApps, getApp } from "firebase/app";

let analytics: Analytics | null = null;

// Initialize analytics (client-side only)
export function initializeAnalytics() {
  if (typeof window !== "undefined" && !analytics) {
    try {
      const app = !getApps().length ? getApp() : getApp();
      analytics = getAnalytics(app);
    } catch (error) {
      console.error("Failed to initialize Firebase Analytics:", error);
    }
  }
  return analytics;
}

// Log custom events
export function logEvent(eventName: string, params?: Record<string, string | number>) {
  if (typeof window === "undefined") return;

  const analyticsInstance = analytics || initializeAnalytics();
  if (analyticsInstance) {
    firebaseLogEvent(analyticsInstance, eventName, params);
  }
}

// Predefined event helpers
export const analyticsEvents = {
  // User actions
  login: (method: string) => logEvent("login", { method }),
  signUp: (method: string) => logEvent("sign_up", { method }),
  logout: () => logEvent("logout"),

  // Content interactions
  viewSubject: (subjectId: string, subjectName: string) =>
    logEvent("view_subject", { subject_id: subjectId, subject_name: subjectName }),

  downloadResource: (resourceId: string, resourceType: string) =>
    logEvent("download_resource", { resource_id: resourceId, resource_type: resourceType }),

  searchQuery: (query: string, resultsCount: number) =>
    logEvent("search", { search_term: query, results: resultsCount }),

  // Chat interactions
  sendChatMessage: (mode: "bot" | "live") => logEvent("send_message", { chat_mode: mode }),

  switchChatMode: (from: string, to: string) =>
    logEvent("switch_chat_mode", { from_mode: from, to_mode: to }),

  // Admin actions
  createNotification: () => logEvent("create_notification"),
  createBanner: () => logEvent("create_banner"),
  manageUser: (action: string) => logEvent("admin_user_action", { action }),

  // Engagement
  shareContent: (contentType: string, method: string) =>
    logEvent("share", { content_type: contentType, method }),

  toggleTheme: (theme: string) => logEvent("toggle_theme", { theme }),
  toggleLanguage: (language: string) => logEvent("toggle_language", { language }),
};
