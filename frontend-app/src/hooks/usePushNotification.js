// src/hooks/usePushNotification.js
import { useEffect } from "react";
import { messaging, getToken, onMessage } from "../utils/firebase";

export default function usePushNotification(onForegroundMessage) {
  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        navigator.serviceWorker
          .register("/firebase-messaging-sw.js")
          .then(() => {
            getToken(messaging, {
              vapidKey: "ISI_VAPID_KEY_KAMU",
              serviceWorkerRegistration: navigator.serviceWorker,
            }).then((currentToken) => {
              if (currentToken) {
                // Kirim token ke server untuk simpan ke user
                // fetch('/api/save-fcm-token', { method: 'POST', body: JSON.stringify({ token: currentToken }) })
                //   .then(...)
              }
            });
          });
      }
    });
    // Handle pesan saat aplikasi sedang dibuka
    const unsubscribe = onMessage(messaging, (payload) => {
      if (onForegroundMessage) onForegroundMessage(payload);
    });
    return () => unsubscribe();
  }, [onForegroundMessage]);
}
