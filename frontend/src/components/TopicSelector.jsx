import React, { useState } from 'react';
import ResumeUploader from './ResumeUploader';
import { CheckCircle2, ChevronRight, GraduationCap } from 'lucide-react';

const TopicSelector = ({ onStartInterview }) => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedType, setSelectedType] = useState('Technical');
  const [selectedResume, setSelectedResume] = useState(null);
  const [loading, setLoading] = useState(false);

  const topics = [
    'Data Structures',
    'Algorithms',
    'OOP',
    'DBMS',
    'Operating Systems',
    'Computer Networks',
    'Web Development',
    'System Design'
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];
  
  const roundTypes = [
    { name: 'Technical', icon: '💻', desc: 'Focuses on coding, algorithms, concepts, and technical skills' },
    { name: 'System Design', icon: '🏗️', desc: 'Large scale architectures, databases, and scalability' },
    { name: 'HR', icon: '🤝', desc: 'Behavioral, career goals, cultural fit, and soft skills' },
    { name: 'Hiring Manager', icon: '👔', desc: 'Project deep-dives, situations, problem solving, and vision' }
  ];

  const handleStartInterview = async () => {
    if (!selectedTopic || !selectedDifficulty) {
      alert('Please select both topic and difficulty');
      return;
    }

    setLoading(true);
    try {
      await onStartInterview({
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        type: selectedType,
        resumeId: selectedResume ? selectedResume.id || selectedResume._id : null
      });
    } catch (error) {
      console.error('Failed to start interview:', error);
      alert('Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-1">Configure Your Mock Interview Coach</h2>
      <p className="text-center text-slate-500 mb-8 text-sm">Customize your session difficulty, focus topics, and round format.</p>

      {/* 1. Resume Section */}
      <div className="mb-8">
        <ResumeUploader onResumeSelected={(resume) => setSelectedResume(resume)} />
        {selectedResume && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mt-3 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Selected Resume: <strong>{selectedResume.fileName || selectedResume.originalFileName}</strong></span>
          </div>
        )}
      </div>

      {/* 2. Round Type */}
      <div className="mb-8">
        <h3 className="text-base font-semibold text-slate-800 mb-4 border-l-4 border-blue-500 pl-3">Select Round Type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roundTypes.map((type) => (
            <div
              key={type.name}
              className={`border bg-white p-5 rounded-xl cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${selectedType === type.name ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/10' : 'border-slate-200'}`}
              onClick={() => setSelectedType(type.name)}
            >
              <span className="text-2xl mb-2 block">{type.icon}</span>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{type.name}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{type.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Topics and Difficulties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4 border-l-4 border-blue-500 pl-3">Select Topic</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {topics.map((topic) => (
              <button
                key={topic}
                className={`px-3 py-2 border rounded-lg text-xs font-semibold text-slate-700 transition duration-150 ${selectedTopic === topic ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                onClick={() => setSelectedTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-4 border-l-4 border-blue-500 pl-3">Select Difficulty</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty}
                className={`px-3 py-3 border rounded-lg text-xs font-semibold text-slate-700 transition duration-150 ${selectedDifficulty === difficulty ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                onClick={() => setSelectedDifficulty(difficulty)}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center mt-6">
        <button 
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-400 text-white rounded-lg text-base font-semibold transition duration-200 shadow-md shadow-blue-500/10 cursor-pointer"
          onClick={handleStartInterview}
          disabled={!selectedTopic || !selectedDifficulty || loading}
        >
          <GraduationCap className="w-5 h-5" />
          {loading ? 'Simulating Interview Context...' : 'Begin Live Mock Interview'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TopicSelector;
