// FeedbackManagement.js
import React, { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

import { db } from "../../firebase/firebase";
const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p>Loading feedbacks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="reports">
      <h1 className="headings">Feedback Management</h1>
      {feedbacks.length === 0 ? (
        <p>No feedbacks found.</p>
      ) : (
        <table className="reports-table">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 px-4 py-2">Username</th>
              <th className="border border-gray-400 px-4 py-2">Email</th>
              <th className="border border-gray-400 px-4 py-2">Stars</th>
              <th className="border border-gray-400 px-4 py-2">Suggestion</th>
              <th className="border border-gray-400 px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((fb) => (
              <tr key={fb.id}>
                <td className="border border-gray-400 px-4 py-2">
                  {fb.username}
                </td>
                <td className="border border-gray-400 px-4 py-2">{fb.email}</td>
                <td className="border border-gray-400 px-4 py-2">{fb.stars}</td>
                <td className="border border-gray-400 px-4 py-2">
                  {fb.suggestion}
                </td>
                <td className="border border-gray-400 px-4 py-2">
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
