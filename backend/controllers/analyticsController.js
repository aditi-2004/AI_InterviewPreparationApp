const Analytics = require('../models/Analytics');
const Interview = require('../models/Interview');

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
        totalQuestions: item.total_questions
      });

      Object.keys(summary.difficultyWisePerformance).forEach(diff => {
        summary.difficultyWisePerformance[diff].total += item.difficulty_stats[diff].total;
        summary.difficultyWisePerformance[diff].correct += item.difficulty_stats[diff].correct;
      });
    });

    summary.overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

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

    const trends = interviews.map(interview => ({
      date: interview.createdAt.toISOString().split('T')[0],
      accuracy: interview.totalQuestions > 0 ? (interview.correctAnswers / interview.totalQuestions) * 100 : 0,
      topic: interview.topic
    }));

    res.json(trends);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getUserAnalytics, getProgressTrends };