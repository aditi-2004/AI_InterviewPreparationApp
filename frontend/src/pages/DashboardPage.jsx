import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleStartInterview = () => {
    navigate('/interview');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      {/* Navigation Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="brand">
            <h1>AI Interview Prep</h1>
            <span className="tagline">Technical Interview Practice</span>
          </div>
          
          <nav className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analytics
            </button>
          </nav>
          
          <div className="user-section">
            <div className="user-info">
              <span className="greeting">Hello, {user?.name}</span>
              <span className="email">{user?.email}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'overview' ? (
          <div className="overview-content">
            <div className="welcome-section">
              <div className="welcome-card">
                <h2>Welcome back, {user?.name}! 👋</h2>
                <p>Ready to practice your technical interview skills? Start a new session or review your progress.</p>
                <button onClick={handleStartInterview} className="start-interview-btn">
                  Start New Interview
                </button>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <div className="action-card" onClick={handleStartInterview}>
                  <div className="action-icon">🚀</div>
                  <h4>Start Interview</h4>
                  <p>Begin a new AI-powered technical interview session</p>
                </div>
                
                <div className="action-card" onClick={() => setActiveTab('analytics')}>
                  <div className="action-icon">📊</div>
                  <h4>View Analytics</h4>
                  <p>Check your performance metrics and progress</p>
                </div>
                
                {/* <div className="action-card">
                  <div className="action-icon">📚</div>
                  <h4>Study Resources</h4>
                  <p>Access curated materials for interview preparation</p>
                </div>
                
                <div className="action-card">
                  <div className="action-icon">⚙️</div>
                  <h4>Settings</h4>
                  <p>Customize your interview preferences and topics</p>
                </div> */}
              </div>
            </div>

            <div className="topics-section">
              <h3>Popular Interview Topics</h3>
              <div className="topics-grid">
                <div className="topic-card">
                  <div className="topic-icon">💻</div>
                  <h4>JavaScript</h4>
                  <p>ES6+, async/await, closures, and more</p>
                </div>
                <div className="topic-card">
                  <div className="topic-icon">🗃️</div>
                  <h4>Data Structures</h4>
                  <p>Arrays, trees, graphs, hash tables</p>
                </div>
                <div className="topic-card">
                  <div className="topic-icon">⚡</div>
                  <h4>Algorithms</h4>
                  <p>Sorting, searching, dynamic programming</p>
                </div>
                <div className="topic-card">
                  <div className="topic-icon">🏗️</div>
                  <h4>System Design</h4>
                  <p>Scalability, architecture, distributed systems</p>
                </div>
                <div className="topic-card">
                  <div className="topic-icon">🗄️</div>
                  <h4>DBMS</h4>
                  <p>SQL queries, normalization, indexing</p>
                </div>
                <div className="topic-card">
                  <div className="topic-icon">⚛️</div>
                  <h4>React</h4>
                  <p>Hooks, state management, performance</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="analytics-content">
            <AnalyticsDashboard />
          </div>
        )}
      </main>

      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background: #f8f9fa;
        }
        
        .dashboard-header {
          background: white;
          border-bottom: 1px solid #e9ecef;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
        }
        
        .brand h1 {
          margin: 0;
          color: #333;
          font-size: 1.5rem;
        }
        
        .tagline {
          color: #666;
          font-size: 0.9rem;
        }
        
        .nav-tabs {
          display: flex;
          gap: 1rem;
        }
        
        .nav-tab {
          padding: 0.75rem 1.5rem;
          background: none;
          border: 2px solid transparent;
          border-radius: 6px;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        
        .nav-tab:hover {
          color: #007bff;
          background: #f8f9fa;
        }
        
        .nav-tab.active {
          color: #007bff;
          border-color: #007bff;
          background: #f8f9ff;
        }
        
        .user-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .greeting {
          font-weight: 600;
          color: #333;
        }
        
        .email {
          font-size: 0.8rem;
          color: #666;
        }
        
        .logout-btn {
          padding: 0.5rem 1rem;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .logout-btn:hover {
          background: #c82333;
        }
        
        .dashboard-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .welcome-section {
          margin-bottom: 3rem;
        }
        
        .welcome-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem;
          border-radius: 12px;
          text-align: center;
        }
        
        .welcome-card h2 {
          margin: 0 0 1rem 0;
          font-size: 2rem;
        }
        
        .welcome-card p {
          margin: 0 0 2rem 0;
          font-size: 1.1rem;
          opacity: 0.9;
        }
        
        .start-interview-btn {
          padding: 1rem 2rem;
          background: white;
          color: #764ba2;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .start-interview-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        .quick-actions, .topics-section {
          margin-bottom: 3rem;
        }
        
        .quick-actions h3, .topics-section h3 {
          color: #333;
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
        }
        
        .actions-grid, .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        
        .action-card, .topic-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        
        .action-card:hover, .topic-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .action-icon, .topic-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          display: block;
        }
        
        .action-card h4, .topic-card h4 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.1rem;
        }
        
        .action-card p, .topic-card p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .analytics-content {
          background: white;
          border-radius: 12px;
          padding: 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 1024px) {
          .header-content {
            flex-direction: column;
            gap: 1rem;
          }
          
          .nav-tabs {
            order: -1;
          }
          
          .user-section {
            width: 100%;
            justify-content: space-between;
          }
        }
        
        @media (max-width: 768px) {
          .dashboard-header {
            padding: 0 1rem;
          }
          
          .dashboard-main {
            padding: 1rem;
          }
          
          .welcome-card {
            padding: 2rem;
          }
          
          .welcome-card h2 {
            font-size: 1.5rem;
          }
          
          .actions-grid, .topics-grid {
            grid-template-columns: 1fr;
          }
          
          .user-info {
            align-items: flex-start;
          }
          
          .nav-tabs {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
