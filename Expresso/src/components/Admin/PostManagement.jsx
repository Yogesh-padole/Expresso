import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase.js"; // adjust import

const PostManagement = () => {
  const [postData, setPostData] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 Search state

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsSnap = await getDocs(collection(db, "posts"));
        const postArr = [];

        postsSnap.forEach((doc) => {
          const post = doc.data();

          let postDate = "Unknown";
          if (post.createdAt) {
            if (typeof post.createdAt.toDate === "function") {
              postDate = post.createdAt.toDate().toLocaleDateString();
            } else {
              postDate = new Date(post.createdAt).toLocaleDateString();
            }
          }

          postArr.push({
            date: postDate,
            email: post.author || "N/A",
          });
        });

        // ✅ Group by date only
        const grouped = postArr.reduce((acc, item) => {
          if (!acc[item.date]) {
            acc[item.date] = { date: item.date, count: 0, emails: new Set() };
          }
          acc[item.date].count += 1;
          acc[item.date].emails.add(item.email);
          return acc;
        }, {});

        // Convert Set → Array for rendering
        const finalData = Object.values(grouped).map((g) => ({
          date: g.date,
          count: g.count,
          emails: Array.from(g.emails),
        }));

        setPostData(finalData);
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    fetchPosts();
  }, []);

  // 🔍 Filter by email
  const filteredData = postData
    .map((row) => ({
      ...row,
      emails: row.emails.filter((email) =>
        email.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((row) => row.emails.length > 0);

  return (
    <div className="post-management">
      <h2 className="headings">Post Management</h2>

      {/* 🔍 Search Input */}
      <input
        type="text"
        placeholder="Search by email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <div className="table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Count</th>
              <th>Emails</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.date}</td>
                <td>
                  <span className="count-badge">{row.count}</span>
                </td>
                <td>
                  {row.emails.map((email, i) => (
                    <span key={i} className="email-badge">
                      {email}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .post-management {
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
        }

        .headings {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 20px;
          color: #222;
        }

        .search-input {
          padding: 8px 12px;
          width: 260px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 0.95rem;
          margin-bottom: 15px;
          outline: none;
          transition: 0.3s;
        }

        .search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 6px rgba(59,130,246,0.4);
        }

        .table-container {
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }

        .styled-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.95rem;
        }

        .styled-table thead {
          background: #f9fafb;
          border-bottom: 2px solid #e5e7eb;
        }

        .styled-table th {
          text-align: left;
          padding: 12px;
          font-weight: 600;
          color: #374151;
        }

        .styled-table td {
          padding: 12px;
          color: #4b5563;
          border-bottom: 1px solid #e5e7eb;
        }

        .styled-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }

        .styled-table tbody tr:hover {
          background: #f1f5f9;
          transition: 0.2s;
        }

        /* Count badge style */
        .count-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 500;
          background: #e0e7ff;
          color: #3730a3;
        }

        /* Email badge style */
        .email-badge {
          display: inline-block;
          margin: 2px;
          padding: 4px 8px;
          border-radius: 6px;
          background: #f3f4f6;
          color: #374151;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
};

export default PostManagement;
