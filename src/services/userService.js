import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { deletePost } from "./postService";
import { db } from "../firebase/firebase";

const mapUser = (doc) => {
  const data = doc.data();

  return {
    userId: doc.id,

    name: data.name || data.username || "User",
    email: data.email,
    contact: data.contact,
    role: data.role || "User",
    status: data.status || "Active",

    // ✅ Add these
    savedPosts: data.savedPosts || [],
    postsCount: data.postsCount || [],

    avatar:
      "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(data.name || data.username || "User"),

    createdAt: data.createdAt || null,
  };
};

// Create or update user profile in Firestore
// Called after successful authentication to store user data
export const getLogUser = async (authId) => {
  const docRef = doc(db, "users", authId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return mapUser(docSnap); // ✅ USE ADAPTER
  } else {
    console.log("No such user!");
    return null;
  }
};

export const createUserProfile = async (user) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      await updateDoc(userRef, {
        createdAt: serverTimestamp(),
        email: user.email,
        lastactive: "",
        name: user.name,
        password: user.password,
        role: user.role, // important for Cloud Function to detect admin
        status: user.status,
        userId: user.email,
      });
    }

    return userRef;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

// Get all users for admin dashboard
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    return snapshot.docs.map((doc) => mapUser(doc)); // ✅ ADAPTER
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const subscribeToUsers = (callback) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const usersData = snapshot.docs.map((doc) => mapUser(doc)); // ✅ ADAPTER
    callback(usersData);
  });

  return unsubscribe;
};

//delete Users
export const deleteUsers = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

//delete User & All related Data
export const deleteUsersData = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const userDocSnapshot = await getDoc(docRef);

    if (!userDocSnapshot.exists()) {
      throw new Error(`User document not found: ${userId}`);
    }

    const userData = userDocSnapshot.data();

    console.log(userData);

    if (Array.isArray(userData.savedPosts) && userData.savedPosts.length > 0) {
      for (const postId of userData.savedPosts) {
        await deletePost(postId);
      }
    }

    await deleteDoc(docRef);
  } catch (error) {
    alert("Not Able To Delete User !!");
    console.error("Error deleting user:", error);
    throw error;
  }
};

//update Users
// export const updateUser = async (userId, userData) => {
//   console.log(`Inside updateUser userID : ${userId}`);
//   const userRef = doc(db, "users", userId);
//   await updateDoc(userRef, userData);
// };

export const updateUser = async (userId, userData) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const userRef = doc(db, "users", userId);

    // Remove undefined fields
    const cleanedData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== undefined),
    );

    // Optional: prevent updating sensitive fields
    delete cleanedData.password;
    delete cleanedData.userId;

    // Update timestamp
    cleanedData.lastactive = new Date();

    await updateDoc(userRef, cleanedData);

    return true;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error(error.message || "Failed to update user");
  }
};
