import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section">
          <h1>
            Welcome to <span className="highlight">Expresso</span> ☕
          </h1>
          <p className="subtitle">
            Share experiences, moments, and feelings—anonymously or
            openly—without judgment.
          </p>
        </div>

        {/* Content Section */}
        <div className="content-section">
          <section>
            <h2>About Expresso</h2>
            <p>
              Expresso is a safe space to express your thoughts, memorable
              moments, and even personal regrets. Whether it’s a happy memory, a
              life lesson, or something heavy on your mind—this is your corner
              to be heard and to read others’ journeys.
            </p>
          </section>

          <section>
            <h2>How It Works</h2>
            <ul>
              <li>Sign up or log in (or post anonymously if you prefer).</li>
              <li>Create a post: write your experience, moment, or thought.</li>
              <li>Explore the feed and interact with others’ posts.</li>
              <li>Use tags or categories to find relevant stories.</li>
              <li>Report anything that violates community guidelines.</li>
            </ul>
          </section>

          <section>
            <h2>Community Guidelines</h2>
            <ul>
              <li>
                Be respectful—no harassment, bullying, or personal attacks.
              </li>
              <li>
                Do not harm or target any person, religion, community, or group.
              </li>
              <li>No hate speech, abusive language, or explicit content.</li>
              <li>
                Share responsibly—avoid sharing others’ private information.
              </li>
              <li>
                Use the report option for any content that breaks these rules.
              </li>
            </ul>
          </section>

          <p className="footer-note">
            🌟 Let’s keep Expresso kind, supportive, and meaningful. 🌟
          </p>
        </div>

        {/* Buttons */}
        <div className="buttons">
          <Link to="/login" className="btn btn-primary">
            Go to Login
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Register
          </Link>
        </div>
      </div>

      {/* Styles */}
      <style>{` 

        .home-container {
          padding: 40px 20px;
          max-width: 960px;
          margin: 0 auto;
          border-radius: 12px;
          animation: fadeIn 1.2s ease;
        }

        /* Hero Section */
        .hero-section {
          text-align: center;
          margin-bottom: 60px;
          padding: 60px 20px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 15px;
          backdrop-filter: blur(12px);
          transform: perspective(800px) rotateX(0deg);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          transition: transform 0.4s ease;
        }

        .hero-section:hover {
          transform: perspective(800px) rotateX(5deg);
        }

        .hero-section h1 {
          font-size: 3rem;
          margin-bottom: 15px;
          text-shadow: 2px 2px 10px rgba(0,0,0,0.6);
        }

        .highlight {
          color: #00c6ff;
          background: linear-gradient(45deg, #00c6ff, #0072ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          font-size: 1.25rem;
          color: #dce7f3;
          animation: fadeUp 1.5s ease;
        }

        /* Buttons */
        .buttons {
          margin-top: 25px;
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .btn {
          padding: 12px 28px;
          border: 2px solid transparent;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: bold;
          cursor: pointer;
          text-decoration: none;
          position: relative;
          transition: all 0.4s ease;
          overflow: hidden;
        }

        .btn::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.15) 20%, transparent 60%);
          transform: rotate(25deg);
          transition: opacity 0.4s;
          opacity: 0;
        }

        .btn:hover::before {
          opacity: 1;
        }

        .btn-primary {
          background: linear-gradient(145deg, #3498db, #2980b9);
          color: white;
          border-color: #2980b9;
          box-shadow: 0 6px 20px rgba(52,152,219,0.4);
        }

        .btn-primary:hover {
          background: linear-gradient(145deg, #5dade2, #3498db);
          transform: translateY(-3px) scale(1.05);
        }

        .btn-secondary {
          background: linear-gradient(145deg, #95a5a6, #7f8c8d);
          color: white;
          border-color: #7f8c8d;
          box-shadow: 0 6px 20px rgba(149,165,166,0.4);
        }

        .btn-secondary:hover {
          background: linear-gradient(145deg, #bdc3c7, #95a5a6);
          transform: translateY(-3px) scale(1.05);
        }

        /* Content Section */
        .content-section {
          margin-top: 40px;
          animation: fadeUp 1.5s ease;
        }

        section {
          margin-bottom: 40px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          box-shadow: inset 0 0 15px rgba(255,255,255,0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        section:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        }

        h2 {
          font-size: 1.8rem;
          color: #00c6ff;
          margin-bottom: 15px;
          text-shadow: 1px 1px 5px rgba(0,0,0,0.4);
        }

        ul {
          padding-left: 20px;
          list-style: disc;
          color: #ccc;
        }

        ul li {
          margin-bottom: 10px;
        }

        p {
          color: #ddd;
          line-height: 1.6;
        }

        .footer-note {
          text-align: center;
          margin-top: 60px;
          font-style: italic;
          color: #aaa;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .hero-section h1 {
            font-size: 2rem;
          }

          .btn {
            padding: 10px 20px;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  );
}
