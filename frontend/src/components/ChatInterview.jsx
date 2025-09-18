import React, { useState, useEffect, useRef } from 'react';
import { interviewAPI } from '../api';

const ChatInterview = ({ interviewData, onEndInterview }) => {
  const [messages, setMessages] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (interviewData) {
      setCurrentQuestion(interviewData.question);
      setMessages([
        {
          type: 'ai',
          content: `Welcome to your technical interview! Let's begin with your first question:`,
          timestamp: new Date()
        },
        {
          type: 'ai',
          content: interviewData.question.text,
          timestamp: new Date()
        }
      ]);
      setQuestionCount(1);
    }
  }, [interviewData]);

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer before submitting.');
      return;
    }

    setLoading(true);

   
    const userMessage = {
      type: 'user',
      content: currentAnswer,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      
      const response = await interviewAPI.submitAnswer({
        question_id: currentQuestion.id,
        user_response: currentAnswer
      });

      const feedbackMessage = {
        type: 'ai',
        content: `Score: ${response.data.score}/100\nFeedback: ${response.data.feedback}`,
        timestamp: new Date(),
        isCorrect: response.data.is_correct
      };
      setMessages(prev => [...prev, feedbackMessage]);

      setCurrentAnswer('');
      
     
      setTimeout(() => {
        getNextQuestion();
      }, 2000);

    } catch (error) {
      console.error('Error submitting answer:', error);
      const errorMessage = {
        type: 'ai',
        content: 'Sorry, there was an error evaluating your answer. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getNextQuestion = async () => {
    if (questionCount >= 5) {
      handleEndInterview();
      return;
    }

    setLoading(true);
    try {
      const response = await interviewAPI.getNextQuestion(interviewData.interview_id);
      
      setCurrentQuestion(response.data.question);
      setQuestionCount(prev => prev + 1);
      
      const nextQuestionMessage = {
        type: 'ai',
        content: `Question ${questionCount + 1}: ${response.data.question.text}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, nextQuestionMessage]);

    } catch (error) {
      console.error('Error getting next question:', error);
      const errorMessage = {
        type: 'ai',
        content: 'Sorry, there was an error getting the next question. The interview will end here.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setTimeout(handleEndInterview, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEndInterview = async () => {
    try {
      await interviewAPI.endInterview(interviewData.interview_id);
      const endMessage = {
        type: 'ai',
        content: 'Interview completed! Thank you for participating. You can view your performance analytics in the dashboard.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, endMessage]);
      
      setTimeout(() => {
        onEndInterview();
      }, 3000);
    } catch (error) {
      console.error('Error ending interview:', error);
      onEndInterview();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmitAnswer();
    }
  };

  return (
    <div className="chat-interview">
      <div className="chat-header">
        <h2>Technical Interview Session</h2>
        <div className="progress">Question {questionCount} of 5</div>
        <button onClick={handleEndInterview} className="end-btn">
          End Interview
        </button>
      </div>
      
      <div className="chat-container">
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <div className="message-content">
                <div className="text">{message.content}</div>
                <div className="timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="message ai">
              <div className="message-content">
                <div className="text">Processing...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="input-section">
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer here... (Ctrl+Enter to submit)"
            rows="4"
            disabled={loading || questionCount > 5}
          />
          <button 
            onClick={handleSubmitAnswer}
            disabled={loading || !currentAnswer.trim() || questionCount > 5}
            className="submit-btn"
          >
            {loading ? 'Submitting...' : 'Submit Answer'}
          </button>
        </div>
      </div>

      <style jsx>{`
        .chat-interview {
          height: 100vh;
          display: flex;
          flex-direction: column;
          max-width: 900px;
          margin: 0 auto;
          background: white;
        }
        
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
        }
        
        .chat-header h2 {
          margin: 0;
          color: #333;
        }
        
        .progress {
          font-weight: 500;
          color: #666;
        }
        
        .end-btn {
          padding: 0.5rem 1rem;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .end-btn:hover {
          background: #c82333;
        }
        
        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          background: #f5f5f5;
        }
        
        .message {
          margin-bottom: 1rem;
          display: flex;
        }
        
        .message.user {
          justify-content: flex-end;
        }
        
        .message.ai {
          justify-content: flex-start;
        }
        
        .message-content {
          max-width: 70%;
          padding: 1rem;
          border-radius: 12px;
          position: relative;
        }
        
        .message.user .message-content {
          background: #007bff;
          color: white;
        }
        
        .message.ai .message-content {
          background: white;
          border: 1px solid #ddd;
          color: #333;
        }
        
        .text {
          white-space: pre-wrap;
          line-height: 1.4;
        }
        
        .timestamp {
          font-size: 0.8rem;
          opacity: 0.7;
          margin-top: 0.5rem;
        }
        
        .input-section {
          padding: 1rem;
          background: white;
          border-top: 1px solid #eee;
        }
        
        .input-section textarea {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1rem;
          font-family: inherit;
          font-size: 1rem;
          resize: vertical;
          margin-bottom: 1rem;
        }
        
        .input-section textarea:focus {
          outline: none;
          border-color: #007bff;
        }
        
        .submit-btn {
          padding: 0.75rem 2rem;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          float: right;
        }
        
        .submit-btn:hover:not(:disabled) {
          background: #218838;
        }
        
        .submit-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .chat-header {
            flex-direction: column;
            gap: 1rem;
            padding: 1rem;
          }
          
          .message-content {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatInterview;
