import { useState } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { getLogUser } from "../../utils/firestoreHelpers";
import "../../index.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      const retrunlog = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      alert("Login successful!");
      const logUserData = await getLogUser(retrunlog.user.uid);
      if (logUserData.role === "Admin") {
        Navigate("/Admin");
      } else {
        Navigate("/dashboard");
      }
      setForm({ email: "", password: "" });
    } catch (err) {
      console.error("Login error:", err);
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password"
      ) {
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
    <div className="login-page">
      <div className="login-card">
        <h2 className="title">Welcome Back 👋</h2>
        <p className="subtitle">Login to continue</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="Email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              id="Email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="Password1" className="form-label">
              Password
            </label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
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
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <button
            type="button"
            className="btn-link"
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </button>
        </form>

        <p className="mt-3">
          Don’t have an account? <Link to="/register">Register here</Link>.
        </p>
      </div>

      <style>
        {`
          .login-page {
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #667eea, #764ba2);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: white;
            padding: 10px;
          }

          .login-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 15px;
            width: 100%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            animation: fadeIn 0.8s ease-in-out;
          }

          .title {
            font-size: 2rem;
            margin-bottom: 10px;
            font-weight: bold;
          }

          .subtitle {
            font-size: 1rem;
            margin-bottom: 20px;
            opacity: 0.8;
          }

          .form-label {
            display: block;
            text-align: left;
            margin-bottom: 5px;
            font-weight: 500;
          }

          .form-control {
            border-radius: 10px;
            border: none;
            padding: 12px;
            font-size: 1em;
            width: 100%;
            background: rgba(255, 255, 255, 0.15);
            color: white;
            outline: none;
            transition: 0.3s ease;
          }

          .form-control:focus {
            box-shadow: 0 0 8px #667eea;
          }

          .form-control::placeholder {
            color: rgba(255, 255, 255, 0.6);
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
            font-size: 18px;
            cursor: pointer;
            color: white;
          }

          .btn-primary {
            width: 100%;
            padding: 12px;
            margin-top: 15px;
            border: none;
            border-radius: 10px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            color: white;
            font-size: 1rem;
            cursor: pointer;
            transition: 0.3s ease;
          }

          .btn-primary:hover {
            background: linear-gradient(90deg, #5a67d8, #6b46c1);
            transform: scale(1.03);
          }

          .btn-link {
            margin-top: 15px;
            display: block;
            background: none;
            border: none;
            color: #c3c9f5;
            text-decoration: underline;
            cursor: pointer;
            font-size: 14px;
          }

          .mt-3 {
            margin-top: 1rem;
            color: #f0f0f0;
            font-size: 0.9rem;
          }

          a {
            color: #ffd369;
            text-decoration: none;
          }

          a:hover {
            text-decoration: underline;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* 📱 Mobile responsiveness */
          @media (max-width: 480px) {
            .login-card {
              padding: 20px;
              border-radius: 12px;
            }

            .title {
              font-size: 1.6rem;
            }

            .subtitle {
              font-size: 0.9rem;
            }

            .form-control {
              font-size: 0.95rem;
              padding: 10px;
            }

            .btn-primary {
              font-size: 0.95rem;
              padding: 10px;
            }
          }
        `}
      </style>
    </div>
  );
}
