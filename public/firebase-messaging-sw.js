// Firebase Cloud Messaging Service Worker for NER-LOGIX
// Delivers real-time emergency road closures and critical delivery alerts to field devices

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyC0QwXo6-lnHMgyPDVZDHA8psxxBJrWDPU",
  authDomain: "gen-lang-client-0389261254.firebaseapp.com",
  projectId: "gen-lang-client-0389261254",
  storageBucket: "gen-lang-client-0389261254.firebasestorage.app",
  messagingSenderId: "406499846019",
  appId: "1:406499846019:web:2c078ecce740bee8c5b8b6"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[FCM-SW] Received background push message:', payload);

  const title = payload.notification?.title || payload.data?.title || 'NER-LOGIX Alert';
  const body = payload.notification?.body || payload.data?.body || 'New mountain logistics and road condition update received.';
  const severity = payload.data?.severity || 'HIGH';
  const alertType = payload.data?.alertType || 'EMERGENCY_ALERT';

  const notificationOptions = {
    body: body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: payload.data?.tag || `ner-logix-${Date.now()}`,
    vibrate: [200, 100, 200, 100, 400],
    data: {
      url: '/',
      alertType: alertType,
      severity: severity,
      ...payload.data
    },
    actions: [
      { action: 'open_map', title: 'Open GIS Map' },
      { action: 'dismiss', title: 'Acknowledge' }
    ]
  };

  self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
