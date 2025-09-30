import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Ban,
  Unlock,
  Lock,
} from "lucide-react";
import {
  getAllUsers,
  deleteUsers,
  subscribeToUsers,
  updateUser,
  deleteUsersData,
} from "../../utils/firestoreHelpers";
// import {
//   adminDisableUser,
//   adminDeleteUser,
//   enableUserAuth,
// } from "../../utils/firestoreAdminHelpers.js"; // New import

const UserManagement = ({ onAddUser }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // Track loading actions

  // Fetch Users on component mount
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToUsers((data) => {
      setUsers(data);
      setFilteredUsers(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [refresh]);

  useEffect(() => {
    if (!users.length) return;

    let filtered = [...users];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          (user.name &&
            user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.email &&
            user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.username &&
            user.username.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by role
    if (roleFilter) {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(
        (user) => getUserStatus(user) === statusFilter
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Helper to determine user status
  const getUserStatus = (user) => {
    // Check Firestore disabled field first, then status field, then default to active
    // if (user.disabled !== undefined) {
    //   return user.disabled ? "Disabled" : "Active";
    // }
    if (user.status) {
      return user.status;
    }
    return "Inactive"; // Default status for existing users
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

  const formatDateForExport = (timestamp) => {
    if (!timestamp) return "N/A";

    if (timestamp.toDate) {
      return timestamp.toDate().toISOString().split("T")[0]; // YYYY-MM-DD format
    }

    return new Date(timestamp).toISOString().split("T")[0];
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Active: "status-badge active",
      Inactive: "status-badge inactive",
      Banned: "status-badge banned",
      Disabled: "status-badge banned", // Use same style as banned for disabled
    };
    const displayStatus = status === "Disabled" ? "Disabled" : status;
    return <span className={statusClasses[status]}>{displayStatus}</span>;
  };

  const handleEdit = (user) => {
    console.log(`Inside updateUser userID : ${user.userId}`);
    setEditingUserId(user.userId);
    setEditedUser({ ...user });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditedUser({});
  };

  const handleSaveEdit = async () => {
    try {
      console.log("On updateUser");
      await updateUser(editingUserId, editedUser);
      console.log("next to updateUser");
      setEditingUserId(null);
      setEditedUser({});
      setRefresh((prev) => prev + 1);
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user");
    }
  };

  const handleFieldChange = (field, value) => {
    setEditedUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // New: Handle Disable User
  const handleDisableUser = async (userId) => {
    if (
      window.confirm(
        "Are you sure you want to disable this user? They will not be able to login."
      )
    ) {
      setActionLoading(userId);
      try {
        // await adminDisableUser(userId);
        alert("User disabled successfully");
        setRefresh((prev) => prev + 1);
      } catch (error) {
        console.error("Error disabling user:", error);
        alert("Error disabling user: " + error.message);
      } finally {
        setActionLoading(null);
      }
    }
  };

  // New: Handle Enable User
  const handleEnableUser = async (userId) => {
    setActionLoading(userId);
    try {
      // await enableUserAuth({ uid: userId });
      alert("User enabled successfully");
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("Error enabling user:", error);
      alert("Error enabling user: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Updated: Handle Delete User with Cloud Function
  const handleDelete = async (userId) => {
    if (
      window.confirm(
        "Permanently delete this user? This cannot be undone! This will remove their authentication account and all data."
      )
    ) {
      setActionLoading(userId);
      try {
        await deleteUsersData(userId);
        // await adminDeleteUser(userId);
        alert("User deleted successfully!");
        setRefresh((prev) => prev + 1);
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user: " + error.message);
      } finally {
        setActionLoading(null);
      }
    }
  };

  const exportToCSV = () => {
    setExportLoading(true);

    try {
      // Prepare CSV content
      const headers = [
        "Full Name",
        "Email",
        "Username",
        "Status",
        "Role",
        "Joined Date",
        "Last Active",
      ];
      const csvContent = [
        headers.join(","),
        ...filteredUsers.map((user) =>
          [
            `"${(user.name || "").replace(/"/g, '""')}"`,
            `"${(user.email || "").replace(/"/g, '""')}"`,
            `"${(user.username || user.name || "").replace(/"/g, '""')}"`,
            `"${getUserStatus(user)}"`,
            `"${user.role || "User"}"`,
            `"${formatDateForExport(user.createdAt)}"`,
            `"${formatDateForExport(user.lastactive)}"`,
          ].join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `user-management-report-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("User report exported successfully!");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export user report");
    } finally {
      setExportLoading(false);
    }
  };

  const handleExport = () => {
    if (filteredUsers.length === 0) {
      alert("No data to export");
      return;
    }

    exportToCSV();
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="section-header">
          <h2>User Management</h2>
        </div>
        <div className="loading">Loading Users...</div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="section-header">
        <h2>User Management</h2>
        <div className="admin-notice"></div>
      </div>

      <div className="top-bar">
        <div className="search-container">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Banned">Banned</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>

        <div className="action-buttons">
          <button
            className="btn-secondary"
            onClick={handleExport}
            disabled={exportLoading || filteredUsers.length === 0}
          >
            <Download size={16} />
            {exportLoading ? "Exporting..." : "Export"}
          </button>
          <button className="btn-primary" onClick={onAddUser}>
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>

      <div className="table-container">
        {filteredUsers.length === 0 ? (
          <div className="no-results">
            No users found {searchTerm ? `for "${searchTerm}"` : ""}
          </div>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Status</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.userId} className="user-row">
                  <td className="user-name-cell">
                    {editingUserId === user.userId ? (
                      <input
                        type="text"
                        value={editedUser.name || ""}
                        onChange={(e) =>
                          handleFieldChange("name", e.target.value)
                        }
                        className="edit-input"
                      />
                    ) : (
                      <span>{user.name}</span>
                    )}
                  </td>
                  <td>
                    {editingUserId === user.userId ? (
                      <input
                        type="email"
                        value={editedUser.email || ""}
                        onChange={(e) =>
                          handleFieldChange("email", e.target.value)
                        }
                        className="edit-input"
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    {editingUserId === user.userId ? (
                      <input
                        type="text"
                        value={editedUser.username || ""}
                        onChange={(e) =>
                          handleFieldChange("username", e.target.value)
                        }
                        className="edit-input"
                      />
                    ) : (
                      user.username || user.name
                    )}
                  </td>
                  <td>
                    {editingUserId === user.userId ? (
                      <select
                        value={editedUser.status || getUserStatus(user)}
                        onChange={(e) =>
                          handleFieldChange("status", e.target.value)
                        }
                        className="edit-select"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Banned">Banned</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                    ) : (
                      getStatusBadge(getUserStatus(user))
                    )}
                  </td>
                  <td>
                    {editingUserId === user.userId ? (
                      <select
                        value={editedUser.role || "User"}
                        onChange={(e) =>
                          handleFieldChange("role", e.target.value)
                        }
                        className="edit-select"
                      >
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                      </select>
                    ) : (
                      user.role || "User"
                    )}
                  </td>
                  <td>{formatDate(user.createdAt) || "Not updated"}</td>
                  <td>{formatDate(user.lastactive) || "Not updated"}</td>
                  <td className="actions-cell">
                    {editingUserId === user.userId ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="action-btn save"
                          title="Save"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="action-btn cancel"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(user)}
                          className="action-btn edit"
                          title="Edit"
                          disabled={actionLoading === user.userId}
                        >
                          <Edit size={14} />
                        </button>

                        {/* Disable/Enable Button */}
                        {getUserStatus(user) === "Disabled" ? (
                          <button
                            onClick={() => handleEnableUser(user.userId)}
                            className="action-btn enable"
                            title="Enable User"
                            disabled={actionLoading === user.userId}
                          >
                            {actionLoading === user.userId ? (
                              "..."
                            ) : (
                              <Unlock size={14} />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDisableUser(user.userId)}
                            className="action-btn disable"
                            title="Disable User"
                            disabled={actionLoading === user.userId}
                          >
                            {actionLoading === user.userId ? (
                              "..."
                            ) : (
                              <Lock size={14} />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(user.userId)}
                          className="action-btn delete"
                          title="Delete User"
                          disabled={actionLoading === user.userId}
                        >
                          {actionLoading === user.userId ? (
                            "..."
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
