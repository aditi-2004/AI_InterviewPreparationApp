// src/api/index.js
import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://ai-interviewpreparationapp-1.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (userData) => apiClient.post('/auth/signup', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
};

export const resumeAPI = {
  uploadResume: (formData) => apiClient.post('/resumes/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getUserResumes: () => apiClient.get('/resumes'),
};

export const analyticsAPI = {
  getUserAnalytics: () => apiClient.get('/analytics/user'),
  getProgressTrends: () => apiClient.get('/analytics/trends'),
};

export const coachingAPI = {
  getRoadmap: () => apiClient.get('/coaching/roadmap'),
  getKnowledgeDocs: () => apiClient.get('/coaching/materials'),
  addKnowledgeDoc: (docData) => apiClient.post('/coaching/materials', docData),
};

export const interviewAPI = {
  startInterview: (data) => apiClient.post('/interview/start', data),
  submitAnswer: (data) => apiClient.post('/interview/answer', data),
  getNextQuestion: (interviewId) => apiClient.get(`/interview/next/${interviewId}`),
  endInterview: (interviewId) => apiClient.put(`/interview/end/${interviewId}`),
  getHistory: () => apiClient.get('/interview/history'),
  getInterviewDetails: (interviewId) => apiClient.get(`/interview/details/${interviewId}`),
};

export default apiClient;
