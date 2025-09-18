import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { analyticsAPI, interviewAPI } from '../api';
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
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from 'recharts';

const validateAPIs = () => {
  if (!analyticsAPI) {
    throw new Error('Analytics API not available. Please check your API configuration.');
  }
  if (!interviewAPI) {
    throw new Error('Interview API not available. Please check your API configuration.');
  }
  
  const requiredAnalyticsMethods = ['getUserAnalytics', 'getProgressTrends'];
  const requiredInterviewMethods = ['getHistory', 'getInterviewDetails'];
  
  requiredAnalyticsMethods.forEach(method => {
    if (typeof analyticsAPI[method] !== 'function') {
      throw new Error(`Analytics API missing required method: ${method}`);
    }
  });
  
  requiredInterviewMethods.forEach(method => {
    if (typeof interviewAPI[method] !== 'function') {
      throw new Error(`Interview API missing required method: ${method}`);
    }
  });
};

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [dataVersion, setDataVersion] = useState(0); 


  const colorPalette = {
    primary: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'],
    success: ['#10b981', '#059669', '#047857', '#065f46'],
    warning: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
    danger: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
    info: ['#06b6d4', '#0891b2', '#0e7490', '#155e75'],
    purple: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'],
    emerald: ['#10b981', '#059669', '#047857', '#065f46'],
    rose: ['#f43f5e', '#e11d48', '#be123c', '#9f1239'],
    amber: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
    cyan: ['#06b6d4', '#0891b2', '#0e7490', '#155e75'],
    violet: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'],
    lime: ['#84cc16', '#65a30d', '#4d7c0f', '#365314']
  };

  const chartColors = [
    ...colorPalette.primary,
    ...colorPalette.success,
    ...colorPalette.warning,
    ...colorPalette.info,
    ...colorPalette.purple,
    ...colorPalette.emerald,
    ...colorPalette.rose,
    ...colorPalette.amber,
    ...colorPalette.cyan,
    ...colorPalette.violet,
    ...colorPalette.lime
  ];

  const processedData = useMemo(() => {
    console.log('🔄 Reprocessing data...', { 
      analyticsExists: !!analytics, 
      historyLength: history?.length || 0,
      dataVersion 
    });
    
    if (!analytics && (!history || history.length === 0)) {
      console.log('❌ No data available for processing');
      return null;
    }

    const difficultyData = [
      {
        name: 'Easy',
        accuracy: analytics?.difficultyWisePerformance?.easy?.accuracy || 0,
        total: analytics?.difficultyWisePerformance?.easy?.total || 0,
        correct: analytics?.difficultyWisePerformance?.easy?.correct || 0,
        avgTime: analytics?.difficultyWisePerformance?.easy?.averageTime || 0,
        improvement: analytics?.difficultyWisePerformance?.easy?.improvement || 0
      },
      {
        name: 'Medium',
        accuracy: analytics?.difficultyWisePerformance?.medium?.accuracy || 0,
        total: analytics?.difficultyWisePerformance?.medium?.total || 0,
        correct: analytics?.difficultyWisePerformance?.medium?.correct || 0,
        avgTime: analytics?.difficultyWisePerformance?.medium?.averageTime || 0,
        improvement: analytics?.difficultyWisePerformance?.medium?.improvement || 0
      },
      {
        name: 'Hard',
        accuracy: analytics?.difficultyWisePerformance?.hard?.accuracy || 0,
        total: analytics?.difficultyWisePerformance?.hard?.total || 0,
        correct: analytics?.difficultyWisePerformance?.hard?.correct || 0,
        avgTime: analytics?.difficultyWisePerformance?.hard?.averageTime || 0,
        improvement: analytics?.difficultyWisePerformance?.hard?.improvement || 0
      }
    ];

    const topicMap = new Map();

    if (analytics?.topicWisePerformance && Array.isArray(analytics.topicWisePerformance)) {
      console.log('📊 Processing analytics topics:', analytics.topicWisePerformance.length);
      analytics.topicWisePerformance.forEach(topic => {
        if (topic.topic) {
          topicMap.set(topic.topic, {
            topic: topic.topic,
            accuracy: topic.accuracy || 0,
            totalQuestions: topic.totalQuestions || 0,
            correctAnswers: topic.correctAnswers || 0,
            avgScore: topic.averageScore || 0,
            timeSpent: topic.totalTimeSpent || 0,
            lastAttempted: topic.lastAttempted,
            improvement: topic.improvement || 0,
            source: 'analytics'
          });
        }
      });
    }

    if (history && Array.isArray(history)) {
      console.log('📚 Processing history topics:', history.length);
      
      const topicGroups = history.reduce((groups, interview) => {
        const topic = interview.topic;
        if (!topic) return groups;
        
        if (!groups[topic]) {
          groups[topic] = [];
        }
        groups[topic].push(interview);
        return groups;
      }, {});

      Object.entries(topicGroups).forEach(([topic, interviews]) => {
        const existingTopic = topicMap.get(topic);
        
        const aggregatedStats = interviews.reduce((acc, interview) => {
          acc.totalQuestions += interview.totalQuestions || 0;
          acc.correctAnswers += interview.correctAnswers || 0;
          acc.totalDuration += interview.duration || 0;
          acc.sessionCount += 1;
          
          const interviewDate = new Date(interview.createdAt);
          if (!acc.lastAttempted || interviewDate > new Date(acc.lastAttempted)) {
            acc.lastAttempted = interview.createdAt;
          }
          
          return acc;
        }, {
          totalQuestions: 0,
          correctAnswers: 0,
          totalDuration: 0,
          sessionCount: 0,
          lastAttempted: null
        });

        const calculatedAccuracy = aggregatedStats.totalQuestions > 0 
          ? (aggregatedStats.correctAnswers / aggregatedStats.totalQuestions) * 100 
          : 0;
        
        if (existingTopic) {
          const mergedTopic = {
            ...existingTopic,
            totalQuestions: Math.max(existingTopic.totalQuestions, aggregatedStats.totalQuestions),
            correctAnswers: Math.max(existingTopic.correctAnswers, aggregatedStats.correctAnswers),
            accuracy: existingTopic.accuracy > 0 ? existingTopic.accuracy : calculatedAccuracy,
            lastAttempted: aggregatedStats.lastAttempted || existingTopic.lastAttempted,
            timeSpent: (existingTopic.timeSpent || 0) + aggregatedStats.totalDuration,
            sessionCount: aggregatedStats.sessionCount,
            source: 'merged'
          };
          topicMap.set(topic, mergedTopic);
        } else {
          topicMap.set(topic, {
            topic: topic,
            accuracy: calculatedAccuracy,
            totalQuestions: aggregatedStats.totalQuestions,
            correctAnswers: aggregatedStats.correctAnswers,
            avgScore: calculatedAccuracy,
            timeSpent: aggregatedStats.totalDuration,
            lastAttempted: aggregatedStats.lastAttempted,
            improvement: 0,
            sessionCount: aggregatedStats.sessionCount,
            source: 'history'
          });
        }
      });
    }

    const topicData = Array.from(topicMap.values())
      .filter(topic => topic.topic && topic.topic.trim() !== '') 
      .map((topic, index) => ({
        ...topic,
        fill: chartColors[index % chartColors.length]
      }))
      .sort((a, b) => {
        if (b.totalQuestions === a.totalQuestions) {
          return b.accuracy - a.accuracy;
        }
        return b.totalQuestions - a.totalQuestions;
      });

    console.log('✅ Processed topic data:', {
      totalTopics: topicData.length,
      topics: topicData.map(t => ({ name: t.topic, questions: t.totalQuestions, accuracy: t.accuracy }))
    });

    const totalTopicsCovered = topicData.length;
    const averageAccuracy = topicData.length > 0 
      ? topicData.reduce((sum, topic) => sum + topic.accuracy, 0) / topicData.length 
      : 0;
    
    const radarData = [
      {
        subject: 'Accuracy',
        A: analytics?.overallAccuracy || averageAccuracy || 0,
        fullMark: 100
      },
      {
        subject: 'Speed',
        A: analytics?.averageSpeed || 0,
        fullMark: 100
      },
      {
        subject: 'Consistency',
        A: analytics?.consistencyScore || (averageAccuracy > 70 ? 85 : 60) || 0,
        fullMark: 100
      },
      {
        subject: 'Difficulty Progress',
        A: analytics?.difficultyProgression || 0,
        fullMark: 100
      },
      {
        subject: 'Topic Coverage',
        A: Math.min((totalTopicsCovered / 10) * 100, 100),
        fullMark: 100
      },
      {
        subject: 'Recent Performance',
        A: analytics?.recentPerformance || averageAccuracy || 0,
        fullMark: 100
      }
    ];

    return { difficultyData, topicData, radarData };
  }, [analytics, history, chartColors, dataVersion]);

  const loadData = useCallback(async (isRefresh = false) => {
    console.log(`🔄 ${isRefresh ? 'Refreshing' : 'Loading'} data from database...`);
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      validateAPIs();
      
      if (isRefresh) {
        setAnalytics(null);
        setTrends([]);
        setHistory([]);
      }
      
      const timestamp = Date.now();
      const [analyticsRes, trendsRes, historyRes] = await Promise.allSettled([
        analyticsAPI.getUserAnalytics({ _t: timestamp }),
        analyticsAPI.getProgressTrends({ _t: timestamp }),
        interviewAPI.getHistory({ _t: timestamp })
      ]);

      let hasDataChanged = false;

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.data) {
        console.log('📊 Analytics data loaded:', analyticsRes.value.data);
        const newAnalytics = analyticsRes.value.data;
        
        if (JSON.stringify(newAnalytics) !== JSON.stringify(analytics)) {
          hasDataChanged = true;
        }
        
        setAnalytics(newAnalytics);
      } else {
        console.warn('⚠️ Analytics data not available:', analyticsRes.reason);
        setAnalytics(null);
      }

      if (trendsRes.status === 'fulfilled' && trendsRes.value?.data) {
        console.log('📈 Trends data loaded:', trendsRes.value.data);
        const newTrends = trendsRes.value.data || [];
        
        if (JSON.stringify(newTrends) !== JSON.stringify(trends)) {
          hasDataChanged = true;
        }
        
        setTrends(newTrends);
      } else {
        console.warn('⚠️ Trends data not available:', trendsRes.reason);
        setTrends([]);
      }

      if (historyRes.status === 'fulfilled' && historyRes.value?.data) {
        console.log('📚 History data loaded:', historyRes.value.data);
        const newHistory = historyRes.value.data || [];
        
        if (JSON.stringify(newHistory) !== JSON.stringify(history)) {
          hasDataChanged = true;
          console.log('🔄 History data has changed, updating...');
        }
        
        setHistory(newHistory);
        
        const uniqueTopics = [...new Set(newHistory.map(interview => interview.topic).filter(Boolean))];
        console.log('🏷️ Unique topics found in history:', uniqueTopics);
      } else {
        console.error('❌ Failed to load history:', historyRes.reason);
        if (historyRes.reason?.message) {
          throw new Error(`Failed to load interview history: ${historyRes.reason.message}`);
        }
      }

      
      if (hasDataChanged || isRefresh) {
        console.log('🔄 Data has changed, incrementing version...');
        setDataVersion(prev => prev + 1);
      }

      setLastUpdated(new Date());
      setDetails({}); 
      
    } catch (error) {
      console.error('💥 Critical error loading data:', error);
      setError(error.message || 'Failed to load data from database. Please check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [analytics, trends, history]);

  const loadInterviewDetails = useCallback(async (interviewId) => {
    if (details[interviewId]) {
      setDetails(prev => ({ ...prev, [interviewId]: null }));
      return;
    }
    
    setLoadingDetails(prev => ({ ...prev, [interviewId]: true }));
    
    try {
      console.log(`🔍 Loading interview details from database for ID: ${interviewId}`);
      
      if (typeof interviewAPI.getInterviewDetails !== 'function') {
        throw new Error('getInterviewDetails method not available in interview API');
      }
      
      const response = await interviewAPI.getInterviewDetails(interviewId);
      
      if (!response || !response.data) {
        throw new Error('Invalid response format from database');
      }
      
      console.log('📋 Interview details loaded from database:', response.data);
      setDetails(prev => ({ ...prev, [interviewId]: response.data }));
      
    } catch (error) {
      console.error('❌ Error loading interview details:', error);
      setError(`Failed to load interview details from database: ${error.message}`);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [interviewId]: false }));
    }
  }, [details]);

  useEffect(() => {
    console.log('🚀 Component mounted, loading initial data...');
    loadData();
  }, []); 
  const handleManualRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    loadData(true);
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ Auto-refresh triggered');
      loadData(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadData]);

  useEffect(() => {
    console.log('🔍 Data state changed:', {
      analytics: !!analytics,
      trendsLength: trends.length,
      historyLength: history.length,
      processedDataExists: !!processedData,
      topicsCount: processedData?.topicData?.length || 0,
      dataVersion
    });
  }, [analytics, trends, history, processedData, dataVersion]);

  // Enhanced loading component
  const LoadingComponent = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '400px',
      gap: '1rem'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f4f6',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <div style={{ fontSize: '1.1rem', color: '#6b7280' }}>
        Loading analytics from database...
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );

  // Enhanced error component
  const ErrorComponent = () => (
    <div style={{
      textAlign: 'center',
      padding: '3rem',
      background: '#fef2f2',
      borderRadius: '8px',
      border: '1px solid #fecaca'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
      <h3 style={{ color: '#dc2626', marginBottom: '1rem' }}>Database Connection Error</h3>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{error}</p>
      <button 
        onClick={handleManualRefresh}
        style={{
          padding: '0.75rem 1.5rem',
          background: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
      >
        Retry Database Connection
      </button>
    </div>
  );

  // Enhanced empty state
  const EmptyStateComponent = () => (
    <div style={{
      textAlign: 'center',
      padding: '4rem',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      borderRadius: '12px'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
      <h3 style={{ color: '#475569', marginBottom: '1rem' }}>No Analytics Data</h3>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        Complete some interviews to unlock detailed performance insights and progress tracking!
      </p>
      <div style={{
        padding: '1rem',
        background: '#e0f2fe',
        borderRadius: '8px',
        marginTop: '1rem'
      }}>
        <p style={{ color: '#0369a1', fontSize: '0.9rem', margin: 0 }}>
          💡 Your analytics will show accuracy trends, topic performance, difficulty progression, and detailed interview insights.
        </p>
      </div>
    </div>
  );

  if (loading) return <LoadingComponent />;
  if (error) return <ErrorComponent />;
  
  const hasAnyData = (analytics && analytics.totalInterviews > 0) || (history && history.length > 0);
  if (!hasAnyData) return <EmptyStateComponent />;

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh'
    }}>
      {/* Enhanced Dashboard Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h1 style={{ 
            color: '#1e293b', 
            margin: '0 0 0.5rem 0',
            fontSize: '2rem',
            fontWeight: '700'
          }}>
            Performance Analytics Dashboard
          </h1>
          <p style={{ 
            color: '#64748b', 
            margin: 0,
            fontSize: '1rem'
          }}>
            Comprehensive insights from all your interview topics 
            {lastUpdated && (
              <span style={{ marginLeft: '1rem', fontSize: '0.875rem' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button 
          onClick={handleManualRefresh}
          disabled={refreshing}
          style={{
            padding: '0.75rem 1.5rem',
            background: refreshing ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.2s'
          }}
        >
          {refreshing ? '↻ Refreshing...' : '🔄 Refresh Data'}
        </button>
      </div>

      {/* Enhanced Key Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {[
          {
            title: 'Total Interviews',
            value: analytics?.totalInterviews || history?.length || 0,
            subtitle: 'Completed Sessions',
            icon: '📝',
            color: colorPalette.primary[0],
            trend: analytics?.interviewTrend
          },
          {
            title: 'Topics Covered',
            value: processedData?.topicData?.length || 0,
            subtitle: 'Unique Topics',
            icon: '🏷️',
            color: colorPalette.success,
            trend: analytics?.topicTrend
          },
          {
            title: 'Recent Activity',
            value: history?.length || 0,
            subtitle: 'Sessions This Period',
            icon: '📈',
            color: colorPalette.info,
            trend: analytics?.activityTrend
          }
        ].map((metric, index) => (
          <div key={index} style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderLeft: `4px solid ${metric.color}`,
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h3 style={{
                margin: 0,
                color: '#64748b',
                fontSize: '0.875rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.025em'
              }}>{metric.title}</h3>
              <span style={{ fontSize: '1.5rem' }}>{metric.icon}</span>
            </div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '0.5rem'
            }}>{metric.value}</div>
            <div style={{
              fontSize: '0.875rem',
              color: '#64748b'
            }}>{metric.subtitle}</div>
            {metric.trend !== undefined && (
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: metric.trend >= 0 ? colorPalette.success[0] : colorPalette.danger
              }}>
                {metric.trend >= 0 ? '↗️' : '↘️'} {Math.abs(metric.trend).toFixed(1)}% vs last week
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Debug Information Panel - Remove in production */}
      <div style={{
        background: '#f3f4f6',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        fontSize: '0.875rem',
        color: '#374151',
        fontFamily: 'monospace'
      }}>
        <strong>Debug Info:</strong> Analytics: {analytics ? 'Yes' : 'No'} | 
        History: {history.length} items | 
        Topics: {processedData?.topicData?.length || 0} | 
        Version: {dataVersion} | 
        Processed: {processedData ? 'Yes' : 'No'}
      </div>

      {/* Enhanced Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Performance by Difficulty Chart */}
        {processedData?.difficultyData && (
          <div key={`difficulty-chart-${dataVersion}`} style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', fontWeight: '600' }}>
                📊 Performance by Difficulty Level
              </h3>
              <div style={{
                fontSize: '0.875rem',
                color: '#64748b',
                background: '#f1f5f9',
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem'
              }}>
                Shows accuracy trends across difficulty levels
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={processedData.difficultyData} key={dataVersion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => {
                    if (name === 'accuracy') return [`${value.toFixed(1)}%`, 'Accuracy'];
                    if (name === 'correct') return [value, 'Correct Answers'];
                    if (name === 'total') return [value, 'Total Questions'];
                    return value;
                  }}
                />
                <Bar dataKey="accuracy" fill={colorPalette.primary[0]} name="Accuracy" radius={[4, 4, 0, 0]} />
                <Bar dataKey="correct" fill={colorPalette.success} name="Correct Answers" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill={colorPalette.info} name="Total Questions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Performance Radar Chart */}
        {processedData?.radarData && (
          <div key={`radar-chart-${dataVersion}`} style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', fontWeight: '600' }}>
                🎯 Performance Radar
              </h3>
              <div style={{
                fontSize: '0.875rem',
                color: '#64748b',
                background: '#f1f5f9',
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem'
              }}>
                Multi-dimensional performance view
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={processedData.radarData} key={dataVersion}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <Radar
                  name="Performance"
                  dataKey="A"
                  stroke={colorPalette.primary[0]}
                  fill={colorPalette.primary}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Topic Performance - Show ALL Topics */}
        <div key={`topic-chart-${dataVersion}`} style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          gridColumn: processedData?.topicData?.length > 6 ? '1 / -1' : 'auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', fontWeight: '600' }}>
              🏷️ All Topic Performance ({processedData?.topicData?.length || 0} Topics)
            </h3>
            <div style={{
              fontSize: '0.875rem',
              color: '#64748b',
              background: '#f1f5f9',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem'
            }}>
              Complete topic coverage analysis
            </div>
          </div>

          {processedData?.topicData?.length > 0 ? (
            <div>
              {/* Pie Chart for visual representation */}
              <ResponsiveContainer width="100%" height={400}>
                <PieChart key={dataVersion}>
                  <Pie
                    data={processedData.topicData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ topic, totalQuestions, accuracy }) =>
                      totalQuestions > 0 ? `${topic}: ${totalQuestions}q (${accuracy.toFixed(1)}%)` : `${topic}: 0q`
                    }
                    outerRadius={150}
                    dataKey="totalQuestions"
                  >
                    {processedData.topicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name, props) => [
                      `${value} questions`,
                      `${props.payload.topic} (${props.payload.accuracy?.toFixed(1) || 0}% accuracy)`
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Comprehensive Topic Details Table */}
              <div style={{
                marginTop: '2rem'
              }}>
                <h4 style={{
                  margin: '0 0 1rem 0',
                  color: '#374151',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}>
                  📋 Detailed Topic Breakdown
                </h4>
                
                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.875rem'
                  }}>
                    <thead style={{
                      background: '#f8fafc',
                      position: 'sticky',
                      top: 0,
                      zIndex: 10
                    }}>
                      <tr>
                        <th style={{ 
                          padding: '1rem 0.75rem', 
                          textAlign: 'left', 
                          color: '#374151', 
                          fontWeight: '600',
                          borderBottom: '2px solid #e2e8f0'
                        }}>Topic</th>
                        <th style={{ 
                          padding: '1rem 0.75rem', 
                          textAlign: 'center', 
                          color: '#374151', 
                          fontWeight: '600',
                          borderBottom: '2px solid #e2e8f0'
                        }}>Total Questions</th>
                        <th style={{ 
                          padding: '1rem 0.75rem', 
                          textAlign: 'center', 
                          color: '#374151', 
                          fontWeight: '600',
                          borderBottom: '2px solid #e2e8f0'
                        }}>Correct</th>
                        <th style={{ 
                          padding: '1rem 0.75rem', 
                          textAlign: 'center', 
                          color: '#374151', 
                          fontWeight: '600',
                          borderBottom: '2px solid #e2e8f0'
                        }}>Accuracy</th>
                        <th style={{ 
                          padding: '1rem 0.75rem', 
                          textAlign: 'center', 
                          color: '#374151', 
                          fontWeight: '600',
                          borderBottom: '2px solid #e2e8f0'
                        }}>Last Attempted</th>
                        <th style={{ 
                          padding: '1rem 0.75rem', 
                          textAlign: 'center', 
                          color: '#374151', 
                          fontWeight: '600',
                          borderBottom: '2px solid #e2e8f0'
                        }}>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedData.topicData.map((topic, index) => (
                        <tr key={`topic-${topic.topic}-${index}-${dataVersion}`} style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{
                            padding: '1rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}>
                            <div style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              backgroundColor: topic.fill,
                              flexShrink: 0
                            }}></div>
                            <div>
                              <div style={{ 
                                fontWeight: '600', 
                                color: '#1e293b',
                                marginBottom: '0.25rem'
                              }}>
                                {topic.topic}
                              </div>
                              {topic.source && (
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: '#9ca3af',
                                  textTransform: 'uppercase'
                                }}>
                                  From {topic.source}
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={{ 
                            padding: '1rem 0.75rem', 
                            textAlign: 'center',
                            color: '#64748b',
                            fontWeight: '600'
                          }}>
                            <div style={{
                              display: 'inline-block',
                              minWidth: '40px',
                              padding: '0.25rem 0.5rem',
                              background: topic.totalQuestions > 0 ? '#e0f2fe' : '#f3f4f6',
                              borderRadius: '12px',
                              fontSize: '0.875rem'
                            }}>
                              {topic.totalQuestions}
                            </div>
                          </td>
                          <td style={{ 
                            padding: '1rem 0.75rem', 
                            textAlign: 'center',
                            color: '#64748b',
                            fontWeight: '600'
                          }}>
                            <div style={{
                              display: 'inline-block',
                              minWidth: '40px',
                              padding: '0.25rem 0.5rem',
                              background: topic.correctAnswers > 0 ? '#dcfce7' : '#f3f4f6',
                              borderRadius: '12px',
                              fontSize: '0.875rem'
                            }}>
                              {topic.correctAnswers || 0}
                            </div>
                          </td>
                          <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.375rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              background: topic.accuracy >= 80 
                                ? '#dcfce7'
                                : topic.accuracy >= 60
                                ? '#fef3c7'
                                : topic.accuracy >= 40
                                ? '#fed7aa'
                                : topic.accuracy > 0
                                ? '#fecaca'
                                : '#f3f4f6',
                              color: topic.accuracy >= 80
                                ? '#166534'
                                : topic.accuracy >= 60
                                ? '#92400e'
                                : topic.accuracy >= 40
                                ? '#9a3412'
                                : topic.accuracy > 0
                                ? '#991b1b'
                                : '#6b7280'
                            }}>
                              {topic.accuracy > 0 ? `${topic.accuracy.toFixed(1)}%` : 'N/A'}
                            </span>
                          </td>
                          <td style={{ 
                            padding: '1rem 0.75rem', 
                            textAlign: 'center',
                            color: '#64748b',
                            fontSize: '0.8rem'
                          }}>
                            {topic.lastAttempted 
                              ? new Date(topic.lastAttempted).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: '2-digit'
                                })
                              : 'Never'
                            }
                          </td>
                          <td style={{ 
                            padding: '1rem 0.75rem', 
                            textAlign: 'center'
                          }}>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              textTransform: 'uppercase',
                              background: topic.source === 'analytics' ? '#e0f2fe' : '#fef3c7',
                              color: topic.source === 'analytics' ? '#0369a1' : '#92400e'
                            }}>
                              {topic.source || 'unknown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Topic Statistics Summary */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '700', 
                      color: colorPalette.primary[0] 
                    }}>
                      {processedData.topicData.length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
                      Total Topics
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '700', 
                      color: colorPalette.success[0] 
                    }}>
                      {processedData.topicData.filter(t => t.accuracy >= 80).length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
                      High Performance (≥80%)
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '700', 
                      color: colorPalette.warning[0] 
                    }}>
                      {processedData.topicData.filter(t => t.accuracy >= 60 && t.accuracy < 80).length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
                      Good Performance (60-79%)
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '700', 
                      color: colorPalette.danger[0] 
                    }}>
                      {processedData.topicData.filter(t => t.accuracy > 0 && t.accuracy < 60).length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
                      Need Improvement (&lt;60%)
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '700', 
                      color: '#6b7280' 
                    }}>
                      {processedData.topicData.reduce((sum, t) => sum + t.totalQuestions, 0)}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>
                      Total Questions Across All Topics
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#64748b',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '2px dashed #e2e8f0'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h4 style={{ color: '#475569', marginBottom: '1rem' }}>No Topic Data Available</h4>
              <p style={{ marginBottom: '1rem' }}>
                Complete interviews across different topics to see detailed performance breakdowns.
              </p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Data sources: Analytics API and Interview History
              </p>
            </div>
          )}
        </div>

        {/* Progress Over Time */}
        {trends.length > 0 && (
          <div key={`trends-chart-${dataVersion}`} style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            gridColumn: '1 / -1'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', fontWeight: '600' }}>
                📈 Progress Trends Over Time
              </h3>
              <div style={{
                fontSize: '0.875rem',
                color: '#64748b',
                background: '#f1f5f9',
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem'
              }}>
                Historical performance tracking
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends} key={dataVersion}>
                <defs>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colorPalette.primary[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colorPalette.primary} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  stroke="#94a3b8"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name, props) =>
                    [`${value.toFixed(1)}%`, `Accuracy (${props.payload.topic || 'All Topics'})`]
                  }
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke={colorPalette.primary[0]}
                  fillOpacity={1}
                  fill="url(#colorAccuracy)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Enhanced Interview History Section */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem', fontWeight: '600' }}>
            📋 Complete Interview History
          </h3>
          <div style={{
            fontSize: '0.875rem',
            color: '#64748b',
            background: '#f1f5f9',
            padding: '0.5rem 1rem',
            borderRadius: '1rem'
          }}>
            {history.length} total sessions • All topics included
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {history.length > 0 ? (
            history.map((interview) => (
              <div key={`interview-${interview._id}-${dataVersion}`} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'box-shadow 0.2s'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  borderLeft: `4px solid ${
                    interview.status === 'completed' 
                      ? colorPalette.success[0]
                      : interview.status === 'in_progress'
                      ? colorPalette.warning
                      : colorPalette.info
                  }`
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#1e293b',
                        fontSize: '1.1rem'
                      }}>{interview.topic}</div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        background: interview.difficulty === 'easy' 
                          ? '#dcfce7' 
                          : interview.difficulty === 'medium'
                          ? '#fef3c7'
                          : '#fecaca',
                        color: interview.difficulty === 'easy'
                          ? '#166534'
                          : interview.difficulty === 'medium'
                          ? '#92400e'
                          : '#991b1b'
                      }}>
                        {interview.difficulty}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#64748b',
                      display: 'flex',
                      gap: '1rem'
                    }}>
                      <span>📅 {new Date(interview.createdAt).toLocaleDateString()}</span>
                      <span>⏰ {new Date(interview.createdAt).toLocaleTimeString()}</span>
                      {interview.duration && (
                        <span>⏱️ {Math.round(interview.duration / 60)}min</span>
                      )}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      color: interview.totalQuestions > 0 
                        ? (interview.correctAnswers / interview.totalQuestions >= 0.8 
                          ? colorPalette.success[0]
                          : interview.correctAnswers / interview.totalQuestions >= 0.6
                          ? colorPalette.warning
                          : colorPalette.danger)
                        : '#64748b'
                    }}>
                      {interview.totalQuestions > 0
                        ? `${interview.correctAnswers}/${interview.totalQuestions}`
                        : 'In progress'}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#64748b'
                    }}>
                      {interview.totalQuestions > 0
                        ? `${((interview.correctAnswers / interview.totalQuestions) * 100).toFixed(1)}% accuracy`
                        : 'No score yet'}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <span style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      background: interview.status === 'completed' 
                        ? '#dcfce7'
                        : interview.status === 'in_progress'
                        ? '#fef3c7'
                        : '#e0f2fe',
                      color: interview.status === 'completed'
                        ? '#166534'
                        : interview.status === 'in_progress'
                        ? '#92400e'
                        : '#0c4a6e'
                    }}>
                      {interview.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => loadInterviewDetails(interview._id)}
                      disabled={loadingDetails[interview._id]}
                      style={{
                        padding: '0.5rem 1rem',
                        background: loadingDetails[interview._id] 
                          ? '#9ca3af' 
                          : details[interview._id] 
                          ? '#ef4444'
                          : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loadingDetails[interview._id] ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {loadingDetails[interview._id] 
                        ? '⏳ Loading...' 
                        : details[interview._id] 
                          ? '👁️ Hide Details' 
                          : '🔍 View Details'}
                    </button>
                  </div>
                </div>
                
                {/* Enhanced Interview Details */}
                {details[interview._id] && (
                  <div style={{
                    padding: '2rem',
                    background: '#fafafa',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <h4 style={{
                        margin: 0,
                        color: '#1e293b',
                        fontSize: '1.1rem',
                        fontWeight: '600'
                      }}>📊 Detailed Question Analysis</h4>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        background: '#e0f2fe',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px'
                      }}>
                        Live data from database
                      </div>
                    </div>
                    
                    {details[interview._id].details && details[interview._id].details.length > 0 ? (
                      <div style={{
                        display: 'grid',
                        gap: '1rem'
                      }}>
                        {details[interview._id].details.map((item, index) => (
                          <div key={item.question_id || index} style={{
                            padding: '1.5rem',
                            background: 'white',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            borderLeft: `4px solid ${
                              item.is_correct === true 
                                ? colorPalette.success[0]
                                : item.is_correct === false
                                ? colorPalette.danger
                                : '#9ca3af'
                            }`
                          }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              marginBottom: '1rem'
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  marginBottom: '0.75rem',
                                  fontSize: '1rem',
                                  lineHeight: '1.5'
                                }}>
                                  <strong style={{ color: '#374151' }}>Question {index + 1}:</strong> 
                                  <span style={{ marginLeft: '0.5rem', color: '#1e293b' }}>
                                    {item.question_text}
                                  </span>
                                </div>
                                
                                <div style={{
                                  marginBottom: '0.75rem',
                                  fontSize: '0.95rem',
                                  lineHeight: '1.4'
                                }}>
                                  <strong style={{ color: '#374151' }}>Your Answer:</strong>
                                  <span style={{ 
                                    marginLeft: '0.5rem', 
                                    color: item.user_response ? '#1e293b' : '#9ca3af',
                                    fontStyle: item.user_response ? 'normal' : 'italic'
                                  }}>
                                    {item.user_response || 'Not answered'}
                                  </span>
                                </div>
                                
                                {item.feedback && (
                                  <div style={{
                                    marginBottom: '0.75rem',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.4'
                                  }}>
                                    <strong style={{ color: '#374151' }}>AI Feedback:</strong>
                                    <div style={{ 
                                      marginTop: '0.5rem',
                                      padding: '1rem',
                                      background: '#f8fafc',
                                      borderRadius: '6px',
                                      border: '1px solid #e2e8f0',
                                      color: '#374151'
                                    }}>
                                      {item.feedback}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginLeft: '1rem'
                              }}>
                                <div style={{
                                  padding: '0.5rem 1rem',
                                  borderRadius: '20px',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                  background: item.is_correct === true 
                                    ? '#dcfce7'
                                    : item.is_correct === false
                                    ? '#fecaca'
                                    : '#f3f4f6',
                                  color: item.is_correct === true
                                    ? '#166534'
                                    : item.is_correct === false
                                    ? '#991b1b'
                                    : '#374151'
                                }}>
                                  {item.is_correct === true 
                                    ? '✅ Correct' 
                                    : item.is_correct === false
                                    ? '❌ Wrong'
                                    : '⏳ Pending'}
                                </div>
                                
                                {item.score !== null && item.score !== undefined && (
                                  <div style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    color: item.score >= 80 
                                      ? colorPalette.success[0]
                                      : item.score >= 60
                                      ? colorPalette.warning
                                      : colorPalette.danger
                                  }}>
                                    {item.score}%
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div style={{
                              display: 'flex',
                              gap: '2rem',
                              fontSize: '0.875rem',
                              color: '#64748b',
                              borderTop: '1px solid #e2e8f0',
                              paddingTop: '0.75rem'
                            }}>
                              {item.time_taken && (
                                <div>
                                  <strong>Time Taken:</strong> {item.time_taken}s
                                </div>
                              )}
                              {item.difficulty && (
                                <div>
                                  <strong>Difficulty:</strong> {item.difficulty}
                                </div>
                              )}
                              {item.topic && (
                                <div>
                                  <strong>Topic:</strong> {item.topic}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        background: 'white',
                        borderRadius: '8px',
                        border: '2px dashed #e2e8f0'
                      }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
                        <p style={{ color: '#64748b', fontStyle: 'italic', margin: 0 }}>
                          No question details available for this interview session.
                        </p>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                          This may be an incomplete or newly started session.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{
              
              textAlign: 'center',
              padding: '4rem',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRadius: '12px',
              border: '2px dashed #cbd5e1'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h4 style={{ color: '#475569', marginBottom: '1rem' }}>No Interview History</h4>
              <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                Start your first interview to see detailed performance tracking and insights here!
              </p>
              <div style={{
                padding: '1rem',
                background: '#e0f2fe',
                borderRadius: '8px',
                marginTop: '1rem'
              }}>
                <p style={{ color: '#0369a1', fontSize: '0.875rem', margin: 0 }}>
                  💡 Once you complete interviews, you'll see question-by-question analysis, 
                  AI feedback, scores, and performance trends.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;