import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { Bot, BarChart3, Zap } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 flex items-center justify-center p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-100">
        
        {/* Brand Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-800 text-white p-8 md:p-12 flex flex-col justify-center items-center text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">AI Interview Prep</h1>
          <p className="text-sm md:text-base opacity-90 mb-8 max-w-xs">
            Master your technical interviews with AI-powered practice sessions
          </p>
          <div className="flex flex-col gap-4 w-full max-w-xs text-left">
            <div className="flex items-center gap-4 text-sm font-medium bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10 transition hover:bg-white/15">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <span>AI-Powered Questions</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10 transition hover:bg-white/15">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span>Performance Analytics</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10 transition hover:bg-white/15">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 text-white shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <span>Instant Feedback</span>
            </div>
          </div>
        </div>
        
        {/* Form Section */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
          <AuthForm mode="login" onSuccess={handleLoginSuccess} />
          <div className="text-center mt-6 text-sm text-slate-500">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold transition duration-150">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;