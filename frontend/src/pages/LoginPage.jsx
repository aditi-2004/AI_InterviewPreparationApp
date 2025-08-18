import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="brand-section">
          <h1>AI Interview Prep</h1>
          <p>Master your technical interviews with AI-powered practice sessions</p>
          <div className="features">
            <div className="feature">
              <span className="icon">🤖</span>
              <span>AI-Powered Questions</span>
            </div>
            <div className="feature">
              <span className="icon">📊</span>
              <span>Performance Analytics</span>
            </div>
            <div className="feature">
              <span className="icon">💡</span>
              <span>Instant Feedback</span>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <AuthForm mode="login" onSuccess={handleLoginSuccess} />
          <div className="auth-links">
            <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        
        .login-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1000px;
          width: 100%;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .brand-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
        }
        
        .brand-section h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }
        
        .brand-section p {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        
        .features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .feature {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 1rem;
        }
        
        .icon {
          font-size: 1.5rem;
        }
        
        .form-section {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .auth-links {
          text-align: center;
          margin-top: 2rem;
        }
        
        .auth-links a {
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
        }
        
        .auth-links a:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 768px) {
          .login-container {
            grid-template-columns: 1fr;
            max-width: 400px;
          }
          
          .brand-section {
            padding: 2rem;
          }
          
          .brand-section h1 {
            font-size: 2rem;
          }
          
          .features {
            flex-direction: row;
            justify-content: space-around;
          }
          
          .feature {
            flex-direction: column;
            gap: 0.5rem;
            font-size: 0.9rem;
          }
          
          .form-section {
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;