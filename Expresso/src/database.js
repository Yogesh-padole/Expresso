import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Save user
export async function addUserData(userId, email, password) {
  try {
    await addDoc(collection(db, "users"), {
      userId,
      email,
      password, // ⚠ Store only hashed passwords in real apps
      createdAt: new Date()
    });
    console.log("User data saved");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Get all users
export async function getUserData() {
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach(doc => {
    console.log(doc.id, " => ", doc.data());
  }); 
}
