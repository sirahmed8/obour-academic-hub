// Firebase Cloud Messaging Service Worker
// This file should be placed in /public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// Initialize Firebase in Service Worker
// Initialize Firebase in Service Worker
// Credentials should be passed via URL parameters or updated manually
const params = new URLSearchParams(self.location.search);

const firebaseConfig = {
  apiKey: params.get("apiKey") || "REPLACE_WITH_YOUR_KEY",
  authDomain: params.get("authDomain") || "obour-institutes-a607d.firebaseapp.com",
  projectId: params.get("projectId") || "obour-institutes-a607d",
  storageBucket: params.get("storageBucket") || "obour-institutes-a607d.firebasestorage.app",
  messagingSenderId: params.get("messagingSenderId") || "761134603194",
  appId: params.get("appId") || "1:761134603194:web:a434d916518caa86935b83",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/obour-logo.png",
    badge: "/obour-logo.png",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickAction = event.notification.data?.click_action || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(clickAction);
      }
    })
  );
});
