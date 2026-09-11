import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCrvlvcrHw1vq1zrY_oNPHNAvGQIZkhy7E",
  authDomain: "thevillaspa-14b57.firebaseapp.com",
  projectId: "thevillaspa-14b57",
  storageBucket: "thevillaspa-14b57.firebasestorage.app",
  messagingSenderId: "266753549058",
  appId: "1:266753549058:web:0f0b0d8d3819a03bf5581b",
  measurementId: "G-CY0SED0BFB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'auric');
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };
