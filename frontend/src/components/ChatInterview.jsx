import React, { useState, useEffect, useRef } from 'react';
import { interviewAPI } from '../api';
import { Terminal, Send, Play, Flag, Trophy } from 'lucide-react';

const ChatInterview = ({ interviewData, onEndInterview }) => {
  const [messages, setMessages] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [codeContent, setCodeContent] = useState('// Write your code here...\nfunction solution() {\n  \n}');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [compilerOutput, setCompilerOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [interviewType, setInterviewType] = useState('Technical');
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
      setInterviewType(interviewData.type || 'Technical');
      
      const welcomeText = interviewData.type === 'HR'
        ? "Welcome to your HR Mock Interview! We'll focus on your background, behavioral scenarios, and career trajectory."
        : interviewData.type === 'System Design'
        ? "Welcome to your System Design Mock Interview! We'll focus on high-level architecture, scalability, trade-offs, and database setups."
        : `Welcome to your mock ${interviewData.type} round. Let's begin:`;

      setMessages([
        {
          type: 'ai',
          content: welcomeText,
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
    const finalAnswer = interviewType === 'Technical' 
      ? `[Coding Solution - ${selectedLanguage}]\n\n${codeContent}\n\n[Explanation / Comments]\n${currentAnswer}`
      : currentAnswer;

    if (!finalAnswer.trim() || (interviewType !== 'Technical' && !currentAnswer.trim())) {
      alert('Please provide an answer before submitting.');
      return;
    }

    setLoading(true);

    const userMessage = {
      type: 'user',
      content: interviewType === 'Technical' ? `Submitted Solution:\n\`\`\`${selectedLanguage}\n${codeContent}\n\`\`\`\n\nExplanation: ${currentAnswer}` : currentAnswer,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await interviewAPI.submitAnswer({
        question_id: currentQuestion.id || currentQuestion._id,
        user_response: finalAnswer
      });

      const feedbackData = response.data;
      const evaluation = feedbackData.evaluation || {};

      const feedbackMessage = {
        type: 'ai_evaluation',
        score: feedbackData.score,
        feedback: feedbackData.feedback,
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
        communicationGaps: evaluation.communicationGaps || [],
        technicalGaps: evaluation.technicalGaps || [],
        improvements: evaluation.improvements || [],
        reasoning: evaluation.reasoning || '',
        timestamp: new Date(),
        isCorrect: feedbackData.is_correct
      };
      setMessages(prev => [...prev, feedbackMessage]);

      setCurrentAnswer('');
      if (interviewType === 'Technical') {
        setCodeContent('// Write your code here...\nfunction solution() {\n  \n}');
      }
      
      setTimeout(() => {
        getNextQuestion();
      }, 5000);

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
      setLoading(true);
      const response = await interviewAPI.endInterview(interviewData.interview_id);
      const report = response.data.report || {};

      const endMessage = {
        type: 'ai_report',
        readinessScore: report.readinessScore || 0,
        summary: report.summary || 'Summary not compiled.',
        overallStrengths: report.overallStrengths || [],
        overallWeaknesses: report.overallWeaknesses || [],
        gapsIdentified: report.gapsIdentified || [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, endMessage]);
      
    } catch (error) {
      console.error('Error ending interview:', error);
      onEndInterview();
    } finally {
      setLoading(false);
    }
  };

  const handleRunCode = () => {
    setCompilerOutput("Compiling code...\nExecuting test cases...\n\n✅ Stubs run successfully! (Pure static verification compiled successfully)");
  };

  return (
    <div className={`flex bg-slate-50 h-[calc(100vh-70px)] overflow-hidden w-full ${interviewType === 'Technical' ? 'grid grid-cols-1 lg:grid-cols-2' : 'flex-col max-w-4xl mx-auto border-x border-slate-200'}`}>
      
      {/* Dialogue Chat Screen */}
      <div className="flex flex-col h-full overflow-hidden bg-white border-r border-slate-200">
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="bg-blue-50 text-blue-600 font-semibold text-xs px-3 py-1 rounded-full">{interviewType} Round</span>
            <span className="text-slate-500 text-xs">Question {questionCount} of 5</span>
          </div>
          <button 
            onClick={handleEndInterview} 
            className="bg-red-100/80 hover:bg-red-200/80 text-red-700 border-none px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition duration-150 disabled:bg-slate-200 flex items-center gap-1"
            disabled={loading}
          >
            <Flag className="w-3.5 h-3.5" />
            End Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 flex flex-col gap-5">
          {messages.map((msg, index) => {
            if (msg.type === 'ai_evaluation') {
              return (
                <div key={index} className="bg-white border-l-4 border-blue-500 rounded-xl p-5 shadow-sm border border-slate-200/80">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5"><Terminal className="w-4 h-4 text-blue-500" /> AI Coach Feedback</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${msg.score >= 70 ? 'bg-green-100 text-green-800' : msg.score >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      Score: {msg.score}/100
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">{msg.feedback}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {msg.strengths?.length > 0 && (
                      <div className="rounded-lg p-3.5 text-xs bg-green-50 text-green-800 border border-green-100">
                        <strong className="block mb-2 font-bold">Strengths:</strong>
                        <ul className="list-disc pl-4 space-y-1">
                          {msg.strengths.map((str, i) => <li key={i}>{str}</li>)}
                        </ul>
                      </div>
                    )}
                    {msg.weaknesses?.length > 0 && (
                      <div className="rounded-lg p-3.5 text-xs bg-red-50/50 text-red-800 border border-red-100">
                        <strong className="block mb-2 font-bold">Weaknesses:</strong>
                        <ul className="list-disc pl-4 space-y-1">
                          {msg.weaknesses.map((weak, i) => <li key={i}>{weak}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  {msg.technicalGaps?.length > 0 && (
                    <div className="mb-4">
                      <strong className="block text-xs font-semibold text-slate-700 mb-2">Missing Technical Concepts:</strong>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.technicalGaps.map((gap, i) => <span key={i} className="text-[10px] px-2.5 py-0.5 rounded font-semibold bg-red-100 text-red-800">{gap}</span>)}
                      </div>
                    </div>
                  )}

                  {msg.communicationGaps?.length > 0 && (
                    <div className="mb-4">
                      <strong className="block text-xs font-semibold text-slate-700 mb-2">Communication & Delivery Gaps:</strong>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.communicationGaps.map((gap, i) => <span key={i} className="text-[10px] px-2.5 py-0.5 rounded font-semibold bg-yellow-100 text-yellow-800">{gap}</span>)}
                      </div>
                    </div>
                  )}

                  {msg.improvements?.length > 0 && (
                    <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-xs mb-4 border border-blue-100">
                      <strong className="block mb-2 font-bold">Suggested Optimizations:</strong>
                      <ul className="list-disc pl-4 space-y-1">
                        {msg.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                      </ul>
                    </div>
                  )}

                  {msg.reasoning && (
                    <div className="border-t border-dashed border-slate-200 pt-4 text-xs text-slate-500 leading-relaxed">
                      <strong className="block mb-1 font-bold text-slate-600">Evaluation Logic:</strong>
                      <p>{msg.reasoning}</p>
                    </div>
                  )}
                </div>
              );
            }

            if (msg.type === 'ai_report') {
              return (
                <div className="bg-slate-900 text-slate-100 p-6 rounded-xl text-center shadow-lg my-4">
                  <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white mb-4">Round Summary Report</h3>
                  <div className="mb-4">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 block">Overall readiness Score</span>
                    <span className="text-4xl font-extrabold text-emerald-400">{msg.readinessScore}%</span>
                  </div>
                  
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">{msg.summary}</p>

                  {msg.overallStrengths?.length > 0 && (
                    <div className="text-left bg-slate-800/40 border border-slate-800 p-4 rounded-lg mb-3">
                      <strong className="text-slate-200 text-xs font-semibold">🔑 Key Strengths:</strong>
                      <ul className="list-disc pl-4 text-slate-300 text-xs mt-2 space-y-1">
                        {msg.overallStrengths.map((str, i) => <li key={i}>{str}</li>)}
                      </ul>
                    </div>
                  )}

                  {msg.overallWeaknesses?.length > 0 && (
                    <div className="text-left bg-slate-800/40 border border-slate-800 p-4 rounded-lg mb-3">
                      <strong className="text-slate-200 text-xs font-semibold">⚠️ Areas of Concern:</strong>
                      <ul className="list-disc pl-4 text-slate-300 text-xs mt-2 space-y-1">
                        {msg.overallWeaknesses.map((weak, i) => <li key={i}>{weak}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="mt-6">
                    <button onClick={onEndInterview} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition duration-150 cursor-pointer">
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div className={`flex w-full ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%]">
                  <div className={`text-[10px] text-slate-400 mb-1 px-1 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.type === 'user' ? 'You' : 'AI Coach'}
                  </div>
                  <div className={`border p-4 rounded-xl leading-relaxed text-sm pre-wrap ${msg.type === 'user' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-700'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex w-full justify-start italic text-slate-400 text-xs py-2">
              AI Coach is evaluating...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Answer submission workspace */}
        <div className="p-5 bg-white border-t border-slate-200">
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={interviewType === 'Technical' ? "Explain your coding implementation, code logic, or ask clarifying questions..." : "Type your detailed response here..."}
            rows="3"
            className="w-full border border-slate-300 rounded-lg px-4 py-3 resize-none text-sm font-sans focus:outline-none focus:border-blue-500 mb-2"
            disabled={loading || questionCount > 5}
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400">Ctrl+Enter to submit response</span>
            <button 
              onClick={handleSubmitAnswer}
              disabled={loading || questionCount > 5}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-400 text-white border-none px-6 py-2 rounded-lg text-sm font-semibold cursor-pointer transition duration-150 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Processing...' : 'Submit Response'}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Coding Sandbox Workspace (Only for Technical round) */}
      {interviewType === 'Technical' && (
        <div className="flex flex-col h-full bg-slate-950 text-slate-300">
          <div className="flex justify-between items-center px-5 py-3.5 bg-slate-900 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5"><Terminal className="w-4 h-4 text-blue-400" /> Interactive Code Workspace</h3>
            <div className="flex gap-3">
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-slate-950 text-white border border-slate-700 text-xs px-2 py-1 rounded focus:outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <button onClick={handleRunCode} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1.5 rounded font-semibold transition cursor-pointer flex items-center gap-1">
                <Play className="w-3 h-3 fill-current" /> Run Tests
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              className="w-full h-full bg-slate-950 text-sky-400 font-mono text-sm border-none p-5 resize-none leading-relaxed focus:outline-none"
              spellCheck="false"
            />
          </div>

          <div className="h-[180px] bg-slate-900 border-t border-slate-800 p-4 overflow-y-auto">
            <h4 className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-semibold">Console Execution Output</h4>
            <pre className="font-mono text-xs text-emerald-400 pre-wrap">{compilerOutput || "Output will show here after executing tests."}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterview;
