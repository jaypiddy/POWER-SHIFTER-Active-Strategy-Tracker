
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Fix: Use standard modular import for getFirestore and remove explicit Firestore type import to avoid potential module resolution errors.
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App only once
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize and export services
// Fix: Inferred types are used to ensure compatibility across different environment configurations.
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize analytics safely
isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
}).catch(err => {
  console.debug("Firebase Analytics not supported in this environment", err);
});

export default app;
