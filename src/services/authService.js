import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const auth = getAuth();

// ✅ LOGIN
export const loginUser = async (email, password, rememberMe) => {
  try {
    if (!email || !password) {
      throw new Error("Email and Password are required");
    }

    if (rememberMe) {
      await setPersistence(auth, browserLocalPersistence); // stays logged in
    } else {
      await setPersistence(auth, browserSessionPersistence); // session only
    }

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    return userCredential.user;
  } catch (err) {
    if (
      err.code === "auth/invalid-credential" ||
      err.code === "auth/wrong-password"
    ) {
      throw new Error("Incorrect password");
    } else if (err.code === "auth/user-not-found") {
      throw new Error("No account found with this email");
    } else {
      throw new Error(err.message || "Login failed");
    }
  }
};

// ✅ REGISTER (🔥 extracted from your file)
export const registerUser = async (username, email, password) => {
  try {
    if (!username || !email || !password) {
      throw new Error("All fields are required");
    }

    // 1️⃣ Check username uniqueness
    const usernameQuery = query(
      collection(db, "users"),
      where("username", "==", username),
    );

    const usernameSnap = await getDocs(usernameQuery);

    if (!usernameSnap.empty) {
      throw new Error("Username is already taken");
    }

    // 2️⃣ Create Auth user
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    const uid = cred.user.uid;

    // 3️⃣ Save user in Firestore
    await setDoc(doc(db, "users", uid), {
      username: username,
      email: email,
      role: "User",
      createdAt: new Date(),
      lastactive: "",
      password: password,
      status: "Active",
      userId: uid,
    });

    return cred.user;
  } catch (err) {
    console.error("Register error:", err);

    if (err.code === "auth/email-already-in-use") {
      throw new Error("Email already exists");
    } else {
      throw new Error(err.message || "Registration failed");
    }
  }
};

// ✅ RESET PASSWORD
export const resetPassword = async (email) => {
  try {
    if (!email) throw new Error("Email is required");

    await sendPasswordResetEmail(auth, email);
    return "Password reset email sent!";
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      throw new Error("No account found with this email");
    } else {
      throw new Error(err.message);
    }
  }
};

// ✅ LOGOUT
export const logoutUser = async () => {
  await signOut(auth);
};
