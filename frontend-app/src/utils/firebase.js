// src/utils/firebase.js
// Inisialisasi Firebase, Analytics, dan FCM untuk push notification
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCnLWUkyzI0MaY7JFVK6rYy2JDwA6svtG8",
  authDomain: "food-ordering-app-507f1.firebaseapp.com",
  projectId: "food-ordering-app-507f1",
  storageBucket: "food-ordering-app-507f1.appspot.com",
  messagingSenderId: "823219467708",
  appId: "1:823219467708:web:c6bd972b44e48eedc2a7b9",
  measurementId: "G-7KDNM5FNTQ",
};

const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp);
const messaging = getMessaging(firebaseApp);

export { messaging, getToken, onMessage, analytics };
