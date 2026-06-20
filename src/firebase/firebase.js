// Firebase configuration and initialization
// This file sets up Firebase services for authentication and Firestore database
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBJm9zoegmjc0wDMWK2aaoHu_kHfElx2Lk",
  authDomain: "expresso-b7f8d.firebaseapp.com",
  projectId: "expresso-b7f8d",
  storageBucket: "expresso-b7f8d.firebasestorage.app",
  messagingSenderId: "475947216350",
  appId: "1:475947216350:web:2eedba4985743468ca014f",
};

// Initialize Firebase app with configuration
const app = initializeApp(firebaseConfig);

export const functions = getFunctions(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Export serverTimestamp for consistent timestamp creation
export { serverTimestamp };

// Export the app instance for any additional Firebase services
export default app;
