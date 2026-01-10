import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import app from "./firebase";

let messaging: Messaging | null = null;

// Check if messaging is supported (client-side only, secure context)
export function isMessagingSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// Initialize messaging (call this after user grants permission)
export function initializeMessaging(): Messaging | null {
  if (!isMessagingSupported()) {
    return null;
  }

  if (!messaging) {
    if (!app) return null;
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.error("Failed to initialize Firebase Messaging:", error);
      return null;
    }
  }

  return messaging;
}

// Request permission and get FCM token
export async function requestNotificationPermission(): Promise<string | null> {
  if (!isMessagingSupported()) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      return null;
    }

    const msg = initializeMessaging();
    if (!msg) return null;

    // Get FCM token
    // Note: You need to add your VAPID key from Firebase Console > Project Settings > Cloud Messaging
    const token = await getToken(msg, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

// Listen for foreground messages
export function onForegroundMessage(
  callback: (payload: { title: string; body: string; data?: Record<string, string> }) => void
) {
  const msg = initializeMessaging();
  if (!msg) return () => {};

  return onMessage(msg, (payload) => {
    callback({
      title: payload.notification?.title || "New Notification",
      body: payload.notification?.body || "",
      data: payload.data,
    });
  });
}

// Show local notification (for foreground messages)
export function showLocalNotification(title: string, options?: NotificationOptions) {
  if (!isMessagingSupported() || Notification.permission !== "granted") {
    return;
  }

  // Use service worker for notifications when possible
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        icon: "/obour-logo.png",
        badge: "/obour-logo.png",
        ...options,
      });
    });
  } else {
    new Notification(title, {
      icon: "/obour-logo.png",
      ...options,
    });
  }
}
