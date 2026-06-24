import React, { useState, useEffect } from 'react';
import { resumeAPI } from '../api';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const ResumeUploader = ({ onResumeSelected }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(null);

  const fetchResumes = async () => {
    try {
      const response = await resumeAPI.getUserResumes();
      setResumes(response.data);
    } catch (err) {
      console.error('Error fetching resumes:', err);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Only PDF documents are supported.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Only PDF documents are supported.");
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await resumeAPI.uploadResume(formData);
      setSuccess("Resume parsed and analyzed successfully!");
      setFile(null);
      fetchResumes();
      if (onResumeSelected) {
        onResumeSelected(response.data.resume);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to parse and upload resume.");
    } finally {
      setLoading(false);
    }
  };

  const selectResume = (resume) => {
    setSelectedResumeId(resume._id);
    if (onResumeSelected) {
      onResumeSelected(resume);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm mb-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-1">Resume-Aware Interview Preparation</h3>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">
        Upload your resume (PDF format) and our AI Resume Agent will analyze your experience, skills, and projects to generate custom, personalized interview questions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="flex flex-col">
          <form 
            onSubmit={handleUpload} 
            onDragEnter={handleDrag} 
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center bg-slate-50 hover:bg-slate-100/70 transition duration-200 cursor-pointer flex flex-col items-center justify-center relative min-h-[180px] ${dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300'}`}
          >
            <input 
              type="file" 
              id="file-upload-input" 
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf"
              onChange={handleFileChange}
            />
            
            <div className="flex flex-col items-center">
              {file ? (
                <div className="flex flex-col items-center">
                  <FileText className="w-10 h-10 text-blue-500 mb-2" />
                  <p className="font-semibold text-sm text-slate-700 max-w-[200px] truncate mb-0.5">{file.name}</p>
                  <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                  <label htmlFor="file-upload-input" className="text-sm text-slate-500 cursor-pointer">
                    <span className="text-blue-600 font-semibold hover:underline">Click to upload</span> or drag & drop PDF here
                  </label>
                </div>
              )}
            </div>

            {file && (
              <button 
                type="submit" 
                disabled={loading} 
                className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md text-sm font-semibold transition duration-200 z-10 flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Analyzing Resume..." : "Process with AI Agent"}
              </button>
            )}
          </form>

          {error && (
            <div className="text-red-700 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg mt-3 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="text-green-700 bg-green-50 border border-green-200 px-4 py-2.5 rounded-lg mt-3 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Existing Resumes List */}
        <div className="flex flex-col">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Your Resumes</h4>
          {resumes.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-400">No resumes uploaded yet. Upload one to start resume-tailored interviews.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
              {resumes.map((resumeItem) => (
                <div 
                  key={resumeItem._id}
                  onClick={() => selectResume(resumeItem)}
                  className={`border rounded-lg p-3 cursor-pointer transition hover:bg-slate-50/70 bg-white ${selectedResumeId === resumeItem._id ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/10' : 'border-slate-200'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="font-semibold text-slate-700 text-xs truncate max-w-[240px]">{resumeItem.originalFileName}</span>
                  </div>
                  {resumeItem.skills && resumeItem.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {resumeItem.skills.slice(0, 4).map((skill, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-medium">{skill}</span>
                      ))}
                      {resumeItem.skills.length > 4 && (
                        <span className="text-slate-400 text-[10px] py-0.5 font-medium">+{resumeItem.skills.length - 4} more</span>
                      )}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400">
                    Uploaded on: {new Date(resumeItem.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUploader;
