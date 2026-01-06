import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import app, { firebaseConfig } from "./firebase";

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

// Register Service Worker with environment variables
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isMessagingSupported()) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      apiKey: firebaseConfig.apiKey || "",
      authDomain: firebaseConfig.authDomain || "",
      projectId: firebaseConfig.projectId || "",
      storageBucket: firebaseConfig.storageBucket || "",
      messagingSenderId: firebaseConfig.messagingSenderId || "",
      appId: firebaseConfig.appId || "",
    });

    const swUrl = `/firebase-messaging-sw.js?${params.toString()}`;
    const registration = await navigator.serviceWorker.register(swUrl);

    // Wait for the service worker to be active
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return null;
  }
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

    // Register Service Worker and get registration object
    const registration = await registerServiceWorker();

    // Get FCM token
    // Note: You need to add your VAPID key from Firebase Console > Project Settings > Cloud Messaging
    const tokenOptions: any = {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    };

    if (registration) {
      tokenOptions.serviceWorkerRegistration = registration;
    }

    const token = await getToken(msg, tokenOptions);

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
