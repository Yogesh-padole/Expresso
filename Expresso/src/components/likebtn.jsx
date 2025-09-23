import React, { useEffect, useState } from "react";
import { doc, runTransaction, onSnapshot, increment, arrayUnion, arrayRemove } from "firebase/firestore";
import { db, auth } from "../firebase";
import { FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";

export default function LikeButton({ postId }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const user = auth.currentUser;

  useEffect(() => {
    const postRef = doc(db, "posts", postId);
    const unsub = onSnapshot(postRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setLikesCount(data.likes || 0);
        setLiked(data.likedBy?.includes(user?.uid) || false);
      }
    });
    return () => unsub();
  }, [postId, user?.uid]);

  const handleLike = async () => {
    if (!user) return alert("Login first to like");
    const postRef = doc(db, "posts", postId);
    await runTransaction(db, async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists()) throw "Post not found";
      if (liked) {
        transaction.update(postRef, {
          likes: increment(-1),
          likedBy: arrayRemove(user.uid),
        });
      } else {
        transaction.update(postRef, {
          likes: increment(1),
          likedBy: arrayUnion(user.uid),
        });
      }
    });
  };

  return (
    <button
      onClick={handleLike}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.6rem 1rem",
        border: "none",
        background: "transparent",
        color: liked ? "#3b82f6" : "#aaa",
        fontSize: "1.1rem",
        cursor: "pointer",
        borderRadius: "10px",
        fontWeight: liked ? "600" : "normal",
        transform: liked ? "scale(1.15)" : "scale(1)",
        transition: "all 0.25s ease",
      }}
    >
      {liked ? <FaThumbsUp /> : <FaRegThumbsUp />}
      {likesCount > 0 && <span>{likesCount}</span>}
    </button>
  );
}
