
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";




const firebaseConfig = {
  apiKey: "AIzaSyBJm9zoegmjc0wDMWK2aaoHu_kHfElx2Lk",
  authDomain: "expresso-b7f8d.firebaseapp.com",
  projectId: "expresso-b7f8d",
  storageBucket: "expresso-b7f8d.firebasestorage.app",
  messagingSenderId: "475947216350",
  appId: "1:475947216350:web:2eedba4985743468ca014f",
  measurementId: "G-9CLG2YLX9S"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;