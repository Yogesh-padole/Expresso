import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase.js"; // adjust import

const PostManagement = () => {
  const [postData, setPostData] = useState([]);

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

  return (
    <div style={{ padding: "20px" }}>
      <h2 className="headings">Post Management</h2>
      <table
        border="1"
        cellPadding="8"
        style={{ width: "100%", textAlign: "left" }}
      >
        <thead>
          <tr>
            <th>Date</th>
            <th>Count</th>
            <th>Emails</th>
          </tr>
        </thead>
        <tbody>
          {postData.map((row, idx) => (
            <tr key={idx}>
              <td>{row.date}</td>
              <td>{row.count}</td>
              <td>{row.emails.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PostManagement;
