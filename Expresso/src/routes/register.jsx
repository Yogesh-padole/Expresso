import { useState } from "react";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

export default function Register() {
  const [form, setForm] = useState({ userId: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const Navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    const map = { Username: "userId", Email: "email", Password1: "password" };
    const key = map[id];
    if (!key) return;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userId || !form.email || !form.password) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const q = query(
        collection(db, "users"),
        where("userId", "==", form.userId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        alert("Username is already taken. Please choose another.");
        setLoading(false);
        return;
      }

      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const uid = cred.user.uid;

      await setDoc(doc(db, "users", uid), {
        userId: form.userId,
        email: form.email,
        createdAt: new Date(),
      });

      alert("Registered successfully!");
      setForm({ userId: "", email: "", password: "" });
      Navigate("/dashboard");
    } catch (err) {
      console.error("Register error:", err);
      alert(err?.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="custom-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="Username">Username:</label>
            <input
              type="text"
              id="Username"
              value={form.userId}
              onChange={handleChange}
              placeholder="Choose a unique ID"
              required
            />
          </div>
          <br />

          <div className="field-group">
            <label htmlFor="Email">Email address:</label>
            <input
              type="email"
              id="Email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
            />
          </div>
          <br />

          <div className="field-group">
            <label htmlFor="Password1">Password:</label>
            <input
              type="password"
              id="Password1"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <br />

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>

      <p className="custom-mt">
        Already have an account? <Link to="/login">Login here</Link>.
      </p>

      <style>
        {`
          .custom-container {
            max-width: 500px;
            margin: 40px auto;
            border: 1px solid rgba(255, 255, 255, 0.3);
            height: 100%;
            width: 100%;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            background-color: rgba(33, 31, 31, 0.5);
            padding: 20px;
            color: white;
          }

          .field-group {
            display: flex;
            flex-direction: column;
            margin-bottom: 10px;
          }

          label {
            font-weight: bold;
            margin-bottom: 5px;
          }

          input {
            border-radius: 8px;
            border: 1px solid #ccc;
            padding: 0.6em 1.2em;
            font-size: 1em;
            font-weight: 400;
            font-family: inherit;
            width: 400px;
            margin-left: 20px;
            background-color: transparent;
          }

          input::placeholder {
            color: rgba(255, 255, 255, 0.5);
          }

         

          button:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
          }

          .custom-mt {
            margin-top: 1rem;
            color: white;
            text-align: center;
          }
        `}
      </style>
    </div>
  );
}
