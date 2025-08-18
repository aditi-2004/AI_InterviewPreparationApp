import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="brand-section">
          <h1>Join AI Interview Prep</h1>
          <p>Start your journey to interview success with personalized AI coaching</p>
          <div className="benefits">
            <div className="benefit">
              <span className="icon">✅</span>
              <span>Practice unlimited technical interviews</span>
            </div>
            <div className="benefit">
              <span className="icon">📈</span>
              <span>Track your progress over time</span>
            </div>
            <div className="benefit">
              <span className="icon">🎯</span>
              <span>Get targeted feedback on weak areas</span>
            </div>
            <div className="benefit">
              <span className="icon">⚡</span>
              <span>Improve faster with AI insights</span>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <AuthForm mode="signup" onSuccess={handleRegisterSuccess} />
          <div className="auth-links">
            <p>Already have an account? <Link to="/login">Login here</Link></p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .register-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        
        .register-container {
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
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          color: white;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
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
        
        .benefits {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .benefit {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          font-size: 1rem;
        }
        
        .icon {
          font-size: 1.2rem;
          margin-top: 0.1rem;
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
          .register-container {
            grid-template-columns: 1fr;
            max-width: 400px;
          }
          
          .brand-section {
            padding: 2rem;
            order: 2;
          }
          
          .brand-section h1 {
            font-size: 2rem;
          }
          
          .form-section {
            padding: 2rem;
            order: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;