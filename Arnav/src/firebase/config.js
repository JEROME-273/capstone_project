import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTylfFz4_JcbvSlDof4YTf-yDVHPY_swk",
  authDomain: "ar-path-3eb94.firebaseapp.com",
  projectId: "ar-path-3eb94",
  storageBucket: "ar-path-3eb94.appspot.com",
  messagingSenderId: "314906875610",
  appId: "1:314906875610:web:02edf761141fa1aa8677e3",
  measurementId: "G-V7PCV8YV9P",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
