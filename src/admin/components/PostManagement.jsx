import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase"; // adjust import
import { Download } from "lucide-react";

const PostManagement = () => {
  const [postData, setPostData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

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
            id: doc.id,
            date: postDate,
            email: post.author || "N/A",
            title: post.title || "Untitled",
            content: post.content || "",
            likes: post.likes || 0,
            comments: post.comments?.length || 0,
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

  const totalPosts = postData.reduce((sum, item) => sum + item.count, 0);

  const totalAuthors = new Set(postData.flatMap((item) => item.emails)).size;

  const filteredPosts = postData.filter((post) =>
    post.emails.join(" ").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="post">
      <div className="section-header">
        <h2 className="headings">Post Management</h2>
      </div>
      <div className="feedback-stats">
        <div className="stat-card">
          <h3>{totalPosts}</h3>
          <p>Total Posts</p>
        </div>

        <div className="stat-card">
          <h3>{totalAuthors}</h3>
          <p>Total Authors</p>
        </div>

        <div className="stat-card">
          <h3>{postData.length}</h3>
          <p>Active Days</p>
        </div>
      </div>
      <div className="post-toolbar">
        <div className="post-search-wrapper">
          <input
            type="text"
            placeholder="Search by author..."
            className="search-input-post"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          className="export-btn"
          onClick={() => {
            const csvRows = [
              ["Date", "Count", "Authors"],
              ...filteredPosts.map((row) => [
                row.date,
                row.count,
                row.emails.join("; "),
              ]),
            ];

            const csvContent = csvRows.map((e) => e.join(",")).join("\n");

            const blob = new Blob([csvContent], { type: "text/csv" });

            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;
            a.download = "posts.csv";
            a.click();
          }}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      <table className="posts-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Count</th>
            <th>Emails</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredPosts.map((row, idx) => (
            <tr key={idx}>
              <td>{row.date}</td>

              <td>
                <span className="count-badge">{row.count}</span>
              </td>

              <td>{row.emails.join(", ")}</td>

              <td>
                <button
                  className="view-btn"
                  onClick={() => setSelectedPost(row)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedPost && (
        <div className="modal-overlay">
          <div className="post-modal-content">
            <h3>Post Details</h3>

            <p>
              <strong>Date:</strong> {selectedPost.date}
            </p>

            <p>
              <strong>Posts:</strong> {selectedPost.count}
            </p>

            <p>
              <strong>Authors:</strong> {selectedPost.emails.join(", ")}
            </p>

            <button
              className="post-close-btn"
              onClick={() => setSelectedPost(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostManagement;
