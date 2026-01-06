
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDmirfBt2gmvX800XZ1e4uzvvMrTxIzwL0",
  authDomain: "ps-active-strategy-app-2026.firebaseapp.com",
  projectId: "ps-active-strategy-app-2026",
  storageBucket: "ps-active-strategy-app-2026.firebasestorage.app",
  messagingSenderId: "704359993958",
  appId: "1:704359993958:web:f56dbc47802b4fb03b53a7",
  measurementId: "G-JZJ1W6YBL9"
};

// Initialize Firebase App only once
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize and export services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Initialize analytics safely
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
}).catch(err => {
  console.debug("Firebase Analytics not supported in this environment", err);
});

export default app;
