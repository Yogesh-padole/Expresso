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

  // 🔹 Like Post (transaction safe)
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

  // 🔹 Save Post (local state, optional persist later)
  const handleSave = () => {
    setSaved(!saved);
  };

  // 🔹 Load comments in real-time (with replies listener for each comment)
  useEffect(() => {
    const commentsRef = collection(db, "posts", postId, "comments");
    const unsubscribe = onSnapshot(commentsRef, async (snapshot) => {
      const commentsData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const comment = { id: docSnap.id, ...docSnap.data(), replies: [] };

          // listen to replies for each comment
          const repliesRef = collection(
            db,
            "posts",
            postId,
            "comments",
            docSnap.id,
            "replies"
          );
          onSnapshot(repliesRef, (replySnap) => {
            comment.replies = replySnap.docs.map((r) => ({
              id: r.id,
              ...r.data(),
            }));
            setComments((prev) =>
              prev.map((c) => (c.id === comment.id ? { ...comment } : c))
            );
          });

          return comment;
        })
      );
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

  // 🔹 Add reply to a comment
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
      <button className="reaction-btn" onClick={handleLike}>
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
      <button className="reaction-btn" onClick={handleSave}>
        {saved ? <FaBookmark /> : <FaRegBookmark />}
      </button>

      {/* 🔹 Comment Modal */}
      {showComments && (
        <div className="modal-overlay" onClick={() => setShowComments(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <div className="modal-header">
              <h4>Comments</h4>
              <button
                className="close-btn"
                onClick={() => setShowComments(false)}
              >
                ✕
              </button>
            </div>
            <div className="comments-list">
              {comments.map((c) => (
                <div key={c.id} className="comment-block">
                  <p>
                    <strong>{c.author}:</strong> {c.text}
                  </p>

                  {/* Replies */}
                  <div className="replies">
                    {c.replies?.map((r) => (
                      <p key={r.id} className="reply">
                        <strong>{r.author}:</strong> {r.text}
                      </p>
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
          gap: 0.8rem;
          align-items: center;
          background: transparent;
          padding: 0.5rem 0;
        }
        .reaction-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          color: #bbb;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s ease;
        }
        .reaction-btn:hover {
          color: #fff;
        }

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: #23292eff;
          padding: 1rem;
          border-radius: 10px;
          width: 90%;
          max-width: 400px;
          max-height: 80%;
          overflow-y: auto;
          color: white;
          position: relative;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .close-btn {
          background: transparent;
          border: none;
          font-size: 1.2rem;
          color: white;
          cursor: pointer;
        }
        .comments-list {
          max-height: 250px;
          overflow-y: auto;
          margin-bottom: 0.5rem;
        }
        .comment-block {
          margin-bottom: 0.5rem;
          padding: 0.3rem;
          border-bottom: 1px solid #444;
        }
        .replies {
          margin-left: 1rem;
          font-size: 0.9rem;
          color: #ccc;
        }
        .reply {
          margin: 0.2rem 0;
        }
        .comment-input {
          display: flex;
          gap: 0.5rem;
        }
        .comment-input input {
          flex: 1;
          padding: 0.4rem;
          border-radius: 5px;
          border: 1px solid #444;
          background: transparent;
          color: white;
        }
        .comment-input button {
          background: #5292ce;
          color: white;
          border: none;
          padding: 0.4rem 0.8rem;
          border-radius: 5px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

/* 🔹 Small reply input component */
function ReplyInput({ onReply }) {
  const [reply, setReply] = useState("");
  return (
    <div className="reply-input" style={{ display: "flex", gap: "0.4rem", marginTop: "0.3rem" }}>
      <input
        type="text"
        placeholder="Reply..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        style={{
          flex: 1,
          padding: "0.3rem",
          borderRadius: "5px",
          border: "1px solid #444",
          background: "transparent",
          fontSize: "0.6rem",
          height: "fit-content",
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
          padding: "0.3rem 0.6rem",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "0.6rem",
          height: "fit-content",
        }}
      >
        Reply
      </button>
    </div>
  );
}
