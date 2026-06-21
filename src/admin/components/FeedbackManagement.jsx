// FeedbackManagement.js
import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
// import { collection, getDocs } from "firebase/firestore";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

import { db } from "../../firebase/firebase";
const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const feedbacksRef = collection(db, "feedbacks");

        // 👇 query with orderBy
        const q = query(feedbacksRef, orderBy("date", "desc"));
        const snapshot = await getDocs(q);

        const feedbackList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFeedbacks(feedbackList);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
        setError("Failed to load feedbacks");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const getFeedbackBadge = (stars) => {
    if (stars >= 4)
      return {
        text: "Positive",
        className: "positive",
      };

    if (stars === 3)
      return {
        text: "Neutral",
        className: "neutral",
      };

    return {
      text: "Negative",
      className: "negative",
    };
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesSearch = [fb.username, fb.email, fb.suggestion]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesRating =
      ratingFilter === "all" ? true : fb.stars === Number(ratingFilter);

    return matchesSearch && matchesRating;
  });

  const exportToCSV = () => {
    const headers = ["Username", "Email", "Stars", "Suggestion", "Date"];

    const rows = filteredFeedbacks.map((fb) => [
      fb.username || "",
      fb.email || "",
      fb.stars || "",
      `"${fb.suggestion || ""}"`,
      fb.date?.seconds
        ? new Date(fb.date.seconds * 1000).toLocaleString()
        : fb.date || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `feedbacks_${Date.now()}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p>Loading feedbacks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="reports">
      <div className="section-header">
        <h2 className="headings">Feedback Management</h2>
      </div>

      {/* Stats Cards */}
      <div className="feedback-stats">
        <div className="stat-card">
          <h3>{feedbacks.length}</h3>
          <p>Total Feedbacks</p>
        </div>

        <div className="stat-card">
          <h3>{feedbacks.filter((f) => f.stars >= 4).length}</h3>
          <p>Positive</p>
        </div>

        <div className="stat-card">
          <h3>{feedbacks.filter((f) => f.stars === 3).length}</h3>
          <p>Neutral</p>
        </div>

        <div className="stat-card">
          <h3>{feedbacks.filter((f) => f.stars <= 2).length}</h3>
          <p>Negative</p>
        </div>

        <div className="stat-card">
          <h3>
            {feedbacks.length
              ? (
                  feedbacks.reduce((sum, fb) => sum + fb.stars, 0) /
                  feedbacks.length
                ).toFixed(1)
              : "0"}
          </h3>
          <p>Average Rating</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="feedback-toolbar">
        <input
          type="text"
          placeholder="Search feedback..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Ratings</option>
          <option value="5">⭐⭐⭐⭐⭐</option>
          <option value="4">⭐⭐⭐⭐</option>
          <option value="3">⭐⭐⭐</option>
          <option value="2">⭐⭐</option>
          <option value="1">⭐</option>
        </select>

        <button onClick={exportToCSV} className="export-btn">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {filteredFeedbacks.length === 0 ? (
        <p>No feedbacks found.</p>
      ) : (
        <table className="reports-table">
          <thead>
            <tr className="bg-gray-200">
              <th className="gray-400 px-4 py-2">Username</th>
              <th className="gray-400 px-4 py-2">Email</th>
              <th className="gray-400 px-4 py-2">Stars</th>
              <th>Type</th>
              <th className="gray-400 px-4 py-2">Suggestion</th>
              <th className="gray-400 px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedbacks.map((fb) => (
              <tr key={fb.id}>
                <td className="gray-400 px-4 py-2">{fb.username}</td>
                <td className="gray-400 px-4 py-2">{fb.email}</td>
                <td>
                  <span className="rating-stars">{"⭐".repeat(fb.stars)}</span>
                </td>
                <td>
                  <span
                    className={`feedback-badge ${
                      getFeedbackBadge(fb.stars).className
                    }`}
                  >
                    {getFeedbackBadge(fb.stars).text}
                  </span>
                </td>
                <td className="gray-400 px-4 py-2">{fb.suggestion}</td>
                <td className="gray-400 px-4 py-2">
                  {fb.date?.seconds
                    ? new Date(fb.date.seconds * 1000).toLocaleString()
                    : fb.date || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FeedbackManagement;
