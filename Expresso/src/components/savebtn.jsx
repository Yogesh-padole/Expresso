import React, { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";

export default function SaveButton({ postId }) {
  const [saved, setSaved] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setSaved((snap.data().savedPosts || []).includes(postId));
      }
    });
    return () => unsub();
  }, [postId, user]);

  const handleSave = async () => {
    if (!user) return alert("Login first to save");
    const userRef = doc(db, "users", user.uid);
    if (saved) {
      await updateDoc(userRef, { savedPosts: arrayRemove(postId) });
    } else {
      await updateDoc(userRef, { savedPosts: arrayUnion(postId) });
    }
  };

  return (
    <button
      onClick={handleSave}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.6rem 1rem",
        border: "none",
        background: "transparent",
        color: saved ? "#3b82f6" : "#aaa",
        fontSize: "1.1rem",
        cursor: "pointer",
        borderRadius: "10px",
        fontWeight: saved ? "600" : "normal",
        transform: saved ? "scale(1.15)" : "scale(1)",
        transition: "all 0.25s ease",
      }}
    >
      {saved ? <FaBookmark /> : <FaRegBookmark />}
    </button>
  );
}
