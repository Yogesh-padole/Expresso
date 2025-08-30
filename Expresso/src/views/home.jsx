import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <div className="home-container">
        <div className="hero-section">
          <h1>Welcome to <span className="highlight">Expresso</span> ☕</h1>
          <p className="subtitle">
            Share experiences, moments, and feelings—anonymously or openly—without judgment.
          </p>
        </div>

        <div className="content-section">
          <section>
            <h2>About Expresso</h2>
            <p>
              Expresso is a safe space to express your thoughts, memorable moments, and even personal
              regrets. Whether it’s a happy memory, a life lesson, or something heavy on your mind—this
              is your corner to be heard and to read others’ journeys.
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
              <li>Be respectful—no harassment, bullying, or personal attacks.</li>
              <li>Do not harm or target any person, religion, community, or group.</li>
              <li>No hate speech, abusive language, or explicit content.</li>
              <li>Share responsibly—avoid sharing others’ private information.</li>
              <li>Use the report option for any content that breaks these rules.</li>
            </ul>
          </section>

          <p className="footer-note">
            🌟 Let’s keep Expresso kind, supportive, and meaningful. 🌟
          </p>
        </div>
        
        <div className="buttons">
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
          <Link to="/register" className="btn btn-secondary">Register</Link>
        </div>
      </div>

      <style>{`
        body {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #24333dff;
          color: white;
        }

        .home-container {
          padding: 40px 20px;
          max-width: 960px;
          margin: 0 auto;
          
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          
        }

        .hero-section {
          text-align: center;
          margin-bottom: 60px;
          padding: 40px 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }

        .hero-section h1 {
          font-size: 3rem;
          margin-bottom: 10px;
          text-shadow: 2px 2px 6px rgba(0,0,0,0.5);
        }

        .highlight {
          color: #1396ddff;
        }

        .subtitle {
          font-size: 1.25rem;
          color: #ccc;
        }

        .buttons {
          margin-top: 25px;
          display: flex;
          justify-content: center;
          gap: 15px;
        }

        .btn {
          padding: 12px 24px;
          border: 2px solid transparent;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          text-decoration: none;
          transition: background-color 0.3s, color 0.3s, border-color 0.3s;
          position: relative;
          overflow: hidden;
        }

        .btn-primary {
          background-color: #3498db;
          color: white;
          border-color: #3498db;
        }

        .btn-primary:hover {
          background-color: white;
          color: #3498db;
          border-color: #3498db;
        }

        .btn-secondary {
          background-color: #95a5a6;
          color: white;
          border-color: #95a5a6;
        }

        .btn-secondary:hover {
          background-color: white;
          color: #95a5a6;
          border-color: #95a5a6;
        }

        .content-section {
          margin-top: 40px;
        }

        section {
          margin-bottom: 40px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        h2 {
          font-size: 1.8rem;
          color: #198edcff;
          margin-bottom: 15px;
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
          color: #ccc;
          line-height: 1.6;
        }

        .footer-note {
          text-align: center;
          margin-top: 60px;
          font-style: italic;
          color: #aaa;
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
