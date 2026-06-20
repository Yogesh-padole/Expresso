import React, { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import { Bookmark } from "lucide-react";

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
    <button onClick={handleSave}>
      <Bookmark
        className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`}
      />
    </button>
  );
}
