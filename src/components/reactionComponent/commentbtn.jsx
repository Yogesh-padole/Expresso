import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function CommentButton({ postId }) {
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
      },
    );

    return () => unsubscribe();
  }, [postId]);

  return (
    <Link
      to={`/post/${postId}`}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors press-scale"
    >
      <MessageCircle className="h-4 w-4" />
      <span>{count}</span>
    </Link>
  );
}
