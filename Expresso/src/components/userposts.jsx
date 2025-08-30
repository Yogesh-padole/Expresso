import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import Reaction from "../components/reaction";

export default function UserPosts() {
  const [posts, setPosts] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [hideIdentity, setHideIdentity] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch posts in real-time
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Add post
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

  return (
    <div className="user-posts-container">
      <h2>User Posts</h2>

      {/* Floating Button */}
      <button className="floating-btn" onClick={() => setShowPostForm(true)}>
        +
      </button>

      {/* Overlay Post Form */}
      {showPostForm && (
        <div className="overlay">
          <div className="post-modal">
            <button className="close-btn" onClick={() => setShowPostForm(false)}>
              ✖
            </button>
            <h3>Create a Story</h3>
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
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="posts-list">
        {posts.map((post) => (
          <div className="post" key={post.id}>
            <h4>{post.title}</h4>
            <p>{post.content}</p>
            {post.tags && (
              <small style={{ color: "#9ec8ff" }}>
                Tags: {post.tags.join(", ")}
              </small>
            )}
            <br />
            <small style={{ color: "#8faed1" }}>
              — {post.author || "Anonymous"}
            </small>
            {/* ✅ FIX: Pass post.id here */}
            <Reaction postId={post.id} />
          </div>
        ))}
      </div>

      <style>{`
        .user-posts-container {
          max-width: 700px;
          margin: auto;
          padding: 1rem;
          position: relative;
          color: #dce7f3;
        }
        h2, h3 {
          color: #a8c9ff;
        }
        .floating-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
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
          overflow: hidden;
        }
        .floating-btn:hover {
          transform: scale(1.15) rotate(8deg);
          box-shadow: 0px 8px 25px rgba(76, 141, 212, 0.8),
                      0px 0px 20px rgba(76, 141, 212, 0.6) inset;
        }
        .floating-btn:active {
          transform: scale(0.95);
          box-shadow: 0px 4px 15px rgba(0,0,0,0.4);
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
          background: rgba(25, 40, 70, 0.9);
          padding: 1.5rem;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          position: relative;
          box-shadow: 0px 8px 20px rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.1);
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
          padding: 0.6rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 1rem;
          background: rgba(255,255,255,0.05);
          color: #e5f0ff;
        }
        input::placeholder, textarea::placeholder {
          color: #a6b9d6;
        }
        textarea {
          height: 80px;
        }
        .anon-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: #bcd2f5;
          margin-right: 10px;
          width: fit-content;
        }
        .post-btn {
          padding: 0.6rem 1.2rem;
          border: none;
          background: linear-gradient(145deg, #3b6fa5, #4c8dd4);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          box-shadow: 0px 4px 10px rgba(0,0,0,0.3);
        }
        .posts-list .post {
          background: rgba(20, 35, 60, 0.7);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.8rem;
          margin-bottom: 0.5rem;
          border-radius: 8px;
          box-shadow: 0px 2px 8px rgba(0,0,0,0.2);
        }
        .posts-list .post h4 {
          margin-bottom: 0.3rem;
          color: #a8c9ff;
        }
        .posts-list .post p {
          margin-bottom: 0.3rem;
          color: #d4e3f7;
        }
      `}</style>
    </div>
  );
}
