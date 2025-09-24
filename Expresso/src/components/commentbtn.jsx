import React, { useEffect, useState } from "react";
import { FaRegCommentDots } from "react-icons/fa";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function CommentButton({ postId, onClick }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // if postId not ready yet, show 0 and wait
    if (!postId) {
      setCount(0);
      return;
    }

    // ensure it's a string (Firestore expects string id)
    const postIdStr = String(postId);
    console.log("CommentButton listening for postId:", postIdStr);

    const commentsRef = collection(db, "posts", postIdStr, "comments");

    const unsubscribe = onSnapshot(
      commentsRef,
      (snapshot) => {
        setCount(snapshot.size);
      },
      (error) => {
        // helpful debugging if Firestore read fails (rules, network, etc.)
        console.error("Comments onSnapshot error:", error);
      }
    );

    return () => unsubscribe();
  }, [postId]);

  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "white",
        fontSize: "1.1rem",
      }}
    >
      <FaRegCommentDots />
      <span style={{ fontSize: "0.9rem", color: "#ddd" }}>{count}</span>
    </button>
  );
}
