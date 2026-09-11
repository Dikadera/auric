import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCrvlvcrHw1vq1zrY_oNPHNAvGQIZkhy7E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "thevillaspa-14b57.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "thevillaspa-14b57",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "thevillaspa-14b57.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "266753549058",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:266753549058:web:0f0b0d8d3819a03bf5581b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-CY0SED0BFB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'auric');
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };
