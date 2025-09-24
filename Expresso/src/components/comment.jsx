import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { FaTrash } from "react-icons/fa";
import ReplyInput from "./replay";

export default function CommentModal({ postId, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const user = auth.currentUser;

  // 🔹 Listen to comments + replies
  useEffect(() => {
    const commentsRef = collection(db, "posts", postId, "comments");
    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      const commentsData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        replies: [],
      }));

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
      username = data.username || data.displayName || user.email || "Anonymous";
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
      username = data.username || data.displayName || user.email || "Anonymous";
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

  return (
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
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "rgba(30, 41, 59, 0.95)",
          borderRadius: "18px",
          padding: "1.5rem",
          width: "92%",
          maxWidth: "600px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 14px 50px rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
          <h4 style={{ fontSize: "1.2rem", fontWeight: "600" }}>
            💬 Comments ({comments.length})
          </h4>
          <button
            style={{
              background: "none",
              border: "none",
              color: "#aaa",
              fontSize: "1.6rem",
              cursor: "pointer",
              transition: "color 0.2s ease",
            }}
            onClick={onClose}
            onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#aaa")}
          >
            ✕
          </button>
        </div>

        {/* Comments list */}
        <div
          style={{
            flexGrow: 1,
            overflowY: "auto",
            paddingTop: "1rem",
          }}
        >
          {comments.length === 0 ? (
            <p
              style={{
                color: "#aaa",
                textAlign: "center",
                marginTop: "2rem",
                fontStyle: "italic",
              }}
            >
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            comments.map((c) => (
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
                  <p style={{ margin: 0, fontSize: "0.95rem" }}>
                    <strong style={{ color: "#fff" }}>{c.author}:</strong>{" "}
                    {c.text}
                  </p>
                  {user?.uid === c.authorId && (
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f87171",
                        cursor: "pointer",
                        fontSize: "0.9rem",
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
                    marginTop: "0.7rem",
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
                      <p style={{ margin: 0 }}>
                        <strong style={{ color: "#fff" }}>{r.author}:</strong>{" "}
                        {r.text}
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

                {/* Reply input */}
                <ReplyInput onReply={(txt) => handleAddReply(c.id, txt)} />
              </div>
            ))
          )}
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
  );
}
