import React, { useEffect, useState } from "react";
import { Users, FileText, Activity, Bell } from "lucide-react";
import { dummyUsers, dummyNotifications } from "../data/dummyData";
import { subscribeToSize } from "../../utils/firestoreHelpers";

const Dashboard = () => {
  const dashboardStats = {
    activeUsers: dummyUsers.filter((user) => user.status === "Active").length,
  };

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalReports, setTotalReports] = useState(0);

  useEffect(() => {
    const unsubUsers = subscribeToSize("users", (size) =>
      setTotalUsers(size || dummyUsers.length)
    );

    const unsubPosts = subscribeToSize("posts", (size) =>
      setTotalPosts(size || 1847)
    );

    const unsubReports = subscribeToSize("reports", (size) =>
      setTotalReports(size || dashboardStats.activeUsers)
    );

    // Cleanup listeners on unmount
    return () => {
      unsubUsers();
      unsubPosts();
      unsubReports();
    };
  }, []);

  return (
    <div className="dashboard">
      <h2>Dashboard Overview</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>{totalPosts}</h3>
            <p>Total Posts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <h3>{totalReports}</h3>
            <p>Total Reports</p>
          </div>
        </div>
      </div>

      <div className="notifications-section">
        <h3>
          <Bell size={20} />
          Recent Notifications
        </h3>
        <div className="notifications-list">
          {dummyNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.type}`}
            >
              <div className="notification-content">
                <p>{notification.message}</p>
                <span className="timestamp">{notification.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
