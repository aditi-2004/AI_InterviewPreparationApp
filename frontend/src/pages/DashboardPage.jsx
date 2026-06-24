import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import LearningRoadmap from '../components/LearningRoadmap';
import { LayoutDashboard, BarChart3, Map, LogOut, Play, Compass, Code, Database, Globe, BookOpen, Layers, X, Info } from 'lucide-react';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStartInterview = () => {
    navigate('/interview');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTopicClick = async (topic) => {
    setSelectedTopic(topic);
    setLoading(true);
    setError(null);
    try {
      const backendUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api'
        : 'https://ai-interviewpreparationapp-1.onrender.com/api';
      const response = await fetch(`${backendUrl}/questions/${encodeURIComponent(topic)}?difficulty=medium&count=10`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.success && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to load questions. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    setSelectedTopic(null);
    setQuestions([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">AI</div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">AI Interview Prep</h1>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Technical Interview Coach</span>
            </div>
          </div>
          
          <nav className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              className={`flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:text-blue-600 font-semibold text-xs rounded-lg transition duration-200 ${activeTab === 'overview' ? 'text-blue-600 bg-white shadow-sm' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard className="w-4 h-4" /> Overview
            </button>
            <button 
              className={`flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:text-blue-600 font-semibold text-xs rounded-lg transition duration-200 ${activeTab === 'analytics' ? 'text-blue-600 bg-white shadow-sm' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 className="w-4 h-4" /> Analytics
            </button>
            <button 
              className={`flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:text-blue-600 font-semibold text-xs rounded-lg transition duration-200 ${activeTab === 'roadmap' ? 'text-blue-600 bg-white shadow-sm' : ''}`}
              onClick={() => setActiveTab('roadmap')}
            >
              <Map className="w-4 h-4" /> Roadmap
            </button>
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end text-right">
              <span className="font-semibold text-slate-800 text-sm">Hello, {user?.name}</span>
              <span className="text-[10px] text-slate-400">{user?.email}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-650 border border-red-200 rounded-lg text-xs font-semibold cursor-pointer transition duration-150"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'overview' ? (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-2xl shadow-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Welcome back, {user?.name}! 👋</h2>
                <p className="text-sm text-blue-100 leading-relaxed max-w-lg">Ready to practice your technical interview skills? Start a new session or review your progress.</p>
              </div>
              <button 
                onClick={handleStartInterview} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-md hover:-translate-y-0.5 transition duration-200 cursor-pointer text-sm"
              >
                <Play className="w-4 h-4 fill-current" /> Start New Interview
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800 mb-4 border-l-4 border-blue-500 pl-3">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div 
                  className="bg-white border border-slate-200 p-6 rounded-xl cursor-pointer hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition duration-200 flex flex-col items-center text-center"
                  onClick={handleStartInterview}
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xl mb-3"><Compass className="w-6 h-6" /></div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Start Mock Interview</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Begin a new AI-powered technical interview session</p>
                </div>
                
                <div 
                  className="bg-white border border-slate-200 p-6 rounded-xl cursor-pointer hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition duration-200 flex flex-col items-center text-center"
                  onClick={() => setActiveTab('analytics')}
                >
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-xl mb-3"><BarChart3 className="w-6 h-6" /></div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">View Analytics</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Check your performance metrics and progress</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800 mb-4 border-l-4 border-blue-500 pl-3">Popular Interview Topics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: 'JavaScript', icon: <Code className="w-6 h-6" />, description: 'ES6+, async/await, closures, and more', color: 'bg-yellow-50 text-yellow-600' },
                  { name: 'Data Structures', icon: <Layers className="w-6 h-6" />, description: 'Arrays, trees, graphs, hash tables', color: 'bg-emerald-50 text-emerald-600' },
                  { name: 'Algorithms', icon: <Play className="w-6 h-6 rotate-90" />, description: 'Sorting, searching, dynamic programming', color: 'bg-purple-50 text-purple-600' },
                  { name: 'System Design', icon: <BookOpen className="w-6 h-6" />, description: 'Scalability, architecture, distributed systems', color: 'bg-blue-50 text-blue-600' },
                  { name: 'DBMS', icon: <Database className="w-6 h-6" />, description: 'SQL queries, normalization, indexing', color: 'bg-cyan-50 text-cyan-600' },
                  { name: 'React', icon: <Globe className="w-6 h-6" />, description: 'Hooks, state management, performance', color: 'bg-sky-50 text-sky-600' },
                ].map((topic) => (
                  <div 
                    key={topic.name} 
                    className="bg-white border border-slate-200 p-6 rounded-xl cursor-pointer hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition duration-200 flex flex-col items-center text-center" 
                    onClick={() => handleTopicClick(topic.name)}
                  >
                    <div className={`w-12 h-12 ${topic.color} rounded-lg flex items-center justify-center mb-3`}>{topic.icon}</div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{topic.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{topic.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <AnalyticsDashboard />
          </div>
        ) : (
          <div>
            <LearningRoadmap />
          </div>
        )}

        {/* Popup Modal */}
        {selectedTopic && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={handleClosePopup}>
            <div className="bg-white rounded-2xl w-11/12 max-w-3xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-bold text-slate-800 text-sm">Top 10 Interview Questions for {selectedTopic}</h3>
                <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-200 text-slate-500 transition cursor-pointer" onClick={handleClosePopup}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {loading && (
                <div className="py-12 text-center text-blue-500 flex flex-col items-center justify-center gap-2">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500">Loading questions...</p>
                </div>
              )}
              
              {error && (
                <div className="mx-6 my-4 p-4 bg-red-50 border border-red-200 text-red-755 text-xs rounded-lg">
                  <p>❌ {error}</p>
                </div>
              )}
              
              {!loading && !error && questions.length > 0 && (
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-lg text-xs font-semibold text-center mb-4">
                    Successfully loaded {questions.length} questions
                  </div>
                  <div className="flex flex-col gap-4">
                    {questions.map((q, index) => (
                      <div key={index} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 hover:bg-slate-50 transition border-l-4 border-l-blue-500">
                        <div className="text-xs font-bold text-slate-700 mb-1">
                          Question {index + 1}:
                        </div>
                        <div className="text-sm text-slate-800 mb-3 leading-relaxed">{q.question}</div>
                        <div className="text-xs text-slate-500">
                          <strong className="text-slate-600 block mb-1 font-semibold flex items-center gap-1"><Info className="w-3.5 h-3.5 text-blue-500" /> Ideal Answer:</strong>
                          <div className="bg-white p-3 rounded-lg border border-slate-200 mt-2 text-slate-600 leading-relaxed font-sans">{q.ideal_answer}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {!loading && !error && questions.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">
                  <p>No questions available at the moment.</p>
                </div>
              )}
              
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 text-right">
                <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition duration-150" onClick={handleClosePopup}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
