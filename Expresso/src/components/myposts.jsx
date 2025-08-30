import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";

import Header from "../views/header";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [hideIdentity, setHideIdentity] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch only current user's posts
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "posts"),
      where("authorId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  // ✅ Add new post
  const handleAddPost = async () => {
    if (!content.trim() || !title.trim()) return;

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to post");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        tags: tags.split(",").map((t) => t.trim()),
        author: hideIdentity ? "Anonymous" : user.displayName || user.email,
        authorId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Reset form
      setTitle("");
      setContent("");
      setTags("");
      setHideIdentity(false);
      setShowPostForm(false);
    } catch (error) {
      console.error("Error adding post: ", error);
    }
    setLoading(false);
  };

  // ✅ Delete post
  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (error) {
      console.error("Error deleting post: ", error);
    }
  };

  return (
    <>
      <Header />
      <div className="my-posts-container">
        <h2>📌 My Posts</h2>
        <p className="subtitle">Add, manage, and view your stories here.</p>

        {/* Floating Add Button */}
        <button className="floating-btn" onClick={() => setShowPostForm(true)}>
          +
        </button>

        {/* Overlay Post Form */}
        {showPostForm && (
          <div className="overlay">
            <div className="post-modal">
              <button
                className="close-btn"
                onClick={() => setShowPostForm(false)}
              >
                ✖
              </button>
              <h3>✍️ Create a Story</h3>
              <input
                type="text"
                placeholder="Title / Caption"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                placeholder="Write your story..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <label className="anon-toggle">
                <input
                  type="checkbox"
                  checked={hideIdentity}
                  onChange={() => setHideIdentity(!hideIdentity)}
                />
                Post anonymously
              </label>
              <button
                className="post-btn"
                onClick={handleAddPost}
                disabled={loading}
              >
                {loading ? "Posting..." : "🚀 Publish"}
              </button>
            </div>
          </div>
        )}

        {/* User Posts List */}
        <div className="posts-list">
          {posts.length === 0 ? (
            <p className="no-posts">✨ No posts yet. Start by adding one!</p>
          ) : (
            posts.map((post) => (
              <div className="post-card" key={post.id}>
                <div className="post-header">
                  <h4>{post.title}</h4>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    🗑
                  </button>
                </div>
                <p>{post.content}</p>
                {post.tags && post.tags.length > 0 && (
                  <small className="tags">
                    #{post.tags.join(" #")}
                  </small>
                )}
                <br />
                <small className="author">✍️ {post.author || "Anonymous"}</small>
              </div>
            ))
          )}
        </div>

        {/* ✅ Navigate to Dashboard */}
        <button className="dashboard-btn" onClick={() => navigate("/dashboard")}>
          🌍 Go to Public Posts
        </button>
      </div>

      {/* Styles */}
      <style>{`
        .my-posts-container {
          max-width: 750px;
          margin: auto;
          padding: 1.5rem;
          position: relative;
          color: #dce7f3;
          text-align: center;
        }
        h2 {
          color: #a8c9ff;
          margin-bottom: 0.3rem;
        }
        .subtitle {
          font-size: 0.95rem;
          color: #9dbce2;
          margin-bottom: 1rem;
        }
        .floating-btn {
          position: fixed;
          bottom: 25px;
          right: 25px;
          width: 65px;
          height: 65px;
          background: linear-gradient(145deg, #4c8dd4, #3b6fa5);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 2rem;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0px 6px 20px rgba(76, 141, 212, 0.6),
                      0px 0px 15px rgba(76, 141, 212, 0.4) inset;
          transition: all 0.25s ease-in-out;
          z-index: 100;
        }
        .floating-btn:hover {
          transform: scale(1.2) rotate(10deg);
          box-shadow: 0px 8px 25px rgba(76, 141, 212, 0.8),
                      0px 0px 20px rgba(76, 141, 212, 0.6) inset;
        }
        .overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          background: rgba(10, 20, 40, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .post-modal {
          background: rgba(25, 40, 70, 0.95);
          padding: 1.5rem;
          border-radius: 14px;
          width: 90%;
          max-width: 500px;
          position: relative;
          box-shadow: 0px 10px 25px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from {opacity: 0; transform: scale(0.95);}
          to {opacity: 1; transform: scale(1);}
        }
        .close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          border: none;
          background: transparent;
          font-size: 1.5rem;
          cursor: pointer;
          color: #fff;
        }
        input, textarea {
          width: 100%;
          margin-bottom: 0.8rem;
          padding: 0.7rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 1rem;
          background: rgba(255,255,255,0.07);
          color: #e5f0ff;
        }
        input::placeholder, textarea::placeholder {
          color: #a6b9d6;
        }
        textarea {
          height: 90px;
        }
        .anon-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: #bcd2f5;
        }
        .post-btn {
          width: 100%;
          padding: 0.7rem;
          border: none;
          background: linear-gradient(145deg, #3b6fa5, #4c8dd4);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.25s;
        }
        .post-btn:hover {
          background: linear-gradient(145deg, #4c8dd4, #3b6fa5);
          transform: translateY(-2px);
        }
        .posts-list {
          margin-top: 1.5rem;
        }
        .no-posts {
          color: #aabbd6;
          font-style: italic;
        }
        .post-card {
          background: rgba(20, 35, 60, 0.8);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 12px;
          box-shadow: 0px 3px 10px rgba(0,0,0,0.2);
          transition: all 0.25s ease;
          text-align: left;
        }
        .post-card:hover {
          transform: scale(1.02);
          box-shadow: 0px 6px 18px rgba(0,0,0,0.3);
        }
        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .delete-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          color: #ff6b6b;
          transition: transform 0.2s ease;
        }
        .delete-btn:hover {
          transform: scale(1.2);
          color: #ff4b4b;
        }
        .post-card h4 {
          margin-bottom: 0.3rem;
          color: #a8c9ff;
        }
        .post-card p {
          margin-bottom: 0.5rem;
          color: #d4e3f7;
          line-height: 1.5;
        }
        .tags {
          color: #9ec8ff;
        }
        .author {
          display: block;
          margin-top: 0.3rem;
          color: #8faed1;
        }
        .dashboard-btn {
          margin-top: 1rem;
          padding: 0.7rem 1.2rem;
          border: none;
          border-radius: 8px;
          background: linear-gradient(145deg, #4c8dd4, #3b6fa5);
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: 0.25s;
        }
        .dashboard-btn:hover {
          background: linear-gradient(145deg, #3b6fa5, #4c8dd4);
          transform: translateY(-2px);
        }
      `}</style>
    </>
  );
}
