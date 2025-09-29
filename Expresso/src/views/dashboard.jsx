import { Link } from 'react-router-dom';
import Header from './header';
import UserPosts from '../components/userposts';


export default function Dashboard() {
  return (
    <>
      <Header />
      <div className="dashboard-container">
        <div className="dashboard-content">
          
          

          <UserPosts />
          

        </div>
      </div>

      <style>{`
        .dashboard-container {
          background-color: transparent;
          min-height: 100vh;
          color: white;
          padding: 40px 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: -150px;
        }

        .dashboard-content {
          max-width: 800px;
          text-align: center;
          width: 100%;
        }

        .dashboard-title {
          font-size: 2.8rem;
          font-weight: bold;
          margin-bottom: 20px;
          margin-top: 110px;
          text-shadow: 2px 2px 4px rgba(151, 183, 211, 0.5);
        }

        .dashboard-subtitle {
          font-size: 1.2rem;
          margin-bottom: 40px;
        }

        .dashboard-buttons {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .btn-outline {
          padding: 12px 24px;
          font-size: 1rem;
          border: 2px solid;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s ease;
          width: fit-content;
        }

        .btn-outline.primary {
          border-color: #3498db;
          color: #3498db;
        }

        .btn-outline.primary:hover {
          background-color: #3498db;
          color: white;
        }

        .btn-outline.secondary {
          border-color: #95a5a6;
          color: #95a5a6;
        }

        .btn-outline.secondary:hover {
          background-color: #95a5a6;
          color: white;
        }

        @media (max-width: 600px) {
          .dashboard-title {
            font-size: 2rem;
          }

          .dashboard-subtitle {
            font-size: 1rem;
          }

          .btn-outline {
            font-size: 0.9rem;
            padding: 10px 20px;
          }
        }
      `}</style>
    </>
  );
}
