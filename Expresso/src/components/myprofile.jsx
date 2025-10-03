import React, { useEffect, useState } from "react";
import Header from "../views/header";
import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function MyProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState({ name: "", bio: "" });
  const [editing, setEditing] = useState(false);
  const [reports, setReports] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [newDiary, setNewDiary] = useState({
    title: "",
    content: "",
    mood: "",
  });
  const [showDiaryForm, setShowDiaryForm] = useState(false);

  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        await setDoc(docRef, {
          name: user.displayName || "New User",
          bio: "",
          email: user.email,
        });
        setProfile({ name: user.displayName || "New User", bio: "" });
      }
    };
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), {
      ...profile,
      email: user.email,
      updatedAt: serverTimestamp(),
    });
    setEditing(false);
  };

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "reports"),
      where("reportedBy", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, async (snap) => {
      const reportsData = await Promise.all(
        snap.docs.map(async (docSnap) => {
          const report = { id: docSnap.id, ...docSnap.data() };
          if (report.postId) {
            const postSnap = await getDoc(doc(db, "posts", report.postId));
            report.postData = postSnap.exists() ? postSnap.data() : null;
          }
          return report;
        })
      );
      setReports(reportsData);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "diaryEntries"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setDiaryEntries(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  const handleAddDiary = async () => {
    if (!newDiary.title.trim() || !newDiary.content.trim()) return;
    try {
      await addDoc(collection(db, "diaryEntries"), {
        ...newDiary,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewDiary({ title: "", content: "", mood: "" });
      setShowDiaryForm(false);
    } catch (err) {
      console.error("Error adding diary:", err);
    }
  };

  const handleDeleteDiary = async (id) => {
    try {
      await deleteDoc(doc(db, "diaryEntries", id));
    } catch (err) {
      console.error("Error deleting diary:", err);
    }
  };

  return (
    <>
      <Header />
      <div className="my-profile-container">
        <h2 className="title">✨ My Profile ✨</h2>

        <div className="tabs">
          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={activeTab === "reports" ? "active" : ""}
            onClick={() => setActiveTab("reports")}
          >
            My Reports
          </button>
          <button
            className={activeTab === "diary" ? "active" : ""}
            onClick={() => setActiveTab("diary")}
          >
            My Diary
          </button>
        </div>

        {/* Profile Info */}
        {activeTab === "profile" && (
          <div className="profile-info card">
            {editing ? (
              <>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  placeholder="Name"
                />
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  placeholder="Write your bio..."
                />
                <div className="btn-group">
                  <button onClick={handleSaveProfile}>💾 Save</button>
                  <button onClick={() => setEditing(false)}>❌ Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p>
                  <b>Name:</b> {profile.name}
                </p>
                <p>
                  <b>Email:</b> {user?.email}
                </p>
                <p>
                  <b>Bio:</b> {profile.bio || "No bio yet."}
                </p>
                <div className="btn-group">
                  <button onClick={() => setEditing(true)}>
                    ✏️ Edit Profile
                  </button>
                  <button onClick={() => navigate("/dashboard")}>
                    🌍 Go to Public Posts
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Reports Section */}
        {activeTab === "reports" && (
          <div className="reports-section card">
            <h3>📑 My Reports</h3>
            {reports.length === 0 ? (
              <p>No reports submitted.</p>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="report-card sub-card">
                  {r.postData ? (
                    <>
                      <h4>{r.postData.title}</h4>
                      <p>{r.postData.content}</p>
                      {r.postData.tags?.length > 0 && (
                        <p>
                          {r.postData.tags.map((tag) => (
                            <span key={tag} className="tag">
                              #{tag}{" "}
                            </span>
                          ))}
                        </p>
                      )}
                      <p>
                        <b>Reported Reason:</b> {r.reason}
                      </p>
                      <small>
                        Reported At:{" "}
                        {r.createdAt?.toDate().toLocaleString() || "Just now"}
                      </small>
                      <p>
                        <b>Status:</b> {r.status || "pending"}
                      </p>
                      <p>
                        <b>Resolved:</b> {r.resolved ? "✅ Yes" : "❌ No"}
                      </p>
                      {r.resolutionNote && (
                        <p>
                          <b>Resolution Note:</b> {r.resolutionNote}
                        </p>
                      )}
                      {r.resolvedAt && (
                        <small>
                          Resolved At: {r.resolvedAt.toDate().toLocaleString()}
                        </small>
                      )}
                    </>
                  ) : (
                    <p>This post has been deleted.</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Diary Section */}
        {activeTab === "diary" && (
          <div className="diary-section card">
            <h3>📖 My Diary</h3>
            <button
              className="add-diary-btn"
              onClick={() => setShowDiaryForm(true)}
            >
              ➕ Add Diary
            </button>

            {showDiaryForm && (
              <div className="overlay">
                <div className="diary-modal">
                  <button
                    className="close-btn"
                    onClick={() => setShowDiaryForm(false)}
                  >
                    ✖
                  </button>
                  <h3>📝 Add Diary Entry</h3>
                  <input
                    type="text"
                    placeholder="Title"
                    value={newDiary.title}
                    onChange={(e) =>
                      setNewDiary({ ...newDiary, title: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Write your entry..."
                    value={newDiary.content}
                    onChange={(e) =>
                      setNewDiary({ ...newDiary, content: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Mood (Happy, Sad, etc.)"
                    value={newDiary.mood}
                    onChange={(e) =>
                      setNewDiary({ ...newDiary, mood: e.target.value })
                    }
                  />
                  <button onClick={handleAddDiary}>💾 Save Entry</button>
                </div>
              </div>
            )}

            {diaryEntries.length === 0 ? (
              <p>No diary entries yet.</p>
            ) : (
              diaryEntries.map((entry) => (
                <div key={entry.id} className="diary-card sub-card">
                  <h4>
                    {entry.title} <small>({entry.mood})</small>
                  </h4>
                  <p>{entry.content}</p>
                  <small>
                    {entry.createdAt?.toDate().toLocaleString() || "Just now"}
                  </small>
                  <button onClick={() => handleDeleteDiary(entry.id)}>
                    🗑️ Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <style>{`
          /* Container */
          .my-profile-container {
            max-width: 900px;
            margin: 80px auto 20px;
            padding: 1rem;
            color: #e5f0ff;
            background: rgba(20,35,60,0.8);
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.5);
          }

          /* Title */
          .title {
            text-align: center;
            margin-bottom: 1.5rem;
            font-size: 2.2rem;
            background: linear-gradient(90deg, #4c8dd4, #6fa8dc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: 700;
          }

          /* Tabs */
          .tabs {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 1.5rem;
          }
          .tabs button {
            padding: 0.7rem 1.5rem;
            border-radius: 30px;
            border: none;
            background: #2d3e55;
            color: #e5f0ff;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
          }
          .tabs button.active, .tabs button:hover { background: #4c8dd4; color: #fff; }

          /* Cards */
          .card {
            background: rgba(30,45,65,0.9);
            padding: 1.2rem;
            border-radius: 15px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.5);
            margin-bottom: 1.5rem;
          }
          .sub-card {
            background: rgba(255,255,255,0.05);
            margin: 0.6rem 0;
            padding: 1rem;
            border-radius: 12px;
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .sub-card:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.3); }

          /* Inputs & Textarea */
          input, textarea {
            width: 100%;
            padding: 0.8rem;
            margin: 0.5rem 0;
            border-radius: 10px;
            border: 1px solid #555;
            background: rgba(255,255,255,0.08);
            color: #fff;
            outline: none;
            font-size: 1rem;
          }
          input:focus, textarea:focus {
            border-color: #4c8dd4;
            box-shadow: 0 0 8px #4c8dd4;
          }

          /* Buttons */
          .btn-group button, .add-diary-btn, .diary-card button {
            background: #4c8dd4;
            color: #fff;
            border: none;
            border-radius: 15px;
            padding: 0.7rem 1.4rem;
            margin: 0.3rem 0.2rem 0.3rem 0;
            cursor: pointer;
            transition: all 0.25s;
            font-weight: 500;
          }
          .btn-group button:hover, .add-diary-btn:hover, .diary-card button:hover { background: #3b6fa5; }

          .report-card h4, .diary-card h4 { color: #a8c9ff; margin-bottom: 0.4rem; }
          .report-card p, .diary-card p { line-height: 1.5; color: #dce7f3; }

          .report-card .tag { background: rgba(76,141,212,0.2); padding: 3px 6px; border-radius: 6px; margin-right: 5px; font-size: 0.85rem; }

          /* Overlay Modal */
          .overlay {
            position: fixed; top:0; left:0;
            width:100%; height:100%;
            background: rgba(0,0,0,0.7);
            display:flex; align-items:center; justify-content:center;
            z-index:1000; padding:1rem;
          }
          .diary-modal {
            background: rgba(30,45,75,0.95);
            padding:1.5rem;
            border-radius:15px;
            width:100%; max-width:500px;
            color:#e5f0ff;
            box-shadow:0 8px 20px rgba(0,0,0,0.6);
            animation: slideIn 0.3s ease;
          }
          .close-btn {
            position:absolute; top:10px; right:10px;
            border:none; background:transparent; font-size:1.5rem; color:#fff; cursor:pointer;
          }
          @keyframes slideIn { from { transform: translateY(-20px); opacity:0; } to { transform: translateY(0); opacity:1; } }

          /* Responsive */
          @media (max-width: 768px) {
            .my-profile-container { margin: 60px 10px; padding: 1rem; }
            .title { font-size: 1.8rem; }
            .tabs button { padding: 0.6rem 1.2rem; font-size: 0.95rem; }
            input, textarea { font-size: 0.95rem; padding:0.7rem; }
            .btn-group button, .add-diary-btn, .diary-card button { font-size:0.95rem; padding:0.6rem 1.2rem; border-radius:12px; }
          }
          @media (max-width: 480px) {
            .title { font-size: 1.5rem; }
            .tabs button { padding: 0.5rem 1rem; font-size: 0.9rem; }
            input, textarea { font-size: 0.9rem; padding:0.6rem; }
          }
        `}</style>
      </div>
    </>
  );
}
