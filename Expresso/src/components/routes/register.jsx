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
        password: password,
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
    <div className="custom-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="username">Username:</label>
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
          <label htmlFor="email">Email:</label>
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
          <label htmlFor="password">Password:</label>
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
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <p className="custom-mt">
        Already have an account? <Link to="/login">Login here</Link>.
      </p>

      <style>{`
      body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          background-attachment: fixed; /* parallax-like */
          color: white;
        }
        .custom-container { max-width: 500px; margin: 40px auto; padding: 20px; background-color: rgba(33,31,31,0.5); color: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.5); width: 90%; }
        .field-group { display: flex; flex-direction: column; margin-bottom: 15px; }
        label { font-weight: bold; margin-bottom: 5px; }
        input { border-radius: 8px; border: 1px solid #ccc; padding: 0.6em 1.2em; font-size: 1em; width: 100%; background-color: transparent; color: white; }
        input::placeholder { color: rgba(255,255,255,0.5); }
        .password-wrapper { position: relative; }
        .toggle-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #9599e7; cursor: pointer; font-size: 14px; }
        button:disabled { background-color: #6c757d; cursor: not-allowed; }
        .custom-mt { margin-top: 1rem; text-align: center; }
      `}</style>
    </div>
  );
}
