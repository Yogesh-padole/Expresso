import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Header() {
  const [username, setUsername] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const auth = getAuth();
  const dropdownRef = useRef();
  const tagsRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.userId || user.email);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
      if (tagsRef.current && !tagsRef.current.contains(event.target)) {
        setTagsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUsername("");
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-flex">
          {/* Left side */}
          <div className="left-group" ref={dropdownRef}>
            {/* Dropend menu */}
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
                </ul>
              )}
            </div>

            {/* Brand */}
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
          </div>

          {/* Right side */}
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
                <button onClick={handleLogout} className="btn logout-btn">
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
        }

        .nav-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .left-group {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .navbar-brand {
          font-size: 1.5rem;
          font-weight: bold;
          text-decoration: none;
          color: white;
        }

        .auth-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .username {
          margin-right: 10px;
        }

        .username-link {
          color: white;
          text-decoration: none;
        }

        .username-link:hover {
          text-decoration: underline;
        }

        .btn {
          padding: 8px 14px;
          font-size: 0.9rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s;
        }

        .login-btn {
          background-color: #2980b9;
          color: white;
        }

        .login-btn:hover {
          background-color: #3498db;
        }

        .register-btn {
          background-color: #2c3e50;
          color: white;
        }

        .register-btn:hover {
          background-color: #34495e;
        }

        .logout-btn {
          background-color: #c0392b;
          color: white;
        }

        .logout-btn:hover {
          background-color: #e74c3c;
        }

        .dropend {
          position: relative;
        }

        .dropend-toggle {
          background: none;
          color: white;
          font-size: 1.2rem;
          border: none;
          cursor: pointer;
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 10px;
          background-color: transparent;
          padding: 10px;
          border-radius: 5px;
          list-style: none;
          min-width: 140px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }

        .dropdown-menu li {
          margin-bottom: 8px;
        }

        .dropdown-menu li:last-child {
          margin-bottom: 0;
        }

        .dropdown-menu a {
          color: white;
          text-decoration: none;
          display: block;
        }

        .dropdown-menu a:hover {
          text-decoration: underline;
        }

        @media (max-width: 600px) {
          .navbar-brand {
            font-size: 1.2rem;
          }
          .btn {
            padding: 6px 10px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
}
