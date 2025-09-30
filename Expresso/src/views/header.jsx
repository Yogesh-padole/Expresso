import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function Header() {
  const [username, setUsername] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const auth = getAuth();
  const dropdownRef = useRef();
  const tagsRef = useRef();
  const notifRef = useRef();
  const navigate = useNavigate();

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.name || user.email);
          } else {
            setUsername(user.email);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUsername("");
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (!auth.currentUser) return;
    const notifQuery = query(
      collection(db, "notifications"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(notifQuery, (snap) => {
      setNotifications(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [auth.currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    setUsername("");
    navigate("/login");
  };

  // Count of unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotifClick = async () => {
    setNotifOpen(!notifOpen);

    // Mark all notifications as read when opening
    if (!notifOpen) {
      notifications.forEach(async (notif) => {
        if (!notif.read) {
          await updateDoc(doc(db, "notifications", notif.id), { read: true });
        }
      });
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-flex">
          <div className="left-group" ref={dropdownRef}>
            <div className="dropend">
              <button
                className="dropend-toggle"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                ☰
              </button>
              {dropdownOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/myposts">Myposts</Link>
                  </li>
                  <li>
                    <Link to="/saved">Saved Posts</Link>
                  </li>
                  <li>
                    <Link to="/myprofile">My Profile</Link>
                  </li>
                  <li>
                    <Link to="/feedback">Feedback</Link>
                  </li>
                  {username && (
                    <li className="mobile-logout-item">
                      <button className="btn logout-btn" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </div>

            <Link className="navbar-brand" to="/">
              Expresso
            </Link>

            {/* Tags Dropdown */}
            <div className="dropend" ref={tagsRef}>
              <button
                className="dropend-toggle"
                onClick={() => setTagsOpen(!tagsOpen)}
              >
                Explore Tags ▼
              </button>
              {tagsOpen && (
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/tags/collegevibes">#collegevibes</Link>
                  </li>
                  <li>
                    <Link to="/tags/friendshipgoals">#friendshipgoals</Link>
                  </li>
                  <li>
                    <Link to="/tags/firstlove">#firstlove</Link>
                  </li>
                  <li>
                    <Link to="/tags/familyfirst">#familyfirst</Link>
                  </li>
                  <li>
                    <Link to="/tags/memezone">#memezone</Link>
                  </li>
                  <li>
                    <Link to="/tags/dreambig">#dreambig</Link>
                  </li>
                  <li>
                    <Link to="/tags/travelgram">#travelgram</Link>
                  </li>
                  <li>
                    <Link to="/tags/musiclife">#musiclife</Link>
                  </li>
                  <li>
                    <Link to="/tags/animeandchill">#animeandchill</Link>
                  </li>
                  <li>
                    <Link to="/tags/foodielife">#foodielife</Link>
                  </li>
                  <li>
                    <Link to="/tags/mentalpeace">#mentalpeace</Link>
                  </li>
                  <li>
                    <Link to="/tags/lovestory">#lovestory</Link>
                  </li>
                </ul>
              )}
            </div>

            {/* Notification Bell */}
            {username && (
              <div className="dropend" ref={notifRef}>
                <button
                  className="dropend-toggle notif-btn"
                  onClick={handleNotifClick}
                >
                  🔔{" "}
                  {unreadCount > 0 && (
                    <span className="notif-count">{unreadCount}</span>
                  )}
                </button>
                {notifOpen && (
                  <ul className="dropdown-menu notif-dropdown">
                    {notifications.length === 0 ? (
                      <li>No new notifications</li>
                    ) : (
                      notifications.map((notif) => (
                        <li key={notif.id}>{notif.message}</li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="auth-buttons">
            {username ? (
              <>
                <span className="username">
                  Hi,{" "}
                  <strong>
                    <Link to="/myprofile" className="username-link">
                      {username}
                    </Link>
                  </strong>
                </span>
                <button
                  className="btn logout-btn desktop-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn login-btn">
                  Login
                </Link>
                <Link to="/register" className="btn register-btn">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <style>{`
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          background-attachment: fixed; /* parallax-like */
          color: white;
        }
        .navbar {
          margin: 0;
          padding: 10px 20px;
          background-color: transparent;
          color: white;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          border-radius: 0 0 10px 10px;
          backdrop-filter: blur(6px);
        }

        .notif-btn {
          position: relative;
          font-size: 1.2rem;
        }
        .notif-count {
          position: absolute;
          top: -6px;
          right: -6px;
          background: red;
          color: white;
          font-size: 0.7rem;
          padding: 2px 5px;
          border-radius: 50%;
        }

        /* Notification dropdown flexible width */
        .notif-dropdown {
          width: max-content;
          max-width: 300px;
          white-space: normal;
        }

        .dropdown-menu li { word-break: break-word; }

        .nav-flex { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }

        .left-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

        .navbar-brand { font-size: 1.5rem; font-weight: bold; text-decoration: none; color: white; }

        .auth-buttons { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

        .username { margin-right: 10px; font-size: 0.95rem; }

        .username-link { color: white; text-decoration: none; }
        .username-link:hover { text-decoration: underline; }

        .btn {
          padding: 8px 14px;
          font-size: 0.9rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .login-btn { background-color: #2980b9; color: white; }
        .login-btn:hover { background-color: #3498db; }
        .register-btn { background-color: #2c3e50; color: white; }
        .register-btn:hover { background-color: #34495e; }
        .logout-btn { background-color: #c0392b; color: white; display: block; }
        .logout-btn:hover { background-color: #e74c3c; }

        .dropend { position: relative; }
        .dropend-toggle { background: none; color: white; font-size: 1.2rem; border: none; cursor: pointer; }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 8px;
          background-color: #34495e;
          padding: 8px;
          border-radius: 5px;
          list-style: none;
          min-width: 140px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          z-index: 100;
        }

        .dropdown-menu li { margin-bottom: 6px; }
        .dropdown-menu li:last-child { margin-bottom: 0; }
        .dropdown-menu a, .dropdown-menu button {
          color: white;
          text-decoration: none;
          display: block;
          font-size: 0.9rem;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          padding: 4px 0;
          cursor: pointer;
        }
        .dropdown-menu a:hover, .dropdown-menu button:hover { text-decoration: underline; }

        /* Mobile styles */
        @media (max-width: 768px) {
          .username { display: none; }
          .desktop-logout { display: none; }
          .mobile-logout-item { display: block; }

          .navbar { padding: 10px 15px; }
          .navbar-brand { font-size: 1.8rem; }
          .btn { padding: 6px 10px; font-size: 0.8rem; }
          .dropend-toggle { font-size: 1.5rem; }
          .dropdown-menu { min-width: 120px; padding: 6px; }
          .dropdown-menu a, .dropdown-menu button { font-size: 0.85rem; }
          .nav-flex { flex-direction: column; align-items: flex-start; gap: 8px; }
          .left-group { gap: 8px; width: 100%; justify-content: flex-start; }
          .auth-buttons { width: 100%; justify-content: flex-start; gap: 6px; flex-wrap: wrap; }
        }

        @media (max-width: 480px) {
          .navbar-brand { font-size: 1.1rem; }
          .btn { padding: 5px 8px; font-size: 0.75rem; }
          .dropend-toggle { font-size: 1.2rem; }
          .dropdown-menu { min-width: 100px; padding: 5px; }
          .dropdown-menu a, .dropdown-menu button { font-size: 0.8rem; }
        }
      `}</style>
    </>
  );
}
