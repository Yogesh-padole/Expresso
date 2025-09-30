import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase"; // Adjust path based on your structure

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Left side - Empty for balance */}
        <div style={{ width: "100px" }}></div>

        {/* Center - Logo */}
        <div className="nav-logo">Expresso</div>

        {/* Right side - Logout Button */}
        <button
          onClick={handleLogout}
          className="logout-btn"
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.25s",
            marginLeft: "auto",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "rgba(255,255,255,0.1)";
            e.target.style.borderColor = "#646cff";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "transparent";
            e.target.style.borderColor = "rgba(255,255,255,0.3)";
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
