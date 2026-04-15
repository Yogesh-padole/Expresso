import React, { useEffect, useState } from "react";
import {
  doc,
  runTransaction,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import { FaThumbsUp, FaRegThumbsUp } from "react-icons/fa";
import { Heart } from "lucide-react";

export default function LikeButton({ postId }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const user = auth.currentUser;

  useEffect(() => {
    if (!postId) return;
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
    let postData;

    // 🔹 Transaction only for updating likes
    await runTransaction(db, async (transaction) => {
      const postDoc = await transaction.get(postRef);
      if (!postDoc.exists()) throw "Post not found";

      postData = postDoc.data();
      const alreadyLiked = postData.likedBy?.includes(user.uid);

      if (alreadyLiked) {
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

    // 🔹 Separate notification write (outside transaction)
    if (postData && user.uid !== postData.authorId && !liked) {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        let username = "Anonymous";
        if (userSnap.exists()) {
          const data = userSnap.data();
          username =
            data.username || data.displayName || user.email || "Anonymous";
        }

        await addDoc(collection(db, "notifications"), {
          userId: postData.authorId,
          senderId: user.uid,
          postId,
          type: "like",
          message: `${username} liked your post.`,
          createdAt: serverTimestamp(),
          seen: false,
        });
      } catch (err) {
        console.error("Notification error:", err);
      }
    }
  };

  return (
    <button
      onClick={handleLike}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors press-scale"
    >
      <Heart
        className={`h-4 w-4 ${liked ? "fill-destructive text-destructive" : ""}`}
      />
      {likesCount > 0 && <span>{likesCount}</span>}
    </button>
  );
}
