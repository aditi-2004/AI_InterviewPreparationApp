import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);

  const handleStartInterview = () => {
    navigate('/interview');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });
    setDebugInfo(prev => [...prev, { message, timestamp }]);
  };

  const handleTopicClick = async (topic) => {
    setSelectedTopic(topic);
    setLoading(true);
    setError(null);
    setDebugInfo([]); 
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const attemptMessage = `Attempt ${attempt} to fetch questions for ${topic}`;
        addDebugInfo(attemptMessage);
        console.log(`${attemptMessage} at ${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
        
        const response = await fetch(`http://localhost:5000/api/questions/${encodeURIComponent(topic)}?difficulty=medium&count=10`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const statusMessage = `Response status: ${response.status}`;
        addDebugInfo(statusMessage);
        console.log('Response status:', response.status);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const dataMessage = `Received data: ${JSON.stringify(data, null, 2)}`;
        addDebugInfo(dataMessage);
        console.log('Parsed Response Data:', data);
        
        if (data.success && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          addDebugInfo(`Successfully loaded ${data.questions.length} questions`);
          setLoading(false);
          return;
        } else {
          throw new Error('Invalid response format: "questions" array not found or success is false');
        }
      } catch (err) {
        const errorMessage = `Error fetching questions (Attempt ${attempt}): ${err.message}`;
        addDebugInfo(errorMessage);
        console.error(errorMessage);
        if (attempt === 3) {
          setError(`Failed to load questions. Please try again. Error: ${err.message}`);
        }
      }
    }
    setLoading(false);
  };

  const handleClosePopup = () => {
    setSelectedTopic(null);
    setQuestions([]);
    setError(null);
    setDebugInfo([]);
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
              </div>
            </div>

            <div className="topics-section">
              <h3>Popular Interview Topics</h3>
              <div className="topics-grid">
                {[
                  { name: 'JavaScript', icon: '💻', description: 'ES6+, async/await, closures, and more' },
                  { name: 'Data Structures', icon: '🗃️', description: 'Arrays, trees, graphs, hash tables' },
                  { name: 'Algorithms', icon: '⚡', description: 'Sorting, searching, dynamic programming' },
                  { name: 'System Design', icon: '🏗️', description: 'Scalability, architecture, distributed systems' },
                  { name: 'DBMS', icon: '🗄️', description: 'SQL queries, normalization, indexing' },
                  { name: 'React', icon: '⚛️', description: 'Hooks, state management, performance' },
                ].map((topic) => (
                  <div key={topic.name} className="topic-card" onClick={() => handleTopicClick(topic.name)}>
                    <div className="topic-icon">{topic.icon}</div>
                    <h4>{topic.name}</h4>
                    <p>{topic.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="analytics-content">
            <AnalyticsDashboard />
          </div>
        )}

        {/* Popup Modal */}
        {selectedTopic && (
          <div className="modal-overlay" onClick={handleClosePopup}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Top 10 Interview Questions for {selectedTopic}</h3>
                <button className="close-btn" onClick={handleClosePopup}>×</button>
              </div>
              
              {/* Debug Information Box */}
              {debugInfo.length > 0 && (
                <div className="debug-box">
                  <h4>📊 Request Information</h4>
                  <div className="debug-content">
                    {debugInfo.map((info, index) => (
                      <div key={index} className="debug-item">
                        <span className="debug-timestamp">[{info.timestamp}]</span>
                        <span className="debug-message">{info.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {loading && (
                <div className="loading-box">
                  <div className="loading-spinner"></div>
                  <p>Loading questions...</p>
                </div>
              )}
              
              {error && (
                <div className="error-box">
                  <p>❌ {error}</p>
                </div>
              )}
              
              {!loading && !error && questions.length > 0 && (
                <div className="questions-container">
                  <div className="success-message">
                    ✅ Successfully loaded {questions.length} questions
                  </div>
                  <div className="questions-list">
                    {questions.map((q, index) => (
                      <div key={index} className="question-item">
                        <div className="question-header">
                          <strong>Question {index + 1}:</strong>
                        </div>
                        <div className="question-text">{q.question}</div>
                        <div className="answer-section">
                          <em>Ideal Answer:</em>
                          <div className="answer-text">{q.ideal_answer}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!loading && !error && questions.length === 0 && debugInfo.length > 0 && (
                <div className="no-questions-box">
                  <p>No questions available at the moment.</p>
                </div>
              )}
              
              <div className="modal-footer">
                <button className="close-button" onClick={handleClosePopup}>Close</button>
              </div>
            </div>
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
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          border: 2px solid #3498db;
          border-radius: 12px;
          width: 90%;
          max-width: 900px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideIn 0.3s ease-out;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
          border-radius: 10px 10px 0 0;
        }
        
        .modal-header h3 {
          margin: 0;
          color: #2c3e50;
        }
        
        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #666;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }
        
        .close-btn:hover {
          background: #e9ecef;
          color: #333;
        }
        
        .debug-box {
          margin: 1rem 2rem;
          padding: 1rem;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          border-left: 4px solid #007bff;
        }
        
        .debug-box h4 {
          margin: 0 0 0.5rem 0;
          color: #007bff;
          font-size: 0.9rem;
        }
        
        .debug-content {
          max-height: 200px;
          overflow-y: auto;
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
        }
        
        .debug-item {
          margin: 0.25rem 0;
          display: block;
          word-wrap: break-word;
        }
        
        .debug-timestamp {
          color: #6c757d;
          font-weight: bold;
        }
        
        .debug-message {
          color: #495057;
          margin-left: 0.5rem;
        }
        
        .loading-box {
          padding: 2rem;
          text-align: center;
          color: #007bff;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-box {
          margin: 1rem 2rem;
          padding: 1rem;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
          color: #721c24;
        }
        
        .success-message {
          margin: 1rem 2rem;
          padding: 0.75rem;
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 6px;
          color: #155724;
          text-align: center;
          font-weight: 500;
        }
        
        .questions-container {
          padding: 0 2rem 1rem;
        }
        
        .questions-list {
          margin-top: 1rem;
        }
        
        .question-item {
          margin: 1.5rem 0;
          padding: 1.5rem;
          background: #f9f9f9;
          border-radius: 8px;
          border-left: 4px solid #3498db;
        }
        
        .question-header {
          color: #2c3e50;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .question-text {
          color: #34495e;
          margin-bottom: 1rem;
          font-size: 1.05rem;
          line-height: 1.5;
        }
        
        .answer-section {
          color: #666;
        }
        
        .answer-text {
          margin-top: 0.5rem;
          padding: 1rem;
          background: white;
          border-radius: 4px;
          border: 1px solid #e9ecef;
          line-height: 1.6;
        }
        
        .no-questions-box {
          padding: 2rem;
          text-align: center;
          color: #6c757d;
        }
        
        .modal-footer {
          padding: 1rem 2rem;
          border-top: 1px solid #eee;
          text-align: right;
          background: #f8f9fa;
          border-radius: 0 0 10px 10px;
        }
        
        .close-button {
          padding: 0.75rem 1.5rem;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }
        
        .close-button:hover {
          background: #2980b9;
        }
        
        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
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
          
          .modal-content {
            width: 95%;
            max-height: 95vh;
          }
          
          .modal-header, .questions-container, .modal-footer {
            padding: 1rem;
          }
          
          .debug-box {
            margin: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
