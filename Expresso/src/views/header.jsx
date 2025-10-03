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
    color: white;
    background: transparent;
  }

  .navbar {
    width: 100%;
    position: sticky;
    top: 0;
    z-index: 1000;
    padding: 12px 20px;
    background: rgba(0,0,0,0.3);
    backdrop-filter: blur(10px);
    border-radius: 0 0 15px 15px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    margin-bottom: 20px;
  }

  .nav-flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .left-group {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .navbar-brand {
    font-size: 1.6rem;
    font-weight: bold;
    text-decoration: none;
    color: #ffd369;
    text-shadow: 1px 1px 5px rgba(0,0,0,0.5);
  }

  .dropend { position: relative; }
  .dropend-toggle {
    background: linear-gradient(90deg, #667eea, #764ba2);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
  }
  .dropend-toggle:hover {
    background: linear-gradient(90deg, #5a67d8, #6b46c1);
    transform: translateY(-2px) scale(1.05);
  }

  .dropdown-menu {
    position: absolute;
    top: 120%;
    left: 0;
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(10px);
    border-radius: 10px;
    padding: 10px 0;
    min-width: 160px;
    list-style: none;
    box-shadow: 0 8px 20px rgba(0,0,0,0.4);
    z-index: 100;
  }
  .dropdown-menu li {
    padding: 6px 20px;
  }
  .dropdown-menu li:hover {
    background: rgba(255,255,255,0.15);
  }
  .dropdown-menu a, .dropdown-menu button {
    color: white;
    text-decoration: none;
    display: block;
    width: 100%;
    text-align: left;
    border: none;
    background: none;
    cursor: pointer;
  }

  .notif-btn {
    position: relative;
    background: linear-gradient(90deg, #ffd369, #ff9f43);
    color: white;
    padding: 8px 12px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
  }
  .notif-btn:hover {
    background: linear-gradient(90deg, #ffc857, #ff7f50);
    transform: translateY(-2px) scale(1.05);
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

  .auth-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .username {
    font-size: 0.95rem;
  }
  .username-link {
    color: #ffd369;
    text-decoration: none;
  }
  .username-link:hover {
    text-decoration: underline;
  }

  .btn {
    padding: 8px 16px;
    font-size: 0.9rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .login-btn { background: #2980b9; color: white; }
  .login-btn:hover { background: #3498db; }
  .register-btn { background: #2c3e50; color: white; }
  .register-btn:hover { background: #34495e; }
  .logout-btn { background: #c0392b; color: white; }
  .logout-btn:hover { background: #e74c3c; }

 /* Mobile styles */
@media (max-width: 768px) {
  /* Hide username and desktop logout */
  .username,
  .desktop-logout {
    display: none;
  }

  /* Make nav-flex vertical */
  .nav-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .left-group {
    width: 100%;
    justify-content: flex-start;
    gap: 8px;
  }
  .auth-buttons {
    width: 100%;
    justify-content: flex-start;
    gap: 8px;
  }

  /* Full-width buttons */
  .dropend-toggle,
  .notif-btn,
  .btn {
    width: 100%;
    text-align: center;
  }

  /* Mobile dropdown menu */
  .dropdown-menu {
    width: 100%;
    max-height: 300px;          /* scrollable if too tall */
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.85);
    padding: 10px 0;
    border-radius: 10px;
    list-style: none;
    left: 0;
    right: 0;
    z-index: 200;
    box-shadow: 0 8px 20px rgba(0,0,0,0.5);
  }

  .dropdown-menu li {
    padding: 10px 20px;
    word-break: break-word;
  }
  .dropdown-menu li:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 10px 12px;
  }
  .navbar-brand {
    font-size: 1.4rem;
  }
  .dropend-toggle,
  .notif-btn,
  .btn {
    padding: 10px;
    font-size: 0.85rem;
  }
  .dropdown-menu li {
    padding: 8px 10px;
  }
}

`}</style>

    </>
  );
}
