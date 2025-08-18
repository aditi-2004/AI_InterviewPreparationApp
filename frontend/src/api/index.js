// src/api/index.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/auth';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

<<<<<<< HEAD
// Add JWT token to requests
=======
>>>>>>> ac7e69feee0e622f5085b84f61378c3a06d0b01f
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const analyticsAPI = {
  getUserAnalytics: () => apiClient.get('/analytics'),
  getProgressTrends: () => apiClient.get('/analytics/trends'),
};

const interviewAPI = {
  startInterview: (data) => apiClient.post('/interview/start', data),
  submitAnswer: (data) => apiClient.post('/interview/answer', data),
  getNextQuestion: (interviewId) => apiClient.get(`/interview/next/${interviewId}`),
  endInterview: (interviewId) => apiClient.put(`/interview/end/${interviewId}`),
  getHistory: () => apiClient.get('/interview/history'),
  getInterviewDetails: (interviewId) => apiClient.get(`/interview/details/${interviewId}`),
};

export { analyticsAPI, interviewAPI };