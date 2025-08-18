import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopicSelector from '../components/TopicSelector';
import ChatInterview from '../components/ChatInterview';
import { interviewAPI } from '../api';

const InterviewPage = () => {
  const [currentStep, setCurrentStep] = useState('selection'); // 'selection' or 'interview'
  const [interviewData, setInterviewData] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleStartInterview = async (selectionData) => {
    try {
      setError('');
      const response = await interviewAPI.startInterview(selectionData);
      setInterviewData(response.data);
      setCurrentStep('interview');
    } catch (err) {
      console.error('Failed to start interview:', err);
      setError(err.response?.data?.message || 'Failed to start interview. Please try again.');
    }
  };

  const handleEndInterview = () => {
    navigate('/dashboard');
  };

  const handleBackToSelection = () => {
    setCurrentStep('selection');
    setInterviewData(null);
    setError('');
  };

  return (
    <div className="interview-page">
      {currentStep === 'selection' ? (
        <div className="selection-wrapper">
          <div className="header">
            <button onClick={() => navigate('/dashboard')} className="back-btn">
              ← Back to Dashboard
            </button>
            <h1>AI Technical Interview</h1>
            <div className="placeholder"></div>
          </div>
          
          {error && (
            <div className="error-banner">
              <div className="error-content">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
                <button onClick={() => setError('')} className="close-error">×</button>
              </div>
            </div>
          )}
          
          <TopicSelector onStartInterview={handleStartInterview} />
          
          <div className="info-section">
            <div className="info-cards">
              <div className="info-card">
                <h3>How it works</h3>
                <ul>
                  <li>Choose your topic and difficulty level</li>
                  <li>Answer 5 AI-generated technical questions</li>
                  <li>Receive instant feedback and scoring</li>
                  <li>Review your performance analytics</li>
                </ul>
              </div>
              <div className="info-card">
                <h3>Tips for success</h3>
                <ul>
                  <li>Think aloud and explain your reasoning</li>
                  <li>Don't be afraid to ask clarifying questions</li>
                  <li>Focus on problem-solving approach</li>
                  <li>Learn from the feedback provided</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="interview-wrapper">
          <div className="interview-header">
            <button onClick={handleBackToSelection} className="back-btn">
              ← Back to Selection
            </button>
            <div className="interview-title">
              <h2>Live Interview Session</h2>
              <span className="topic-info">
                {interviewData?.topic} - {interviewData?.difficulty}
              </span>
            </div>
          </div>
          
          <ChatInterview 
            interviewData={interviewData}
            onEndInterview={handleEndInterview}
          />
        </div>
      )}

      <style jsx>{`
        .interview-page {
          min-height: 100vh;
          background: #f5f7fa;
        }
        
        .selection-wrapper {
          padding: 2rem 0;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem 2rem;
        }
        
        .header h1 {
          color: #333;
          margin: 0;
          font-size: 2rem;
        }
        
        .back-btn {
          padding: 0.75rem 1.5rem;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s;
        }
        
        .back-btn:hover {
          background: #5a6268;
        }
        
        .placeholder {
          width: 120px;
        }
        
        .error-banner {
          max-width: 1200px;
          margin: 0 auto 2rem;
          padding: 0 2rem;
        }
        
        .error-content {
          background: #f8d7da;
          color: #721c24;
          padding: 1rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 1rem;
          border: 1px solid #f5c6cb;
        }
        
        .error-icon {
          font-size: 1.2rem;
        }
        
        .close-error {
          background: none;
          border: none;
          color: #721c24;
          font-size: 1.5rem;
          cursor: pointer;
          margin-left: auto;
          padding: 0;
        }
        
        .info-section {
          max-width: 1200px;
          margin: 3rem auto 0;
          padding: 0 2rem;
        }
        
        .info-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }
        
        .info-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .info-card h3 {
          color: #333;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }
        
        .info-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .info-card li {
          padding: 0.5rem 0;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }
        
        .info-card li:last-child {
          border-bottom: none;
        }
        
        .info-card li:before {
          content: "•";
          color: #007bff;
          font-weight: bold;
          margin-top: 0.1rem;
        }
        
        .interview-wrapper {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .interview-header {
          background: white;
          padding: 1rem 2rem;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        
        .interview-title h2 {
          margin: 0;
          color: #333;
          font-size: 1.5rem;
        }
        
        .topic-info {
          color: #666;
          font-size: 0.9rem;
          font-weight: normal;
        }
        
        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          
          .placeholder {
            display: none;
          }
          
          .interview-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .info-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default InterviewPage;
