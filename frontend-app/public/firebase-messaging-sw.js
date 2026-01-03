/* eslint-disable */
// public/firebase-messaging-sw.js
// Service worker khusus untuk push notification dari Firebase Cloud Messaging (FCM)

importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCnLWUkyzI0MaY7JFVK6rYy2JDwA6svtG8",
  authDomain: "food-ordering-app-507f1.firebaseapp.com",
  projectId: "food-ordering-app-507f1",
  storageBucket: "food-ordering-app-507f1.appspot.com",
  messagingSenderId: "823219467708",
  appId: "1:823219467708:web:c6bd972b44e48eedc2a7b9",
  measurementId: "G-7KDNM5FNTQ",
});

const messaging = firebase.messaging();

// Tampilkan notifikasi saat pesan push diterima
messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icons/icon-192.png",
    data: payload.data || {},
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
