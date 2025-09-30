import { useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = getAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = form;

    if (!username || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Check if username already exists
      const usernameQuery = query(
        collection(db, "users"),
        where("username", "==", username)
      );
      const usernameSnap = await getDocs(usernameQuery);

      if (!usernameSnap.empty) {
        alert("Username is already taken.");
        setLoading(false);
        return;
      }

      // 2️⃣ Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      // 3️⃣ Save user in Firestore
      await setDoc(doc(db, "users", uid), {
        username: username,
        email: email,
        role: "User",
        createdAt: new Date(),
        lastactive: "",
        password: password, // ⚠️ storing raw password is unsafe, consider hashing!
        status: "Active",
        userId: uid,
      });

      alert("Registered successfully!");
      setForm({ username: "", email: "", password: "" });
      navigate("/dashboard");
    } catch (err) {
      console.error("Registration error:", err);
      alert(err?.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2 className="title">Create Account ✨</h2>
        <p className="subtitle">Join us today</p>
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Choose a unique ID"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-3">
          Already have an account? <Link to="/login">Login here</Link>.
        </p>
      </div>

      <style>
        {`
          .register-page {
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #667eea, #764ba2);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: white;
            padding: 10px;
          }

          .register-card {
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

          .field-group {
            display: flex;
            flex-direction: column;
            margin-bottom: 15px;
            text-align: left;
          }

          label {
            font-weight: 500;
            margin-bottom: 5px;
          }

          input {
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

          input:focus {
            box-shadow: 0 0 8px #667eea;
          }

          input::placeholder {
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
            .register-card {
              padding: 20px;
              border-radius: 12px;
            }

            .title {
              font-size: 1.6rem;
            }

            .subtitle {
              font-size: 0.9rem;
            }

            input {
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
