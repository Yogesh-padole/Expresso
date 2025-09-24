import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Reaction from "../components/reaction";

// ✅ Same predefined tags
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

export default function TagPosts() {
  const { tag } = useParams(); 
  const [posts, setPosts] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState([tag]); // default select current tag
  const [hideIdentity, setHideIdentity] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ Fetch posts by tag
  useEffect(() => {
    if (!tag) return;
    const q = query(
      collection(db, "posts"),
      where("tags", "array-contains", tag),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [tag]);

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
        tags: selectedTags,
        author: hideIdentity ? "Anonymous" : user.displayName || user.email,
        authorId: user.uid,
        createdAt: serverTimestamp(),
      });
      setTitle("");
      setContent("");
      setSelectedTags([tag]);
      setHideIdentity(false);
      setShowPostForm(false);
    } catch (error) {
      console.error("Error adding post: ", error);
    }
    setLoading(false);
  };

  // ✅ Toggle selected tags
  const toggleTag = (t) => {
    if (selectedTags.includes(t)) {
      setSelectedTags(selectedTags.filter((x) => x !== t));
    } else {
      setSelectedTags([...selectedTags, t]);
    }
  };

  return (
    <div className="tag-posts-container">
      <div className="tag-header">
        <h2>#{tag}</h2>
        <p>Explore posts related to <strong>{tag}</strong></p>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ⬅ Go to Public Posts
        </button>
      </div>

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

            {/* ✅ Tag Selector */}
            <div className="tag-selector">
              <p>Select Tags:</p>
              <div className="tags-grid">
                {availableTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`tag-btn ${selectedTags.includes(t) ? "selected" : ""}`}
                    onClick={() => toggleTag(t)}
                  >
                    #{t}
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

      <div className="posts-list">
        {posts.length === 0 ? (
          <p>No posts yet under #{tag}. Be the first!</p>
        ) : (
          posts.map((post) => (
            <div className="post" key={post.id}>
              <h4>{post.title}</h4>
              <p>{post.content}</p>

              {/* Show tags */}
              {post.tags?.length > 0 && (
                <small className="post-tags">
                  Tags:{" "}
                  {post.tags.map((t) => (
                    <Link key={t} to={`/tags/${t}`} className="tag-link">
                      #{t}
                    </Link>
                  ))}
                </small>
              )}
              <br />
              <small className="post-author">— {post.author || "Anonymous"}</small>
              <Reaction postId={post.id} />
            </div>
          ))
        )}
      </div>

      {/* Styles */}
      <style>{`
        .tag-posts-container {
          max-width: 700px;
          margin: auto;
          padding: 1rem;
          color: #dce7f3;
          position: relative;
        }
        .tag-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.2rem;
        }
        h2 {
          color: #a8c9ff;
        }
        p {
          color: #bcd2f5;
        }
        .back-btn {
          align-self: flex-start;
          padding: 0.5rem 1rem;
          border: none;
          background: linear-gradient(145deg, #3b6fa5, #4c8dd4);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
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
        }
        .floating-btn:hover {
          transform: scale(1.15) rotate(8deg);
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
        textarea {
          height: 80px;
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
          margin-bottom: 0.8rem;
          border-radius: 10px;
          box-shadow: 0px 2px 8px rgba(0,0,0,0.2);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .posts-list .post:hover {
          transform: translateY(-3px);
          box-shadow: 0px 4px 12px rgba(0,0,0,0.3);
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
                  .anon-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
  color: #bcd2f5;
  font-size: 0.95rem;
  cursor: pointer;
}

/* Hide default checkbox */
.anon-toggle input[type="checkbox"] {
  appearance: none;
  width: 40px;
  height: 20px;
  background: #3b6fa5;
  border-radius: 20px;
  position: relative;
  outline: none;
  cursor: pointer;
  transition: background 0.3s ease;
  border: 1px solid rgba(255,255,255,0.2);
}

/* The circle knob */
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

/* Checked state */
.anon-toggle input[type="checkbox"]:checked {
  background: #4c8dd4;
}

.anon-toggle input[type="checkbox"]:checked::before {
  transform: translateX(20px);
}
      `}</style>
    </div>
  );
}
