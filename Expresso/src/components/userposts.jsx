import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
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

// ✅ Predefined Report Reasons
const reportReasons = [
  "Spam",
  "Inappropriate content",
  "Harassment",
  "Fake news",
  "Other",
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
  const [showReportReasonsForPost, setShowReportReasonsForPost] =
    useState(null); // postId
  const [userReports, setUserReports] = useState([]); // postIds reported by user
  const [error, setError] = useState(""); // validation errors
  const [expandedPosts, setExpandedPosts] = useState([]);

  const user = auth.currentUser;

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
    if (!title.trim()) {
      setError("⚠️ Please add a title for your story.");
      return;
    }
    if (!content.trim()) {
      setError("⚠️ Please write some content for your story.");
      return;
    }
    if (selectedTags.length === 0) {
      setError("⚠️ Please select at least one tag.");
      return;
    }
    if (!user) {
      alert("You must be logged in to post");
      return;
    }

    setError("");
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
      alert("Failed to post. Try again.");
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
  // 🔹 Report post
  const handleReportPost = async (postId, reason) => {
    if (!user) {
      alert("You must be logged in to report");
      return;
    }
    if (userReports.includes(postId)) return;

    // get post details
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    try {
      await addDoc(collection(db, "reports"), {
        postId,
        reportedBy: user.uid, // reporter UID
        reportedByEmail: user.email || null, // reporter email
        reason,
        createdAt: serverTimestamp(),

        // extra fields from post
        postTitle: post.title || null,
        postAuthor: post.author || "Anonymous",
        postAuthorId: post.authorId || null, // optional if you want UID
      });

      setUserReports((prev) => [...prev, postId]);
      setShowReportReasonsForPost(null);
      setOpenMenu(null);
      alert("Post reported successfully ✅");
    } catch (err) {
      console.error("Error reporting post:", err);
      alert("Failed to report. Try again.");
    }
  };

  const toggleExpand = (postId) => {
    setExpandedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
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
            <button
              className="close-btn"
              onClick={() => setShowPostForm(false)}
            >
              ✖
            </button>
            <h3>Create a Story</h3>
            {error && <p className="error-msg">{error}</p>}
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
                    className={`tag-btn ${
                      selectedTags.includes(tag) ? "selected" : ""
                    }`}
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
        {posts.length === 0 ? (
          <p>No posts yet. Be the first to share something!</p>
        ) : (
          posts.map((post) => (
            <div className="post" key={post.id}>
              <div className="post-header">
                <h4>{post.title}</h4>

                {/* Three dots menu */}
                <div className="menu-wrapper">
                  <button
                    className="menu-btn"
                    onClick={() =>
                      setOpenMenu(openMenu === post.id ? null : post.id)
                    }
                  >
                    ⋮
                  </button>

                  {openMenu === post.id && (
                    <div className="menu-dropdown">
                      {userReports.includes(post.id) ? (
                        <button disabled>Reported</button>
                      ) : showReportReasonsForPost === post.id ? (
                        reportReasons.map((reason) => (
                          <button
                            key={reason}
                            onClick={() => handleReportPost(post.id, reason)}
                          >
                            {reason}
                          </button>
                        ))
                      ) : (
                        <button
                          onClick={() => setShowReportReasonsForPost(post.id)}
                        >
                          Report
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <p
                className={`post-content ${
                  expandedPosts.includes(post.id) ? "expanded" : ""
                }`}
                onClick={() => toggleExpand(post.id)}
              >
                {post.content}
              </p>

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
              <small className="post-author">
                — {post.author || "Anonymous"}
              </small>

              {/* Like/Reaction */}
              <Reaction postId={post.id} />
            </div>
          ))
        )}
      </div>

      {/* Styles */}
      <style>{`
         body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          background-attachment: fixed; /* parallax-like */
          color: white;
        }
        .user-posts-container {
          max-width: 700px;
          margin: auto;
          padding: 1rem;
          color: #dce7f3;
        }

        h2 { color: #a8c9ff; margin-bottom: 0.2rem; margin-top:100px; font-size: 1.8rem; }
        p { margin-bottom: 1.2rem; color: #bcd2f5; font-size: 1rem; }

        .post-content {
          color: #d4e3f7;
          font-size: 0.95rem;
          margin-bottom: 0.3rem;
          white-space: pre-wrap;
          word-break: break-word;
        }

        @media (max-width: 600px) {
          .post-content {
            display: -webkit-box;
            -webkit-line-clamp: 8;
            -webkit-box-orient: vertical;
            overflow: hidden;
            cursor: pointer;
          }

          .post-content::after {
            content: " ... Read more";
            color: #9ec8ff;
            font-size: 0.85rem;
          }

          .post-content.expanded { display: block; }
          .post-content.expanded::after { content: ""; }
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
          z-index: 100;
        }

        .floating-btn:hover { transform: scale(1.15) rotate(8deg); }

        .overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 1rem;
        }

        .post-modal {
          background: rgba(25,40,70,0.95);
          padding: 1.5rem;
          border-radius: 12px;
          width: 100%; max-width: 500px;
          position: relative;
          box-shadow: 0px 8px 20px rgba(0,0,0,0.4);
          color: #dce7f3;
        }

        .close-btn {
          position: absolute; top: 10px; right: 10px;
          border: none; background: transparent;
          font-size: 1.5rem; cursor: pointer; color: #fff;
        }

        input, textarea {
          width: 100%; margin-bottom: 0.8rem; padding: 0.6rem;
          border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.05); color: #e5f0ff; font-size: 1rem;
        }
        textarea { height: 80px; resize: vertical; }

        .post-btn {
          padding: 0.6rem 1.2rem; border: none;
          background: linear-gradient(145deg, #3b6fa5, #4c8dd4);
          color: white; border-radius: 8px; cursor: pointer;
          font-weight: bold; width: 100%; font-size: 1rem;
        }

        .tag-selector p { color: #bcd2f5; margin-bottom: 0.5rem; font-size: 0.95rem; }
        .tags-grid { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1rem; }

        .tag-btn {
          padding: 5px 10px; border-radius: 20px; border: 1px solid #4c8dd4;
          background: transparent; color: #a8c9ff; cursor: pointer; font-size: 0.85rem;
        }
        .tag-btn.selected { background: #4c8dd4; color: white; }

        .anon-toggle { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;
          color: #bcd2f5; font-size: 0.9rem; cursor: pointer; }
        .anon-toggle input[type="checkbox"] {
          appearance: none; width: 36px; height: 18px; background: #3b6fa5;
          border-radius: 20px; position: relative; outline: none; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .anon-toggle input[type="checkbox"]::before {
          content: ""; position: absolute; width: 14px; height: 14px; border-radius: 50%;
          top: 2px; left: 2px; background: white; transition: transform 0.3s ease;
        }
        .anon-toggle input[type="checkbox"]:checked::before { transform: translateX(18px); }

        .posts-list .post {
          background: rgba(20,35,60,0.7);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0.8rem; margin-bottom: 0.8rem; border-radius: 10px;
          position: relative; word-break: break-word;
        }

        .posts-list .post h4 { margin-bottom: 0.3rem; color: #a8c9ff; font-size: 1.1rem; }
        .posts-list .post p { margin-bottom: 0.3rem; color: #d4e3f7; font-size: 0.95rem; }
        .post-tags { color: #9ec8ff; font-size: 0.85rem; }
        .tag-link { color: #9ec8ff; margin-right: 6px; text-decoration: none; }
        .tag-link:hover { text-decoration: underline; }
        .post-author { color: #8faed1; font-size: 0.8rem; }

        .menu-wrapper { position: absolute; top: 10px; right: 10px; display: inline-block; }
        .menu-btn { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #bcd2f5; }
        .menu-dropdown {
          position: absolute; right: 0; top: 25px; background: #2b3e5c;
          border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
          padding: 0.3rem 0.5rem; z-index: 10;
          display: flex; flex-direction: column; gap: 6px;
        }
        .menu-dropdown button {
          display: block; padding: 0.4rem 0.8rem; background: transparent;
          border: none; text-align: left; color: #dce7f3; cursor: pointer;
          font-size: 0.9rem; white-space: nowrap;
        }
        .menu-dropdown button:hover:not(:disabled) { background: rgba(255,255,255,0.15); border-radius: 4px; }

        @media (max-width: 600px) {
          .user-posts-container { padding: 0.5rem; }
          .post-modal { padding: 1rem; max-width: 95%; }
          .post-btn { font-size: 0.95rem; }
          .tag-btn { font-size: 0.8rem; padding: 4px 8px; }
          .posts-list .post h4 { font-size: 1rem; }
          .posts-list .post p { font-size: 0.9rem; }
          .post-tags { font-size: 0.75rem; }
          .post-author { font-size: 0.7rem; }
          .menu-dropdown { right: 0; top: 30px; min-width: 120px; padding: 0.5rem 0; border-radius: 8px; }
          .menu-dropdown button { font-size: 0.9rem; padding: 0.5rem 1rem; width: 100%; text-align: left; }
          .menu-btn { font-size: 1.4rem; padding: 4px; }
        }
      `}</style>
    </div>
  );
}
