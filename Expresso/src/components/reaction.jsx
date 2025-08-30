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

  // 🔹 Listen for likes in real-time
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

  // 🔹 Like Post
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

  // 🔹 Save Post
  const handleSave = () => {
    setSaved(!saved);
  };

  // 🔹 Load comments in real-time
  useEffect(() => {
    const commentsRef = collection(db, "posts", postId, "comments");
    const unsubscribe = onSnapshot(commentsRef, async (snapshot) => {
      const commentsData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        replies: [],
      }));

      setComments(commentsData);
    });
    return () => unsubscribe();
  }, [postId]);

  // 🔹 Add comment
  const handleAddComment = async () => {
    if (!user) return alert("Login to comment");
    if (!newComment.trim()) return;

    const commentsRef = collection(db, "posts", postId, "comments");
    await addDoc(commentsRef, {
      text: newComment,
      author: user.displayName || user.email,
      authorId: user.uid,
      createdAt: serverTimestamp(),
    });
    setNewComment("");
  };

  // 🔹 Delete comment
  const handleDeleteComment = async (commentId, authorId) => {
    if (!user || user.uid !== authorId) return;
    await deleteDoc(doc(db, "posts", postId, "comments", commentId));
  };

  // 🔹 Add reply
  const handleAddReply = async (commentId, replyText) => {
    if (!user) return alert("Login to reply");
    if (!replyText.trim()) return;

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
      author: user.displayName || user.email,
      authorId: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  return (
    <div className="post-reaction">
      {/* Like */}
      <button className={`reaction-btn ${liked ? "active" : ""}`} onClick={handleLike}>
        {liked ? <FaThumbsUp /> : <FaRegThumbsUp />}{" "}
        {likesCount > 0 && <span>{likesCount}</span>}
      </button>

      {/* Comment */}
      <button className="reaction-btn" onClick={() => setShowComments(true)}>
        <FaComment /> {comments.length > 0 && <span>{comments.length}</span>}
      </button>

      {/* Share */}
      <button
        className="reaction-btn"
        onClick={() => alert("Share feature coming soon!")}
      >
        <FaShareAlt />
      </button>

      {/* Save */}
      <button className={`reaction-btn ${saved ? "active" : ""}`} onClick={handleSave}>
        {saved ? <FaBookmark /> : <FaRegBookmark />}
      </button>

      {/* 🔹 Comment Modal */}
      {showComments && (
        <div className="modal-overlay" onClick={() => setShowComments(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>💬 Comments</h4>
              <button className="close-btn" onClick={() => setShowComments(false)}>
                ✕
              </button>
            </div>
            <div className="comments-list">
              {comments.map((c) => (
                <div key={c.id} className="comment-block">
                  <div className="comment-top">
                    <p>
                      <strong>{c.author}:</strong> {c.text}
                    </p>
                    {user?.uid === c.authorId && (
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteComment(c.id, c.authorId)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>

                  {/* Replies */}
                  <div className="replies">
                    {c.replies?.map((r) => (
                      <div key={r.id} className="reply">
                        <p>
                          <strong>{r.author}:</strong> {r.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input */}
                  <ReplyInput onReply={(txt) => handleAddReply(c.id, txt)} />
                </div>
              ))}
            </div>
            <div className="comment-input">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button onClick={handleAddComment}>Post</button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .post-reaction {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding: 0.6rem 0;
        }
        .reaction-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.3rem;
          color: #aab4c3;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .reaction-btn:hover {
          color: #fff;
          transform: scale(1.1);
        }
        .reaction-btn.active {
          color: #3b82f6;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .modal-content {
          background: rgba(28, 32, 48, 0.95);
          padding: 1.2rem;
          border-radius: 12px;
          width: 90%;
          max-width: 450px;
          max-height: 75%;
          overflow-y: auto;
          color: white;
          position: relative;
          animation: fadeIn 0.25s ease-in-out;
        }
        @keyframes fadeIn {
          from {opacity: 0; transform: scale(0.95);}
          to {opacity: 1; transform: scale(1);}
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
        }
        .close-btn {
          background: transparent;
          border: none;
          font-size: 1.3rem;
          color: #ccc;
          cursor: pointer;
        }
        .comments-list {
          margin-bottom: 0.8rem;
        }
        .comment-block {
          margin-bottom: 0.7rem;
          padding: 0.5rem;
          border-left: 3px solid #3b82f6;
          background: rgba(255,255,255,0.05);
          border-radius: 6px;
        }
        .comment-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .delete-btn {
          background: transparent;
          border: none;
          color: #f87171;
          cursor: pointer;
          font-size: 1rem;
          transition: 0.2s;
        }
        .delete-btn:hover {
          color: #ef4444;
        }
        .replies {
          margin-top: 0.4rem;
          margin-left: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .reply {
          padding: 0.3rem 0.5rem;
          background: rgba(255,255,255,0.08);
          border-radius: 6px;
          font-size: 0.85rem;
        }
        .comment-input {
          display: flex;
          gap: 0.5rem;
        }
        .comment-input input {
          flex: 1;
          padding: 0.5rem;
          border-radius: 6px;
          border: 1px solid #444;
          background: rgba(255,255,255,0.05);
          color: white;
        }
        .comment-input button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 0.9rem;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.2s;
        }
        .comment-input button:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}

/* 🔹 Reply input component */
function ReplyInput({ onReply }) {
  const [reply, setReply] = useState("");
  return (
    <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem" }}>
      <input
        type="text"
        placeholder="Reply..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        style={{
          flex: 1,
          padding: "0.4rem",
          borderRadius: "6px",
          border: "1px solid #444",
          background: "rgba(255,255,255,0.05)",
          fontSize: "0.75rem",
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
          background: "#3b82f6",
          color: "white",
          border: "none",
          padding: "0.4rem 0.7rem",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.7rem",
        }}
      >
        Reply
      </button>
    </div>
  );
}
