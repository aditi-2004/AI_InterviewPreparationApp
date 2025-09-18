// Updated analyticsController.js
const Analytics = require('../models/Analytics');
const Interview = require('../models/Interview');

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

const getUserAnalytics = async (req, res) => {
  try {
    const analytics = await Analytics.find({ user_id: req.user._id });
    
    const summary = {
      totalInterviews: await Interview.countDocuments({ user_id: req.user._id }),
      overallAccuracy: 0,
      topicWisePerformance: [],
      difficultyWisePerformance: {
        easy: { total: 0, correct: 0, accuracy: 0 },
        medium: { total: 0, correct: 0, accuracy: 0 },
        hard: { total: 0, correct: 0, accuracy: 0 }
      }
    };

    let totalQuestions = 0;
    let totalCorrect = 0;

    analytics.forEach(item => {
      totalQuestions += item.total_questions;
      totalCorrect += item.correct_answers;
      
      summary.topicWisePerformance.push({
        topic: item.topic,
        accuracy: item.accuracy,
        totalQuestions: item.total_questions,
        correctAnswers: item.correct_answers
      });

      // Aggregate difficulty stats
      Object.keys(summary.difficultyWisePerformance).forEach(diff => {
        summary.difficultyWisePerformance[diff].total += item.difficulty_stats[diff].total;
        summary.difficultyWisePerformance[diff].correct += item.difficulty_stats[diff].correct;
      });
    });

    // Calculate overall accuracy
    summary.overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    // Calculate difficulty accuracies
    Object.keys(summary.difficultyWisePerformance).forEach(diff => {
      const stats = summary.difficultyWisePerformance[diff];
      stats.accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProgressTrends = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const interviews = await Interview.find({
      user_id: req.user._id,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: 1 });

    const trendsMap = {};

    interviews.forEach(interview => {
      const date = interview.createdAt;
      const year = date.getFullYear();
      const week = getISOWeek(date);
      const key = `${year}-W${String(week).padStart(2, '0')}`;

      if (!trendsMap[key]) {
        trendsMap[key] = { correct: 0, total: 0 };
      }

      trendsMap[key].correct += interview.correctAnswers;
      trendsMap[key].total += interview.totalQuestions;
    });

    const trends = Object.keys(trendsMap)
      .sort()
      .map(key => ({
        date: key,
        accuracy: trendsMap[key].total > 0 ? (trendsMap[key].correct / trendsMap[key].total) * 100 : 0
      }));

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getUserAnalytics, getProgressTrends };