import React, { useState, useEffect } from "react";
import { Search, Edit, Eye, Trash2 } from "lucide-react";
import {
  getAllPosts,
  deletePost,
  getPostById,
} from "../../services/postService";
import {
  subscribeToReports,
  resolveReportsForPost,
  deleteReport,
} from "../../services/reportService";
import { deleteAllCompletedReports } from "../utils/firestoreHelpers";
import { getAllUsers } from "../../services/userService";

const ReportsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeReportsTab, setActiveReportsTab] = useState("All");
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postDetails, setPostDetails] = useState(null);
  const [reporterDetails, setReporterDetails] = useState({});
  const [reportCounts, setReportCounts] = useState({});
  const [deletedPosts, setDeletedPosts] = useState({});

  // Fixed threshold for automatic post deletion
  const REPORT_THRESHOLD = 5;

  // Fetch reports on component mount
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToReports(async (data) => {
      setReports(data);
      setFilteredReports(data);
      await fetchReporterDetails(data);
      await checkDeletedPosts(data);
      calculateReportCounts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkDeletedPosts = async (reportsData) => {
    const deletedMap = {};

    for (const report of reportsData) {
      try {
        const post = await getPostById(report.postId);

        if (!post) {
          deletedMap[report.postId] = true;
        }
      } catch {
        deletedMap[report.postId] = true;
      }
    }

    setDeletedPosts(deletedMap);
  };

  // Fetch Reporter's Details
  const fetchReporterDetails = async (reportData) => {
    try {
      const allUsers = await getAllUsers();
      const reporterMap = {};

      reportData.forEach((report) => {
        if (report.reportedBy) {
          const reporter = allUsers.find(
            (user) => user.userId === report.reportedBy,
          );
          if (reporter) {
            reporterMap[report.reportedBy] = reporter;
          }
        }
      });

      setReporterDetails(reporterMap);
    } catch (error) {
      console.error("Error getting reporter details:", error);
    }
  };

  // Get reporter name for display
  const getReporterName = (report) => {
    if (report.reportedBy && reporterDetails[report.reportedBy]) {
      return reporterDetails[report.reportedBy].name || report.reportedBy;
    }
    return report.reportedBy || "Unknown User";
  };

  // Calculate report counts for each post
  const calculateReportCounts = async (reportsData) => {
    const counts = {};

    reportsData.forEach((report) => {
      if (report.postId) {
        counts[report.postId] = (counts[report.postId] || 0) + 1;
      }
    });

    setReportCounts(counts);

    // Auto delete threshold-hit posts
    for (const [postId, count] of Object.entries(counts)) {
      if (count >= REPORT_THRESHOLD) {
        try {
          const post = await getPostById(postId);

          if (post) {
            await deletePost(postId);
            console.log("post : ", post);
            await resolveReportsForPost(postId);
          }
        } catch (err) {
          if (err.message === "Post not found") {
            console.log(`Post ${postId} already deleted`);
            continue;
          }

          console.error(err);
        }
      }
    }
  };

  // Filter reports based on tab and search term
  useEffect(() => {
    if (!reports.length) return;

    let filtered = [...reports];

    // Filter by tab
    if (activeReportsTab === "pending") {
      filtered = filtered.filter((report) => !report.resolved);
    } else if (activeReportsTab === "completed") {
      filtered = filtered.filter((report) => report.resolved);
    } else if (activeReportsTab === "threshold") {
      filtered = filtered.filter(
        (report) => reportCounts[report.postId] >= REPORT_THRESHOLD,
      );

      // Remove duplicate rows for same post
      const thresholdReports = [];
      const seenPosts = new Set();

      filtered.forEach((report) => {
        if (!seenPosts.has(report.postId)) {
          seenPosts.add(report.postId);
          thresholdReports.push(report);
        }
      });

      filtered = thresholdReports;
    }
    // "recent" tab shows all reports (no filter)

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          (report.id &&
            report.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (report.reportedBy &&
            report.reportedBy
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (report.reason &&
            report.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (report.postTitle &&
            report.postTitle.toLowerCase().includes(searchTerm.toLowerCase())),
      );
    }

    setFilteredReports(filtered);
  }, [reports, activeReportsTab, searchTerm]);

  // Fetch post details when viewing a report
  const fetchPostDetails = async (postId) => {
    try {
      // Try to get post from posts collection first
      // const posts = await getAllPosts();
      // const post = posts.find((p) => p.id === postId);

      const post = await getPostById(postId);

      if (post) {
        setPostDetails({
          id: post.id,
          title: post.title,
          content: post.body || post.content,
          author: post.authorName || post.author.name,
          createdAt: post.createdAt,
        });
        return true;
      } else {
        // If post not found, set basic details
        setPostDetails({
          id: postId,
          title: "Post Not Found",
          content: "This post may have been deleted",
          author: "Unknown Author",
          createdAt: null,
        });
        return false;
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
      setPostDetails({
        id: postId,
        title: "Error loading post",
        content: "Could not load post content",
        author: "Unknown",
        createdAt: null,
      });
      return false;
    }
  };

  const handleViewReport = async (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
    await fetchPostDetails(report.postId);
  };

  // New function to delete individual report
  const handleDeleteReport = async (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteReport(reportId);
        alert("Report deleted successfully!");
      } catch (error) {
        console.error("Error deleting report:", error);
        alert("Error deleting report. Please try again.");
      }
    }
  };

  // New function to delete all completed reports
  const handleDeleteAllCompletedReports = async () => {
    const completedReportsCount = reports.filter(
      (report) => report.resolved,
    ).length;

    if (completedReportsCount === 0) {
      alert("No completed reports to delete.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete all ${completedReportsCount} completed reports? This action cannot be undone.`,
      )
    ) {
      try {
        const deletedCount = await deleteAllCompletedReports();
        alert(`Successfully deleted ${deletedCount} completed reports!`);
      } catch (error) {
        console.error("Error deleting completed reports:", error);
        alert("Error deleting completed reports. Please try again.");
      }
    }
  };

  const handleDeletePost = async () => {
    if (!selectedReport) return;

    try {
      await deletePost(selectedReport.postId);

      // Then update all reports for this post to "completed"
      await resolveReportsForPost(selectedReport.postId);

      console.log(`Post ${selectedReport.postId} deleted successfully`);
      alert("Post deleted successfully!");
      setIsModalOpen(false);
      setSelectedReport(null);
      setPostDetails(null);
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Error deleting post. Please try again.");
    }
  };

  const handleDeleteAllThresholdPosts = async () => {
    const thresholdPosts = Object.entries(reportCounts).filter(
      ([_, count]) => count >= REPORT_THRESHOLD,
    );

    if (thresholdPosts.length === 0) {
      alert("No threshold-hit posts found.");
      return;
    }

    if (
      !window.confirm(`Delete ${thresholdPosts.length} threshold-hit posts?`)
    ) {
      return;
    }

    try {
      for (const [postId] of thresholdPosts) {
        await deletePost(postId);
        await resolveReportsForPost(postId);
      }

      alert(`${thresholdPosts.length} posts deleted successfully!`);
    } catch (error) {
      console.error(error);
      alert("Error deleting threshold-hit posts.");
    }
  };

  const handleDeleteThresholdPost = async (postId) => {
    if (!window.confirm("Delete this threshold-hit post?")) {
      return;
    }

    try {
      await deletePost(postId);
      await resolveReportsForPost(postId);

      alert("Post deleted successfully!");
    } catch (error) {
      console.error(error);
      alert("Error deleting post.");
    }
  };

  const handleSendWarning = () => {
    if (!selectedReport) return;

    console.log(`Warning sent to post owner: ${selectedReport.postOwnerEmail}`);
    // Add your warning logic here
    alert(`Warning sent to ${selectedReport.postOwnerEmail}`);
  };

  const getStatusBadge = (resolved) => {
    const status = resolved ? "Completed" : "Pending";
    const statusClasses = {
      Pending: "status-badge pending",
      Completed: "status-badge active",
    };
    return <span className={statusClasses[status]}>{status}</span>;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    // If it's a Firestore timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }

    // If it's already a Date object or string
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="reports">
        <div className="section-header">
          <h2>Reports Management</h2>
        </div>
        <div className="loading">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="reports">
      <div className="section-header">
        <h2 className="headings">Reports Management</h2>
      </div>

      <div className="reports-tabs">
        <button
          className={activeReportsTab === "All" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveReportsTab("All")}
        >
          All Reports
        </button>
        <button
          className={
            activeReportsTab === "pending" ? "tab-btn active" : "tab-btn"
          }
          onClick={() => setActiveReportsTab("pending")}
        >
          Pending Reports
        </button>
        <button
          className={
            activeReportsTab === "completed" ? "tab-btn active" : "tab-btn"
          }
          onClick={() => setActiveReportsTab("completed")}
        >
          Completed Reports
        </button>
        <button
          className={
            activeReportsTab === "threshold" ? "tab-btn active" : "tab-btn"
          }
          onClick={() => setActiveReportsTab("threshold")}
        >
          Threshold Hit Reports
        </button>
      </div>

      {/* Delete All Completed Reports Button - Only show in Completed tab */}
      {activeReportsTab === "completed" && (
        <div className="bulk-actions">
          <button
            className="btn btn-danger bulk-delete-btn"
            onClick={handleDeleteAllCompletedReports}
            disabled={reports.filter((report) => report.resolved).length === 0}
          >
            <Trash2 size={16} />
            Delete All Completed Reports
          </button>
        </div>
      )}

      {/* Delete All Threshold Posts */}
      {activeReportsTab === "threshold" && (
        <div className="bulk-actions">
          <button
            className="btn btn-danger bulk-delete-btn"
            onClick={handleDeleteAllThresholdPosts}
            disabled={
              Object.values(reportCounts).filter(
                (count) => count >= REPORT_THRESHOLD,
              ).length === 0
            }
          >
            <Trash2 size={16} />
            Delete All Threshold Posts
          </button>
        </div>
      )}

      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search reports by ID, user, reason, or post title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        {filteredReports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>

            <h3>
              {activeReportsTab === "threshold"
                ? "No Threshold Hit Reports"
                : "No Reports Found"}
            </h3>

            <p>
              {searchTerm
                ? `No reports match "${searchTerm}"`
                : activeReportsTab === "pending"
                  ? "There are no pending reports to review."
                  : activeReportsTab === "completed"
                    ? "There are no completed reports."
                    : activeReportsTab === "threshold"
                      ? `No posts have reached the report threshold (${REPORT_THRESHOLD}).`
                      : "Everything looks clean right now."}
            </p>
          </div>
        ) : (
          <table className="reports-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Reported By</th>
                <th>Post Title</th>
                <th>Post Owner</th>
                <th>Description</th>
                <th>Report Count</th>
                <th>Status</th>
                <th>Reported Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="report-row">
                  <td className="report-id">{report.id}</td>
                  <td>{getReporterName(report)}</td>
                  <td className="post-title">
                    {report.postTitle || "Unknown Title"}
                  </td>
                  <td className="post-owner">
                    {report.postAuthor || "Unknown Owner"}
                  </td>
                  <td className="description">
                    {report.reason || "No description"}
                  </td>
                  <td className="report-count">
                    {reportCounts[report.postId] || 0}
                    {reportCounts[report.postId] >= REPORT_THRESHOLD && (
                      <span className="threshold-exceeded"> ⚠️</span>
                    )}
                  </td>
                  <td>{getStatusBadge(report.resolved)}</td>
                  <td>{formatDate(report.createdAt)}</td>
                  <td className="actions-cell">
                    {activeReportsTab !== "threshold" && (
                      <button
                        className="action-btn view"
                        onClick={() => handleViewReport(report)}
                      >
                        <Eye size={14} /> View
                      </button>
                    )}
                    {/* Threshold Tab Delete Post */}
                    {activeReportsTab === "threshold" &&
                      (deletedPosts[report.postId] ? (
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteReport(report.id)}
                          title="Delete Report"
                        >
                          <Trash2 size={14} />
                          Delete Report
                        </button>
                      ) : (
                        <button
                          className="action-btn delete"
                          onClick={() =>
                            handleDeleteThresholdPost(report.postId)
                          }
                          title="Delete Post"
                        >
                          <Trash2 size={14} />
                          Delete Post
                        </button>
                      ))}

                    {/* Completed Reports Delete */}
                    {report.resolved && activeReportsTab !== "threshold" && (
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteReport(report.id)}
                        title="Delete Report"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Post Details</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedReport(null);
                  setPostDetails(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {postDetails ? (
                <>
                  <div className="post-section">
                    <h4>Post Information</h4>
                    <p>
                      <strong>Title:</strong> {postDetails.title}
                    </p>
                    <p>
                      <strong>Author:</strong> {postDetails.author}
                    </p>
                    <p>
                      <strong>Created:</strong>{" "}
                      {formatDate(postDetails.createdAt)}
                    </p>
                    <p>
                      <strong>Content:</strong>
                    </p>
                    <div className="Adpost-content">{postDetails.content}</div>
                  </div>

                  <div className="report-section">
                    <h4>Report Information</h4>
                    <p>
                      <strong>Reported by:</strong> {selectedReport.reportedBy}
                    </p>
                    <p>
                      <strong>Reason:</strong>{" "}
                      {selectedReport.reason || "No reason provided"}
                    </p>
                    <p>
                      <strong>Total reports for this post:</strong>{" "}
                      {reportCounts[selectedReport.postId] || 0}
                    </p>
                  </div>
                </>
              ) : (
                <div className="loading">Loading post details...</div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-danger"
                onClick={handleDeletePost}
                disabled={!postDetails}
              >
                Delete Post
              </button>
              <button
                className="btn btn-warning"
                onClick={handleSendWarning}
                disabled={!selectedReport}
              >
                Send Warning to Owner
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;
