import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Feedback({ onClose }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    suggestion: "",
    stars: 0,
  });
  const navigate = useNavigate();

  // ✅ Ensure auth persistence
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((err) =>
      console.error("Persistence error:", err),
    );
  }, []);

  // ✅ Auto-fill logged-in user info
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFormData((prev) => ({
          ...prev,
          username: user.displayName || "Anonymous",
          email: user.email || "",
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStarClick = (starValue) => {
    setFormData((prev) => ({ ...prev, stars: starValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "feedbacks"), {
        ...formData,
        date: serverTimestamp(),
      });

      // ✅ Navigate to dashboard after successful submission
      navigate("/dashboard");
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  return (
    <div className="feedback-overlay">
      <div className="feedback-container">
        {/* ✅ Top left: Go to Public Posts */}
        <button className="public-btn" onClick={() => navigate("/dashboard")}>
          ← Public Posts
        </button>

        {/* ✅ Close button */}
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <h2>🌟 Share Your Feedback</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="hidden"
            name="username"
            value={formData.username}
            readOnly
          />
          <input type="hidden" name="email" value={formData.email} readOnly />

          <label>
            Suggestions:
            <textarea
              name="suggestion"
              value={formData.suggestion}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Rating:
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${formData.stars >= star ? "filled" : ""}`}
                  onClick={() => handleStarClick(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </label>

          <button type="submit" className="btn submit-btn">
            Submit
          </button>
        </form>
      </div>

      {/* 💅 CSS Styles */}
      <style>{`
        .feedback-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
        }
        .feedback-container {
          position: relative;
          width: 90%; max-width: 480px;
          padding: 25px 20px 30px;
          border-radius: 15px;
          background: linear-gradient(135deg, #34495e, #2c3e50);
          color: white;
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }

        .close-btn {
          position: absolute;
          top: 10px; right: 15px;
          background: transparent; border: none;
          font-size: 1.8rem; color: white;
          cursor: pointer; transition: color 0.2s;
        }
        .close-btn:hover { color: #e74c3c; }

        .public-btn {
          position: absolute;
          top: 10px; left: 15px;
          background: transparent;
          border: 1px solid #9ec8ff;
          padding: 5px 10px;
          border-radius: 6px;
          color: #9ec8ff;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .public-btn:hover { background: #9ec8ff33; }

        h2 { text-align: center; margin-bottom: 20px; font-size: 1.5rem; }

        form { display: flex; flex-direction: column; gap: 15px; }
        label { display: flex; flex-direction: column; font-size: 0.95rem; }

        textarea {
          padding: 12px; border-radius: 8px;
          border: 1px solid #ddd;
          margin-top: 6px; font-size: 1rem;
          background: #fff; color: #333;
          resize: vertical; min-height: 100px;
        }
        textarea:focus {
          border-color: #27ae60; outline: none;
          box-shadow: 0 0 5px rgba(39,174,96,0.6);
        }

        .stars {
          display: flex; gap: 6px;
          font-size: 1.6rem;
          margin-top: 8px; cursor: pointer;
        }
        .star { color: #ccc; transition: color 0.2s ease; }
        .star.filled { color: gold; }

        .btn.submit-btn {
          background: #27ae60; color: white;
          border: none; padding: 12px;
          cursor: pointer; border-radius: 10px;
          font-size: 1rem; transition: background 0.3s ease;
        }
        .btn.submit-btn:hover { background: #2ecc71; }

        @media (max-width: 600px) {
          .feedback-container { padding: 20px; }
          h2 { font-size: 1.3rem; }
          textarea { font-size: 0.95rem; }
          .stars { font-size: 1.4rem; }
        }
      `}</style>
    </div>
  );
}
