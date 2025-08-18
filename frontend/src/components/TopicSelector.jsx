import React, { useState } from 'react';

const TopicSelector = ({ onStartInterview }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [loading, setLoading] = useState(false);

  const topics = [
    'JavaScript',
    'Python',
    'Java',
    'Data Structures',
    'Algorithms',
    'DBMS',
    'System Design',
    'React',
    'Node.js'
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];

  const handleStartInterview = async () => {
    if (!selectedTopic || !selectedDifficulty) {
      alert('Please select both topic and difficulty');
      return;
    }

    setLoading(true);
    try {
      await onStartInterview({
        topic: selectedTopic,
        difficulty: selectedDifficulty
      });
    } catch (error) {
      console.error('Failed to start interview:', error);
      alert('Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="topic-selector">
      <h2>Start Your Technical Interview</h2>
      <p>Choose a topic and difficulty level to begin your AI-powered mock interview session.</p>
      
      <div className="selection-container">
        <div className="selection-group">
          <h3>Select Topic</h3>
          <div className="options-grid">
            {topics.map((topic) => (
              <button
                key={topic}
                className={`option-btn ${selectedTopic === topic ? 'selected' : ''}`}
                onClick={() => setSelectedTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="selection-group">
          <h3>Select Difficulty</h3>
          <div className="options-grid">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty}
                className={`option-btn ${selectedDifficulty === difficulty ? 'selected' : ''}`}
                onClick={() => setSelectedDifficulty(difficulty)}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="start-section">
        <button 
          className="start-btn"
          onClick={handleStartInterview}
          disabled={!selectedTopic || !selectedDifficulty || loading}
        >
          {loading ? 'Starting Interview...' : 'Start Interview'}
        </button>
      </div>

      <style jsx>{`
        .topic-selector {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          text-align: center;
        }
        
        .topic-selector h2 {
          color: #333;
          margin-bottom: 1rem;
        }
        
        .topic-selector p {
          color: #666;
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }
        
        .selection-container {
          display: flex;
          gap: 3rem;
          justify-content: center;
          margin-bottom: 3rem;
        }
        
        .selection-group {
          flex: 1;
          max-width: 350px;
        }
        
        .selection-group h3 {
          color: #444;
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }
        
        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
        }
        
        .option-btn {
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .option-btn:hover {
          border-color: #007bff;
          background: #f8f9fa;
        }
        
        .option-btn.selected {
          border-color: #007bff;
          background: #007bff;
          color: white;
        }
        
        .start-section {
          margin-top: 2rem;
        }
        
        .start-btn {
          padding: 1rem 2rem;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .start-btn:hover:not(:disabled) {
          background: #218838;
          transform: translateY(-2px);
        }
        
        .start-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }
        
        @media (max-width: 768px) {
          .selection-container {
            flex-direction: column;
            gap: 2rem;
          }
          
          .options-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default TopicSelector;
