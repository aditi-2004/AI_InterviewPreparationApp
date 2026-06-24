import React, { useState, useEffect } from 'react';
import { coachingAPI } from '../api';
import { Calendar, Compass, Info } from 'lucide-react';

const LearningRoadmap = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedTasks, setCheckedTasks] = useState(() => {
    const saved = localStorage.getItem('completed_roadmap_tasks');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const response = await coachingAPI.getRoadmap();
        setRoadmap(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch personalized learning roadmap.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  const handleToggleTask = (taskName) => {
    const updated = {
      ...checkedTasks,
      [taskName]: !checkedTasks[taskName]
    };
    setCheckedTasks(updated);
    localStorage.setItem('completed_roadmap_tasks', JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-500 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm">Roadmap Agent is analyzing your metrics and compiling a preparation plan...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl text-sm">⚠️ {error}</div>;
  }

  if (!roadmap || !roadmap.milestones || roadmap.milestones.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 border border-slate-200 rounded-xl max-w-lg mx-auto p-6">
        <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 mb-1">Build Your Profile</h3>
        <p className="text-slate-500 text-sm">{roadmap?.readinessSummary || "Complete mock interviews to build your performance profile and get custom learning roadmaps."}</p>
      </div>
    );
  }

  const totalTasks = roadmap.milestones.reduce((acc, ms) => acc + (ms.tasks?.length || 0), 0);
  const completedTasksCount = Object.values(checkedTasks).filter(Boolean).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Your Custom Preparation Roadmap</h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">{roadmap.readinessSummary}</p>
        </div>
        <div className="text-center bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-lg shrink-0">
          <span className="block text-xl font-extrabold text-blue-600">{progressPercent}%</span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Completed</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6">
        <div className="bg-blue-600 h-full rounded-full transition-all duration-350 ease-out" style={{ width: `${progressPercent}%` }}></div>
      </div>

      {roadmap.weakTopics?.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <strong className="text-red-800 text-xs font-semibold block mb-2">🎯 Key Growth Opportunities:</strong>
          <div className="flex flex-wrap gap-1.5">
            {roadmap.weakTopics.map((topic, i) => (
              <span key={i} className="bg-red-100/80 text-red-800 text-xs px-2.5 py-0.5 rounded font-medium">{topic}</span>
            ))}
          </div>
        </div>
      )}

      {/* Milestones / Phases */}
      <div className="flex flex-col gap-6">
        {roadmap.milestones.map((milestone, idx) => (
          <div key={idx} className="flex gap-4">
            <div className="flex flex-col items-center relative">
              <span className="w-3.5 h-3.5 bg-blue-600 rounded-full ring-4 ring-blue-100 z-10"></span>
              {idx < roadmap.milestones.length - 1 && <span className="w-0.5 bg-slate-200 flex-1 absolute top-3.5 bottom-[-24px]"></span>}
            </div>
            
            <div className="flex-1 bg-slate-50 border border-slate-200 p-5 rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <h3 className="text-sm font-semibold text-slate-800">{milestone.phase}</h3>
                <div className="flex gap-2">
                  <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded font-semibold">{milestone.targetTopic}</span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> {milestone.estimatedDays} Days</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                {milestone.tasks?.map((task, tIdx) => {
                  const isChecked = !!checkedTasks[task];
                  return (
                    <label key={tIdx} className={`flex items-start gap-3 cursor-pointer text-sm text-slate-600 hover:text-slate-800 transition ${isChecked ? 'line-through text-slate-400' : ''}`}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => handleToggleTask(task)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5 cursor-pointer"
                      />
                      <span>{task}</span>
                    </label>
                  );
                })}
              </div>

              {milestone.resources?.length > 0 && (
                <div className="bg-white border border-slate-200 p-3 rounded-lg text-xs">
                  <strong className="text-slate-600 block mb-1.5 font-semibold flex items-center gap-1"><Info className="w-3.5 h-3.5" /> Suggested Resources:</strong>
                  <ul className="list-disc pl-4 text-slate-500 space-y-0.5">
                    {milestone.resources.map((res, rIdx) => (
                      <li key={rIdx}>{res}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningRoadmap;
