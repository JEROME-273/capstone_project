import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration - Using environment variables for better security
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyBTylfFz4_JcbvSlDof4YTf-yDVHPY_swk",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "ar-path-3eb94.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ar-path-3eb94",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ar-path-3eb94.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "314906875610",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:314906875610:web:02edf761141fa1aa8677e3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-V7PCV8YV9P",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
