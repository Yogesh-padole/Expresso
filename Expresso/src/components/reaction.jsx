import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  doc,
  runTransaction,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  collection,
  addDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  updateDoc,
  getDoc,
} from "firebase/firestore";

import {
  FaThumbsUp,
  FaRegThumbsUp,
  FaComment,
  FaShareAlt,
  FaRegBookmark,
  FaBookmark,
  FaTrash,
} from "react-icons/fa";

export default function Reaction({ postId }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const user = auth.currentUser;

  // 🔹 Listen for likes
  useEffect(() => {
    const postRef = doc(db, "posts", postId);
    const unsubscribe = onSnapshot(postRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLikesCount(data.likes || 0);
        setLiked(data.likedBy?.includes(user?.uid) || false);
      }
    });
    return () => unsubscribe();
  }, [postId, user?.uid]);

  // 🔹 Like
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

  // 🔹 Save
  const handleSave = async () => {
    if (!user) return alert("Login first to save");
    const userRef = doc(db, "users", user.uid);
    if (saved) {
      await updateDoc(userRef, { savedPosts: arrayRemove(postId) });
    } else {
      await updateDoc(userRef, { savedPosts: arrayUnion(postId) });
    }
  };

  // 🔹 Listen saved
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const savedPosts = snap.data().savedPosts || [];
        setSaved(savedPosts.includes(postId));
      }
    });
    return () => unsubscribe();
  }, [postId, user]);

  // 🔹 Listen comments + replies
  useEffect(() => {
    const commentsRef = collection(db, "posts", postId, "comments");
    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      const commentsData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        replies: [],
      }));

      // Attach listeners for replies inside each comment
      commentsData.forEach((comment) => {
        const repliesRef = collection(
          db,
          "posts",
          postId,
          "comments",
          comment.id,
          "replies"
        );
        onSnapshot(repliesRef, (repliesSnap) => {
          const replies = repliesSnap.docs.map((r) => ({
            id: r.id,
            ...r.data(),
          }));
          setComments((prev) =>
            prev.map((c) => (c.id === comment.id ? { ...c, replies } : c))
          );
        });
      });

      setComments(commentsData);
    });
    return () => unsubscribe();
  }, [postId]);

  // 🔹 Add Comment
  const handleAddComment = async () => {
    if (!user) return alert("Login to comment");
    if (!newComment.trim()) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    let username = "Anonymous";
    if (userSnap.exists()) {
      const data = userSnap.data();
      username =
        data.username || data.displayName || user.email || "Anonymous";
    }

    const commentsRef = collection(db, "posts", postId, "comments");
    await addDoc(commentsRef, {
      text: newComment,
      author: username,
      authorId: user.uid,
      createdAt: serverTimestamp(),
    });

    setNewComment("");
  };

  // 🔹 Delete Comment
  const handleDeleteComment = async (commentId, authorId) => {
    if (!user || user.uid !== authorId) return;
    await deleteDoc(doc(db, "posts", postId, "comments", commentId));
  };

  // 🔹 Add Reply
  const handleAddReply = async (commentId, replyText) => {
    if (!user) return alert("Login to reply");
    if (!replyText.trim()) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    let username = "Anonymous";
    if (userSnap.exists()) {
      const data = userSnap.data();
      username =
        data.username || data.displayName || user.email || "Anonymous";
    }

    const repliesRef = collection(
      db,
      "posts",
      postId,
      "comments",
      commentId,
      "replies"
    );
    await addDoc(repliesRef, {
      text: replyText,
      author: username,
      authorId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  // 🔹 Delete Reply
  const handleDeleteReply = async (commentId, replyId, authorId) => {
    if (!user || user.uid !== authorId) return;
    await deleteDoc(
      doc(db, "posts", postId, "comments", commentId, "replies", replyId)
    );
  };

  // 🔹 Share
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this post ☕",
          text: "I found this interesting post, have a look!",
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("🔗 Post link copied to clipboard!");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "0.8rem 1rem",
        background: "rgba(39, 59, 69, 0.6)",
        borderRadius: "16px",
        backdropFilter: "blur(8px)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
        marginTop: "1rem",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Like */}
      <button
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
        onClick={handleLike}
      >
        {liked ? <FaThumbsUp /> : <FaRegThumbsUp />}
        {likesCount > 0 && <span>{likesCount}</span>}
      </button>

      {/* Comment */}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.6rem 1rem",
          border: "none",
          background: "transparent",
          color: "#aaa",
          fontSize: "1.1rem",
          cursor: "pointer",
          borderRadius: "10px",
          transition: "all 0.25s ease",
        }}
        onClick={() => setShowComments(true)}
      >
        <FaComment /> {comments.length > 0 && <span>{comments.length}</span>}
      </button>

      {/* Share */}
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.6rem 1rem",
          border: "none",
          background: "transparent",
          color: "#aaa",
          fontSize: "1.1rem",
          cursor: "pointer",
          borderRadius: "10px",
        }}
        onClick={handleShare}
      >
        <FaShareAlt />
      </button>

      {/* Save */}
      <button
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
        onClick={handleSave}
      >
        {saved ? <FaBookmark /> : <FaRegBookmark />}
      </button>

      {/* 🔹 Comment Modal */}
      {showComments && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.75)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setShowComments(false)}
        >
          <div
            style={{
              background: "rgba(26, 35, 44, 0.9)",
              borderRadius: "18px",
              padding: "1.5rem",
              width: "90%",
              maxWidth: "550px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "1rem",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                color: "white",
              }}
            >
              <h4>💬 Comments</h4>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#aaa",
                  fontSize: "1.6rem",
                  cursor: "pointer",
                }}
                onClick={() => setShowComments(false)}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                flexGrow: 1,
                overflowY: "auto",
                paddingTop: "1rem",
              }}
            >
              {comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    padding: "1rem",
                    borderRadius: "14px",
                    marginBottom: "1rem",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "1rem",
                      color: "#ddd",
                    }}
                  >
                    <p>
                      <strong>{c.author}:</strong> {c.text}
                    </p>
                    {user?.uid === c.authorId && (
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          color: "#f87171",
                          cursor: "pointer",
                        }}
                        onClick={() => handleDeleteComment(c.id, c.authorId)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>

                  {/* Replies */}
                  <div
                    style={{
                      paddingLeft: "1.5rem",
                      borderLeft: "2px solid rgba(255,255,255,0.1)",
                      marginTop: "0.5rem",
                    }}
                  >
                    {c.replies?.map((r) => (
                      <div
                        key={r.id}
                        style={{
                          padding: "0.6rem",
                          borderRadius: "10px",
                          backgroundColor: "rgba(255,255,255,0.05)",
                          marginBottom: "0.5rem",
                          fontSize: "0.9rem",
                          color: "#ccc",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <p>
                          <strong>{r.author}:</strong> {r.text}
                        </p>
                        {user?.uid === r.authorId && (
                          <button
                            style={{
                              background: "none",
                              border: "none",
                              color: "#f87171",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              handleDeleteReply(c.id, r.id, r.authorId)
                            }
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <ReplyInput onReply={(txt) => handleAddReply(c.id, txt)} />
                </div>
              ))}
            </div>

            {/* New Comment */}
            <div
              style={{
                display: "flex",
                gap: "0.6rem",
                marginTop: "1rem",
              }}
            >
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{
                  flex: 1,
                  padding: "0.8rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  fontSize: "1rem",
                }}
              />
              <button
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "white",
                  border: "none",
                  padding: "0.7rem 1.2rem",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                }}
                onClick={handleAddComment}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Reply input */
function ReplyInput({ onReply }) {
  const [reply, setReply] = useState("");
  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        marginTop: "0.6rem",
      }}
    >
      <input
        type="text"
        placeholder="Reply..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        style={{
          flex: 1,
          padding: "0.6rem",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.08)",
          fontSize: "0.9rem",
          color: "white",
        }}
      />
      <button
        onClick={() => {
          if (reply.trim()) {
            onReply(reply);
            setReply("");
          }
        }}
        style={{
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          color: "white",
          border: "none",
          padding: "0.5rem 0.9rem",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "0.8rem",
          transition: "all 0.2s ease",
        }}
      >
        Reply
      </button>
    </div>
  );
}
