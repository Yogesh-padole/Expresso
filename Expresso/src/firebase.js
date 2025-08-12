
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyClte2HKVO8I7SWF7tR_fO81g2cMD8bnBc",
  authDomain: "epresso-bb188.firebaseapp.com",
  projectId: "epresso-bb188",
  storageBucket: "epresso-bb188.firebasestorage.app",
  messagingSenderId: "872048451321",
  appId: "1:872048451321:web:6be4ff4a9de3c29ccecc28",
  measurementId: "G-502R4QPNNQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;