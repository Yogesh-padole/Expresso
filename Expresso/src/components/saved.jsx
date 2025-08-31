import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Saved() {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch saved posts in real-time
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const savedIds = data.savedPosts || [];

        // Fetch posts by their IDs
        const postsData = [];
        for (const postId of savedIds) {
          const postSnap = await getDoc(doc(db, "posts", postId));
          if (postSnap.exists()) {
            postsData.push({ id: postId, ...postSnap.data() });
          }
        }
        setSavedPosts(postsData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Unsave post
  const handleUnsave = async (postId) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const updatedSaved = (data.savedPosts || []).filter((id) => id !== postId);
      await updateDoc(userRef, { savedPosts: updatedSaved });
    }
  };

  return (
    <div className="saved-container">
      <h2>Saved Posts</h2>

      <button className="nav-btn" onClick={() => navigate("/dashboard")}>
        🚀 Go to Public Posts
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : savedPosts.length === 0 ? (
        <p>No saved posts yet.</p>
      ) : (
        <div className="posts-list">
          {savedPosts.map((post) => (
            <div className="post" key={post.id}>
              <h4>{post.title}</h4>
              <p>{post.content}</p>
              {post.tags && (
                <small className="post-tags">
                  Tags: {post.tags.join(", ")}
                </small>
              )}
              <br />
              <small className="post-author">
                — {post.author || "Anonymous"}
              </small>
              <div>
                <button
                  className="unsave-btn"
                  onClick={() => handleUnsave(post.id)}
                >
                  ✖ Unsave
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .saved-container {
          max-width: 700px;
          margin: auto;
          padding: 1rem;
          color: #dce7f3;
        }
        h2 {
          color: #a8c9ff;
          margin-bottom: 0.8rem;
        }

        /* ✨ Updated Go to Public Posts Button */
        .nav-btn {
          margin-bottom: 1rem;
          padding: 0.6rem 1.4rem;
          border: none;
          border-radius: 50px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0px 4px 12px rgba(0,0,0,0.3);
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        .nav-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0px 6px 16px rgba(0,0,0,0.4);
        }

        .posts-list .post {
          background: rgba(20, 35, 60, 0.7);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.8rem;
          margin-bottom: 0.8rem;
          border-radius: 10px;
          box-shadow: 0px 2px 8px rgba(0,0,0,0.2);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .posts-list .post:hover {
          transform: translateY(-3px);
          box-shadow: 0px 4px 12px rgba(0,0,0,0.3);
        }
        .posts-list .post h4 {
          margin-bottom: 0.3rem;
          color: #a8c9ff;
        }
        .posts-list .post p {
          margin-bottom: 0.3rem;
          color: #d4e3f7;
        }
        .post-tags {
          color: #9ec8ff;
        }
        .post-author {
          color: #8faed1;
        }
        .unsave-btn {
          margin-top: 0.5rem;
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 6px;
          background: #e74c3c;
          color: white;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .unsave-btn:hover {
          background: #c0392b;
        }
      `}</style>
    </div>
  );
}
