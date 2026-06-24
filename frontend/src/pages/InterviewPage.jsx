import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopicSelector from '../components/TopicSelector';
import ChatInterview from '../components/ChatInterview';
import { interviewAPI } from '../api';
import { ArrowLeft, AlertTriangle, X, CheckSquare, Settings } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50">
      {currentStep === 'selection' ? (
        <div className="py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center max-w-5xl mx-auto px-6 gap-4 mb-6">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition duration-150 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-slate-800">AI Coaching Workspace</h1>
            <div className="w-[120px] hidden sm:block"></div>
          </div>
          
          {error && (
            <div className="max-w-5xl mx-auto px-6 mb-6">
              <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
                <span>{error}</span>
                <button onClick={() => setError('')} className="bg-none border-none text-red-700 hover:text-red-900 text-xl cursor-pointer ml-auto"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}
          
          <TopicSelector onStartInterview={handleStartInterview} />
          
          <div className="max-w-4xl mx-auto px-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-4 border-l-4 border-blue-500 pl-3 flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-blue-500" /> How it works</h3>
                <ul className="flex flex-col gap-3 text-slate-600 text-xs leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Choose your focus topic, target difficulty level, and mock round type.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Optionally upload your resume to generate tailored, experience-aware questions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Conduct a live 5-question back-and-forth mock round with the AI coach.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Review in-depth scorecards analyzing strengths, gaps, and improvements.</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-4 border-l-4 border-blue-500 pl-3 flex items-center gap-1.5"><Settings className="w-4 h-4 text-blue-500" /> Tips for success</h3>
                <ul className="flex flex-col gap-3 text-slate-600 text-xs leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Think aloud and provide deep, structured explanations for your answers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>If it's a technical coding round, write compilable code inside the workspace.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Review the AI evaluation carefully to identify missing technical concepts.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-screen bg-slate-50">
          <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-200">
            <button 
              onClick={handleBackToSelection} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition duration-150 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Selection
            </button>
            <div className="text-right">
              <h2 className="text-base font-bold text-slate-800 leading-tight">Live Interview Session</h2>
              <span className="text-xs text-slate-500 font-normal">
                {interviewData?.topic} - {interviewData?.difficulty}
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <ChatInterview 
              interviewData={interviewData}
              onEndInterview={handleEndInterview}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
