import React, { useState } from "react";
import {
  Activity,
  Users,
  FileText,
  MessageSquare,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import Dashboard from "../components/Dashboard";
import UserManagement from "../components/UserManagement";
import ReportsManagement from "../components/ReportsManagement";
import AddUserModal from "../components/AddUserModal";
import FeedbackManagement from "../components/FeedbackManagement";
import PostManagement from "../components/PostManagement";
import AnalyticsTab from "../components/AnalyticsTab";
import { auth, db } from "../../firebase/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { createUserProfile } from "../../services/userService";
import "../admin.css";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const handleAddUser = async (userData) => {
    try {
      // Check if user email already exists
      const q = query(
        collection(db, "users"),
        where("userId", "==", userData.email),
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        alert("Username is already taken.");
        return;
      }

      // Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(
        auth, // auth is available here
        userData.email,
        userData.password,
      );

      // Create user doc in Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        createdAt: serverTimestamp(),
        email: userData.email,
        lastactive: "",
        // name: userData.name,
        password: userData.password,
        role: userData.role, // important for Cloud Function to detect admin
        status: userData.status,
        userId: cred.user.uid,
        username: userData.username,
      });

      alert("Registered successfully!");
    } catch (err) {
      console.error("Register error:", err);
      alert(err?.message || "Failed to register.");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        console.log(activeTab);
        return <UserManagement onAddUser={() => setShowAddUserModal(true)} />;
      case "reports":
        console.log(activeTab);
        return <ReportsManagement />;
      case "feed":
        return <FeedbackManagement />;
      case "postmanage":
        return <PostManagement />;
      case "analytics":
        return <AnalyticsTab />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="admin-app">
      <div className="admin-panel">
        <nav className="sidebar">
          <div className="logo">
            <h2>Admin Panel</h2>
          </div>
          <div className="nav-menu">
            <button
              className={
                activeTab === "dashboard" ? "nav-btn active" : "nav-btn"
              }
              onClick={() => setActiveTab("dashboard")}
            >
              <Activity size={20} />
              Dashboard
            </button>

            <button
              className={activeTab === "users" ? "nav-btn active" : "nav-btn"}
              onClick={() => setActiveTab("users")}
            >
              <Users size={20} />
              User Management
            </button>
            <button
              className={activeTab === "reports" ? "nav-btn active" : "nav-btn"}
              onClick={() => setActiveTab("reports")}
            >
              <FileText size={20} />
              Reports
            </button>

            <button
              className={activeTab === "feed" ? "nav-btn active" : "nav-btn"}
              onClick={() => setActiveTab("feed")}
            >
              <MessageSquare size={20} />
              Feedback
            </button>

            <button
              className={
                activeTab === "postmanage" ? "nav-btn active" : "nav-btn"
              }
              onClick={() => setActiveTab("postmanage")}
            >
              <ClipboardList size={20} />
              Manage Posts
            </button>

            <button
              className={
                activeTab === "analytics" ? "nav-btn active" : "nav-btn"
              }
              onClick={() => setActiveTab("analytics")}
            >
              <BarChart3 size={20} />
              Analytics
            </button>
          </div>
        </nav>

        <main className="main-content">{renderContent()}</main>

        <AddUserModal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          onAddUser={handleAddUser}
        />
      </div>
    </div>
  );
};

export default AdminPanel;
