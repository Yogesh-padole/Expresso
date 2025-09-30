import React, { useState } from "react";

const AddUserModal = ({ isOpen, onClose, onAddUser }) => {
  const [showPassword, setShowPassword] = useState(false); // show/hide password

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "",
    status: "Inactive",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddUser(formData);
    setFormData({
      name: "",
      email: "",
      username: "",
      password: "",
      role: "User",
      status: "Inactive",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    // component add user on background
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Add New User</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value }) } required />
          </div>

          <div className="form-group"> 
            <label>Username</label>
            <input  type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value }) } required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={6}
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select value={formData.role} onChange={(e) =>  setFormData({ ...formData, role: e.target.value }) }
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
