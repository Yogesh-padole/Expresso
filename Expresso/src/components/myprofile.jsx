import React, { useEffect, useState } from "react";
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
  const [newDiary, setNewDiary] = useState({ title: "", content: "", mood: "" });
  const [showDiaryForm, setShowDiaryForm] = useState(false);

  const user = auth.currentUser;
  const navigate = useNavigate();

  // 🔹 Fetch profile info
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

  // 🔹 Save profile changes
  const handleSaveProfile = async () => {
    if (!user) return;
    await setDoc(doc(db, "users", user.uid), {
      ...profile,
      email: user.email,
      updatedAt: serverTimestamp(),
    });
    setEditing(false);
  };

  // 🔹 Fetch reports
 // 🔹 Fetch reports with post details
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


  // 🔹 Fetch diary entries
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

  // 🔹 Add diary entry
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

  // 🔹 Delete diary entry
  const handleDeleteDiary = async (id) => {
    try {
      await deleteDoc(doc(db, "diaryEntries", id));
    } catch (err) {
      console.error("Error deleting diary:", err);
    }
  };

  return (
    <div className="my-profile-container">
      <h2 className="title">✨ My Profile ✨</h2>

      {/* Tab Navigation */}
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
                <button onClick={() => setEditing(true)}>✏️ Edit Profile</button>
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

          {/* Overlay Form */}
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

          {/* Show Entries */}
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
        .title {
          text-align: center;
          margin-bottom: 1rem;
          font-size: 1.8rem;
          background: linear-gradient(90deg, #4c8dd4, #6fa8dc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tabs { 
          display: flex; 
          gap: 1rem; 
          margin-bottom: 1rem; 
          justify-content: center;
        }

        .report-card {
  background: rgba(50, 70, 100, 0.85);
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  color: #dce7f3;
  transition: transform 0.2s, box-shadow 0.2s;
}
.report-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.3);
}
.report-card h4 {
  color: #a8c9ff;
  margin-bottom: 0.5rem;
}
.report-card p {
  margin: 0.3rem 0;
  line-height: 1.4;
}
.report-card .tag {
  background: rgba(76,141,212,0.2);
  padding: 2px 6px;
  border-radius: 6px;
  margin-right: 4px;
  font-size: 0.85rem;
}

        .tabs button { 
          padding: 0.6rem 1.2rem; 
          cursor: pointer; 
          border: none; 
          border-radius: 20px;
          background: #2d3e55;
          color: #dce7f3;
          transition: all 0.3s ease;
        }
        .tabs button:hover { background: #4c8dd4; }
        .tabs .active { background: #4c8dd4; color: #fff; font-weight: bold; }

        .card {
          background: rgba(20, 35, 60, 0.8);
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.4);
          margin-bottom: 1rem;
          color: #dce7f3;
        }
        .sub-card {
          background: rgba(255,255,255,0.05);
          margin: 0.5rem 0;
          padding: 0.8rem;
          border-radius: 8px;
          transition: transform 0.2s;
        }
        .sub-card:hover { transform: scale(1.02); }

        input, textarea {
          width: 100%;
          margin: 0.5rem 0;
          padding: 0.7rem;
          border-radius: 6px;
          border: 1px solid #555;
          background: rgba(255,255,255,0.08);
          color: #fff;
          outline: none;
        }
        input:focus, textarea:focus {
          border-color: #4c8dd4;
          box-shadow: 0 0 6px #4c8dd4;
        }

        .btn-group { margin-top: 0.5rem; }
        button {
          background: #4c8dd4;
          color: white;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          margin: 0.3rem;
          transition: background 0.3s;
        }
        button:hover { background: #3b6fa5; }

        .add-diary-btn {
          margin: 0.8rem 0;
          font-weight: bold;
          border-radius: 20px;
          padding: 0.6rem 1.2rem;
        }

        .overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .diary-modal {
          background: rgba(30, 45, 75, 0.95);
          padding: 1.5rem;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          position: relative;
          color: #dce7f3;
          box-shadow: 0 8px 20px rgba(0,0,0,0.6);
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
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
      `}</style>
    </div>
  );
}
