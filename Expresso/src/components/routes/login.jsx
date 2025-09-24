import { useState } from "react";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state
  const Navigate = useNavigate();

  const auth = getAuth();

  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === "Email") setForm((f) => ({ ...f, email: value }));
    if (id === "Password1") setForm((f) => ({ ...f, password: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      alert("Please enter both email and password.");
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, form.email, form.password);
      alert("Login successful!");
      Navigate("/dashboard");
      setForm({ email: "", password: "" });
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        alert("Incorrect password. Please try again.");
      } else if (err.code === "auth/user-not-found") {
        alert("No account found with this email.");
      } else {
        alert(err.message || "Failed to login.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email) {
      alert("Please enter your email first to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, form.email);
      alert("Password reset email sent! Check your inbox.");
    } catch (err) {
      console.error("Password reset error:", err);
      if (err.code === "auth/user-not-found") {
        alert("No account found with this email.");
      } else {
        alert(err.message || "Failed to send reset email.");
      }
    }
  };

  return (
    <div>
      <div className="container mt-5">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="Email" className="form-label">Email address:</label>
            <input
              type="email"
              id="Email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="form-control"
            />
          </div>
          <br />

          <div className="mb-3">
            <label htmlFor="Password1" className="form-label">Password:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"} // Toggle type
                id="Password1"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-control"
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <br />

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <br />
          <br />

          <button
            type="button"
            className="btn-link"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </form>
      </div>

      <p className="mt-3">Do not have an account? <Link to="/register">Register here</Link>.</p>

      <style>
        {`
          .container {
            max-width: 500px;
            margin: auto;
            margin-top: 80px;
            padding: 20px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            height: 100%;
            width: 100%;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            background-color: rgba(33, 31, 31, 0.5);
            padding: 20px;
            color: white;
          }
          .form-label {
            font-weight: bold;
          }
          .form-control {
            border-radius: 8px;
            border: 1px solid #ccc;
            padding: 0.6em 1.2em;
            margin-right: 10px;
            font-size: 1em;
            font-weight: 400;
            font-family: inherit;
            width: 100%;
            background-color: transparent;
          }
          .form-control::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }
          .password-wrapper {
            position: relative;
          }
          .toggle-btn {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #9599e7;
            cursor: pointer;
            font-size: 14px;
          }
          .btn-link {
            background: none;
            border: none;
            color: #9599e7;
            text-decoration: underline;
            cursor: pointer;
            font-size: 14px;
            padding: 0;
          }
          .mt-3 {
            margin-top: 1rem;
            color: white;
            text-align: center;
          }
        `}
      </style>
    </div>
  );
}
