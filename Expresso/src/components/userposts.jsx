import React, { useEffect, useState, useRef } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
  getDoc,
  doc,
} from "firebase/firestore";
import Reaction from "../components/reaction";
import { Link } from "react-router-dom";

// ✅ Predefined Tags
const availableTags = [
  "collegevibes",
  "friendshipgoals",
  "firstlove",
  "familyfirst",
  "memezone",
  "dreambig",
  "travelgram",
  "musiclife",
  "animeandchill",
  "foodielife",
  "mentalpeace",
  "lovestory",
];

export default function UserPosts() {
  const [posts, setPosts] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [hideIdentity, setHideIdentity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // postId
  const [userReports, setUserReports] = useState([]); // postIds reported by user

  const menuRef = useRef(null);
  const user = auth.currentUser;

  // 🔹 Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Fetch posts
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // 🔹 Fetch user's reports
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "reports"),
      where("reportedBy", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const reportedPostIds = snap.docs.map((doc) => doc.data().postId);
      setUserReports(reportedPostIds);
    });
    return () => unsub();
  }, [user]);

  // 🔹 Add new post
  const handleAddPost = async () => {
    if (!content.trim() || !title.trim()) return;
    if (!user) {
      alert("You must be logged in to post");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        title,
        content,
        tags: selectedTags,
        author: hideIdentity ? "Anonymous" : user.displayName || user.email,
        authorId: user.uid,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setContent("");
      setSelectedTags([]);
      setHideIdentity(false);
      setShowPostForm(false);
    } catch (err) {
      console.error("Error adding post:", err);
    }
    setLoading(false);
  };

  // 🔹 Toggle tag selection
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 🔹 Report post
  const handleReportPost = async (postId) => {
    if (!user) {
      alert("You must be logged in to report");
      return;
    }
    if (userReports.includes(postId)) return;

    try {
      await addDoc(collection(db, "reports"), {
        postId,
        reportedBy: user.uid,
        reason: "Inappropriate content",
        createdAt: serverTimestamp(),
      });
      alert("Post reported successfully ✅");
      setOpenMenu(null);
    } catch (err) {
      console.error("Error reporting post:", err);
    }
  };

  return (
    <div className="user-posts-container">
      <h2>Public Posts</h2>
      <p>Read stories from the community or share your own.</p>

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
            <div className="tag-selector">
              <p>Select Tags:</p>
              <div className="tags-grid">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-btn ${selectedTags.includes(tag) ? "selected" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <label className="anon-toggle">
              <input
                type="checkbox"
                checked={hideIdentity}
                onChange={() => setHideIdentity(!hideIdentity)}
              />
              Post anonymously
            </label>
            <button className="post-btn" onClick={handleAddPost} disabled={loading}>
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="posts-list">
        {posts.length === 0 ? (
          <p>No posts yet. Be the first to share something!</p>
        ) : (
          posts.map((post) => (
            <div className="post" key={post.id}>
              <div className="post-header">
                <h4>{post.title}</h4>
                {/* Three dots menu */}
                <div className="menu-wrapper" ref={menuRef}>
                  <button
                    className="menu-btn"
                    onClick={() => setOpenMenu(openMenu === post.id ? null : post.id)}
                  >
                    ⋮
                  </button>
                  {openMenu === post.id && (
                    <div className="menu-dropdown">
                      <button
                        onClick={() => handleReportPost(post.id)}
                        disabled={userReports.includes(post.id)}
                      >
                        {userReports.includes(post.id) ? "Reported" : "Report"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <p>{post.content}</p>

              {post.tags && post.tags.length > 0 && (
                <small className="post-tags">
                  Tags:{" "}
                  {post.tags.map((tag) => (
                    <Link key={tag} to={`/tags/${tag}`} className="tag-link">
                      #{tag}
                    </Link>
                  ))}
                </small>
              )}
              <br />
              <small className="post-author">— {post.author || "Anonymous"}</small>

              {/* Like/Reaction */}
              <Reaction postId={post.id} />
            </div>
          ))
        )}
      </div>

      {/* Styles */}
      <style>{`
  .user-posts-container {
    max-width: 700px;
    margin: auto;
    padding: 1rem;
    color: #dce7f3;
  }

  h2 {
    color: #a8c9ff;
    margin-bottom: 0.2rem;
  }

  p {
    margin-bottom: 1.2rem;
    color: #bcd2f5;
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
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0px 6px 20px rgba(76,141,212,0.6),
                0px 0px 15px rgba(76,141,212,0.4) inset;
    transition: all 0.25s ease-in-out;
  }

  .floating-btn:hover {
    transform: scale(1.15) rotate(8deg);
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .post-modal {
    background: rgba(25,40,70,0.95);
    padding: 1.5rem;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    position: relative;
    box-shadow: 0px 8px 20px rgba(0,0,0,0.4);
    color: #dce7f3;
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
    background: rgba(255,255,255,0.05);
    color: #e5f0ff;
  }

  textarea {
    height: 80px;
  }

  .post-btn {
    padding: 0.6rem 1.2rem;
    border: none;
    background: linear-gradient(145deg, #3b6fa5, #4c8dd4);
    color: white;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
  }

  .tag-selector p {
    color: #bcd2f5;
    margin-bottom: 0.5rem;
  }

  .tags-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 1rem;
  }

  .tag-btn {
    padding: 5px 10px;
    border-radius: 20px;
    border: 1px solid #4c8dd4;
    background: transparent;
    color: #a8c9ff;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .tag-btn.selected {
    background: #4c8dd4;
    color: white;
  }

  .anon-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1rem;
    color: #bcd2f5;
    font-size: 0.95rem;
    cursor: pointer;
  }

  .anon-toggle input[type="checkbox"] {
    appearance: none;
    width: 40px;
    height: 20px;
    background: #3b6fa5;
    border-radius: 20px;
    position: relative;
    outline: none;
    cursor: pointer;
    border: 1px solid rgba(255,255,255,0.2);
  }

  .anon-toggle input[type="checkbox"]::before {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    background: white;
    transition: transform 0.3s ease;
  }

  .anon-toggle input[type="checkbox"]:checked {
    background: #4c8dd4;
  }

  .anon-toggle input[type="checkbox"]:checked::before {
    transform: translateX(20px);
  }

  .posts-list .post {
    background: rgba(20,35,60,0.7);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 0.8rem;
    margin-bottom: 0.8rem;
    border-radius: 10px;
    position: relative;
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

  .tag-link {
    color: #9ec8ff;
    margin-right: 6px;
    text-decoration: none;
  }

  .tag-link:hover {
    text-decoration: underline;
  }

  .post-author {
    color: #8faed1;
  }

  /* Three dots menu */
  .menu-wrapper {
    position: absolute;
    top: 10px;
    right: 10px;
    display: inline-block;
  }

  .menu-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #bcd2f5;
  }

  .menu-dropdown {
    position: absolute;
    right: 0;
    top: 25px;
    background: #2b3e5c;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    padding: 0.3rem 0;
    z-index: 10;
  }

  .menu-dropdown button {
    display: block;
    width: 100%;
    padding: 0.4rem 1rem;
    background: transparent;
    border: none;
    text-align: left;
    color: #dce7f3;
    cursor: pointer;
  }

  .menu-dropdown button:hover:not(:disabled) {
    background: rgba(255,255,255,0.1);
  }

  .menu-dropdown button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`}</style>

    </div>
  );
}
