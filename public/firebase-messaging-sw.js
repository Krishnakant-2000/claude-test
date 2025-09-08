// Firebase Cloud Messaging Service Worker
// This file handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
const firebaseConfig = {
  apiKey: "AIzaSyBrFpknzO0LwmCKzRbIznQE3erVY0teo80",
  authDomain: "my-react-firebase-app-69fcd.firebaseapp.com",
  projectId: "my-react-firebase-app-69fcd",
  storageBucket: "my-react-firebase-app-69fcd.firebasestorage.app",
  messagingSenderId: "333629247601",
  appId: "1:333629247601:web:c7d83b6270eb66083f8bd0",
  measurementId: "G-DYEQEH86X7"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Ensure we have a valid payload
  if (!payload) {
    console.warn('[firebase-messaging-sw.js] Empty payload received');
    return;
  }
  
  const notificationTitle = payload.notification?.title || 'AmaPlayer Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'amaplayer-notification',
    requireInteraction: false,
    silent: false,
    data: {
      url: payload.data?.url || '/',
      timestamp: Date.now(),
      ...payload.data
    },
    actions: [
      {
        action: 'view',
        title: '👀 View'
      },
      {
        action: 'dismiss',
        title: '✖️ Dismiss'
      }
    ]
  };

  // Show notification with error handling
  self.registration.showNotification(notificationTitle, notificationOptions)
    .then(() => {
      console.log('[firebase-messaging-sw.js] Notification displayed successfully');
    })
    .catch((error) => {
      console.error('[firebase-messaging-sw.js] Error displaying notification:', error);
    });
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');

  event.notification.close();

  // Handle different actions
  if (event.action === 'dismiss') {
    return;
  }

  // Default action or 'view' action
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
