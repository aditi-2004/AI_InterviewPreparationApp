import React, { useState, useEffect } from 'react';
import { analyticsAPI, interviewAPI } from '../api'; 
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

console.log('=== API IMPORT DEBUG ===');
console.log('analyticsAPI:', analyticsAPI);
console.log('interviewAPI:', interviewAPI);
console.log('interviewAPI keys:', Object.keys(interviewAPI || {}));
console.log('getInterviewDetails type:', typeof interviewAPI?.getInterviewDetails);
console.log('========================');

const createApiClient = () => {
  const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
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

  return apiClient;
};

const getInterviewDetailsFunction = (interviewId) => {
  const apiClient = createApiClient();
  console.log('Using fallback getInterviewDetails function for:', interviewId);
  return apiClient.get(`/interview/details/${interviewId}`);
};

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff4d4f'];

  useEffect(() => {
    console.log('Analytics API:', analyticsAPI);
    console.log('Interview API:', interviewAPI);
    console.log('Available interview API methods:', Object.keys(interviewAPI || {}));
    
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, trendsRes, historyRes] = await Promise.all([
        analyticsAPI.getUserAnalytics(),
        analyticsAPI.getProgressTrends(),
        interviewAPI.getHistory(),
      ]);

      setAnalytics(analyticsRes.data);
      setTrends(trendsRes.data);
      setHistory(historyRes.data);
      setDetails({});
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadInterviewDetails = async (interviewId) => {
    if (details[interviewId]) {
      setDetails((prev) => ({ ...prev, [interviewId]: null }));
      return;
    }
    
    setLoadingDetails((prev) => ({ ...prev, [interviewId]: true }));
    
    try {
      console.log('===DETAILED DEBUG===');
      console.log('Fetching details for interviewId:', interviewId);
      console.log('interviewAPI object:', interviewAPI);
      console.log('Available methods:', Object.keys(interviewAPI || {}));
      console.log('getInterviewDetails exists:', 'getInterviewDetails' in interviewAPI);
      console.log('getInterviewDetails type:', typeof interviewAPI?.getInterviewDetails);
      
      let response;
      
      if (typeof interviewAPI?.getInterviewDetails === 'function') {
        console.log('Using imported getInterviewDetails function');
        response = await interviewAPI.getInterviewDetails(interviewId);
      } else {
        console.log('Using fallback getInterviewDetails function');
        response = await getInterviewDetailsFunction(interviewId);
      }
      
      console.log('Interview details response:', response.data);
      setDetails((prev) => ({ ...prev, [interviewId]: response.data }));
      
      setError(null);
    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Full error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'Failed to load interview details. ';
      
      if (error.response) {
        console.error('Server error response:', error.response);
        errorMessage += `Server error: ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        console.error('Network error - no response:', error.request);
        errorMessage += 'Network error. Please check your connection.';
      } else {
        errorMessage += error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [interviewId]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: '#666'
      }}>
        <h3>Error</h3>
        <p>{error}</p>
        <button 
          onClick={loadData}
          style={{
            padding: '0.5rem 1rem',
            background: '#ff4d4f',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics || analytics.totalInterviews === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        color: '#666'
      }}>
        <h3>No analytics data available</h3>
        <p>Complete some interviews to see your progress!</p>
      </div>
    );
  }

  const difficultyData = [
    {
      name: 'Easy',
      accuracy: analytics.difficultyWisePerformance.easy.accuracy,
      total: analytics.difficultyWisePerformance.easy.total,
      correct: analytics.difficultyWisePerformance.easy.correct,
    },
    {
      name: 'Medium',
      accuracy: analytics.difficultyWisePerformance.medium.accuracy,
      total: analytics.difficultyWisePerformance.medium.total,
      correct: analytics.difficultyWisePerformance.medium.correct,
    },
    {
      name: 'Hard',
      accuracy: analytics.difficultyWisePerformance.hard.accuracy,
      total: analytics.difficultyWisePerformance.hard.total,
      correct: analytics.difficultyWisePerformance.hard.correct,
    },
  ];

  const topicData = analytics.topicWisePerformance
    .filter((topic) => topic.accuracy > 0 && topic.totalQuestions > 0)
    .map((topic, index) => ({
      topic: topic.topic,
      accuracy: topic.accuracy,
      totalQuestions: topic.totalQuestions,
      fill: colors[index % colors.length],
    }));

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Dashboard Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ color: '#333', margin: 0 }}>Performance Analytics</h2>
        <button 
          onClick={loadData}
          style={{
            padding: '0.5rem 1rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: '#666',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>Total Interviews</h3>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#333'
          }}>{analytics.totalInterviews}</div>
        </div>
        
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: '#666',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>Overall Accuracy</h3>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#333'
          }}>{analytics.overallAccuracy.toFixed(1)}%</div>
        </div>
        
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: '#666',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>Best Topic</h3>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#333'
          }}>
            {analytics.topicWisePerformance.length > 0
              ? analytics.topicWisePerformance.reduce((best, current) =>
                  current.accuracy > best.accuracy ? current : best
                ).topic
              : 'N/A'}
          </div>
        </div>
        
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            color: '#666',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>Recent Activity</h3>
          <div style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#333'
          }}>
            {history.length > 0 ? `${history.length} sessions` : 'No recent activity'}
          </div>
        </div>
      </div>
      {/* Charts Container */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Performance by Difficulty</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={difficultyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'accuracy') return [`${value.toFixed(1)}%`, 'Accuracy'];
                  if (name === 'correct') return [value, 'Correct Answers'];
                  if (name === 'total') return [value, 'Total Questions'];
                  return value;
                }}
              />
              <Bar dataKey="accuracy" fill="#8884d8" name="Accuracy" />
              <Bar dataKey="correct" fill="#82ca9d" name="Correct Answers" />
              <Bar dataKey="total" fill="#ffc658" name="Total Questions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Topic-wise Performance</h3>
          {topicData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topicData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ topic, accuracy }) =>
                    `${topic}: ${accuracy ? accuracy.toFixed(1) : 0}%`
                  }
                  outerRadius={80}
                  dataKey="accuracy"
                >
                  {topicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) =>
                    `${value.toFixed(1)}% (${
                      props.payload.totalQuestions || 0
                    } questions)`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '1rem',
              color: '#666'
            }}>
              <p>No topic performance data available. Complete interviews to see results.</p>
            </div>
          )}
        </div>

        {trends.length > 0 && (
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            gridColumn: '1 / -1'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Progress Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value, name, props) =>
                    `${value.toFixed(1)}% (${props.payload.topic || 'Unknown'})`
                  }
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Accuracy"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* History Section */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Recent Interview Sessions</h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {history.length > 0 ? (
            history.map((interview) => (
              <div key={interview._id}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#f8f9fa',
                  borderRadius: '6px',
                  borderLeft: '4px solid #007bff'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      color: '#333'
                    }}>{interview.topic}</div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#666'
                    }}>{interview.difficulty}</div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <div style={{
                      fontWeight: '500',
                      color: '#28a745'
                    }}>
                      {interview.totalQuestions > 0
                        ? `${interview.correctAnswers}/${interview.totalQuestions} correct`
                        : 'In progress'}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#666'
                    }}>
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                      background: interview.status === 'completed' ? '#d4edda' : '#fff3cd',
                      color: interview.status === 'completed' ? '#155724' : '#856404'
                    }}>
                      {interview.status}
                    </span>
                    <button
                      onClick={() => loadInterviewDetails(interview._id)}
                      disabled={loadingDetails[interview._id]}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: loadingDetails[interview._id] ? '#6c757d' : '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loadingDetails[interview._id] ? 'not-allowed' : 'pointer',
                        opacity: loadingDetails[interview._id] ? 0.7 : 1
                      }}
                    >
                      {loadingDetails[interview._id] 
                        ? 'Loading...' 
                        : details[interview._id] 
                          ? 'Hide Details' 
                          : 'View Details'}
                    </button>
                  </div>
                </div>
                
                {/* Interview Details */}
                {details[interview._id] && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1.5rem',
                    background: '#e9ecef',
                    borderRadius: '6px',
                    border: '1px solid #dee2e6'
                  }}>
                    <h4 style={{
                      margin: '0 0 1rem 0',
                      color: '#333',
                      fontSize: '1.1rem'
                    }}>Interview Details</h4>
                    
                    {details[interview._id].details && details[interview._id].details.length > 0 ? (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        {details[interview._id].details.map((item, index) => (
                          <div key={item.question_id || index} style={{
                            padding: '1rem',
                            background: 'white',
                            borderRadius: '6px',
                            border: '1px solid #dee2e6'
                          }}>
                            <div style={{
                              marginBottom: '0.5rem',
                              fontSize: '0.95rem',
                              lineHeight: '1.4'
                            }}>
                              <strong style={{ color: '#495057' }}>Question:</strong> 
                              <span style={{ marginLeft: '0.5rem', color: '#333' }}>
                                {item.question_text}
                              </span>
                            </div>
                            
                            <div style={{
                              marginBottom: '0.5rem',
                              fontSize: '0.95rem',
                              lineHeight: '1.4'
                            }}>
                              <strong style={{ color: '#495057' }}>Your Answer:</strong>
                              <span style={{ marginLeft: '0.5rem', color: '#333' }}>
                                {item.user_response || 'Not answered'}
                              </span>
                            </div>
                            
                            <div style={{
                              marginBottom: '0.5rem',
                              fontSize: '0.95rem',
                              lineHeight: '1.4'
                            }}>
                              <strong style={{ color: '#495057' }}>Feedback:</strong>
                              <span style={{ marginLeft: '0.5rem', color: '#333' }}>
                                {item.feedback || 'No feedback available'}
                              </span>
                            </div>
                            
                            <div style={{
                              display: 'flex',
                              gap: '2rem',
                              fontSize: '0.9rem'
                            }}>
                              <div>
                                <strong style={{ color: '#495057' }}>Score:</strong>
                                <span style={{ 
                                  marginLeft: '0.5rem', 
                                  color: item.score >= 70 ? '#28a745' : item.score >= 50 ? '#ffc107' : '#dc3545',
                                  fontWeight: '500'
                                }}>
                                  {item.score !== null ? `${item.score}%` : 'N/A'}
                                </span>
                              </div>
                              
                              <div>
                                <strong style={{ color: '#495057' }}>Correct:</strong>
                                <span style={{ 
                                  marginLeft: '0.5rem',
                                  color: item.is_correct === true ? '#28a745' : item.is_correct === false ? '#dc3545' : '#6c757d',
                                  fontWeight: '500'
                                }}>
                                  {item.is_correct !== null
                                    ? item.is_correct ? 'Yes' : 'No'
                                    : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#666', fontStyle: 'italic' }}>
                        No questions answered in this interview.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#666'
            }}>
              <p>No interview history yet. Start your first interview to see results here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;