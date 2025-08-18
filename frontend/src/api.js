import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};


export const interviewAPI = {
  startInterview: (data) => api.post('/interview/start', data),
  submitAnswer: (data) => api.post('/interview/answer', data),
  getNextQuestion: (interviewId) => api.get(`/interview/next/${interviewId}`),
  endInterview: (interviewId) => api.put(`/interview/end/${interviewId}`),
  getHistory: () => api.get('/interview/history'),
};


export const analyticsAPI = {
  getUserAnalytics: () => api.get('/analytics/user'),
  getProgressTrends: () => api.get('/analytics/trends'),
};

export default api;