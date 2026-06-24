const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Analytics = require('../models/Analytics');
const { generateAdaptiveQuestion, evaluateCandidateResponse, generateSessionSummary } = require('../services/agents/interviewAgent');

const startInterview = async (req, res) => {
  try {
    const { topic, difficulty, type, resumeId } = req.body;

    const validTopics = ['JavaScript', 'Python', 'Java', 'Data Structures', 'Algorithms', 'DBMS', 'System Design', 'React', 'Node.js', 'Operating Systems', 'Computer Networks', 'Web Development'];
    
    const interview = new Interview({
      user_id: req.user._id,
      topic,
      type: type || 'Technical',
      difficulty,
      resume_id: resumeId || null,
      totalQuestions: 1, 
      correctAnswers: 0
    });
    await interview.save();

    const questionData = await generateAdaptiveQuestion({
      type: interview.type,
      topic: interview.topic,
      difficulty: interview.difficulty,
      resumeId: interview.resume_id,
      history: []
    });

    const question = new Question({
      interview_id: interview._id,
      question_text: questionData.question,
      topic,
      difficulty,
      ideal_answer: questionData.ideal_answer
    });
    await question.save();

    res.json({
      interview_id: interview._id,
      type: interview.type,
      topic: interview.topic,
      difficulty: interview.difficulty,
      question: {
        id: question._id,
        text: question.question_text
      }
    });
  } catch (error) {
    console.error('Start Interview Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { question_id, user_response } = req.body;

    const question = await Question.findById(question_id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const interview = await Interview.findById(question.interview_id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    const evaluation = await evaluateCandidateResponse({
      question: question.question_text,
      userAnswer: user_response,
      idealAnswer: question.ideal_answer,
      type: interview.type
    });

    const answer = new Answer({
      user_id: req.user._id,
      question_id,
      user_response,
      score: evaluation.score,
      feedback: evaluation.feedback,
      is_correct: evaluation.is_correct,
      evaluation: evaluation.evaluation
    });
    await answer.save();

    if (evaluation.is_correct) {
      interview.correctAnswers += 1;
    }
    await interview.save();

    await updateAnalytics(req.user._id, question.topic, question.difficulty, evaluation.is_correct);

    res.json({
      score: evaluation.score,
      feedback: evaluation.feedback,
      is_correct: evaluation.is_correct,
      evaluation: evaluation.evaluation
    });
  } catch (error) {
    console.error('Submit Answer Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getNextQuestion = async (req, res) => {
  try {
    const { interview_id } = req.params;

    const interview = await Interview.findById(interview_id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const questions = await Question.find({ interview_id: interview._id }).sort({ createdAt: 1 });
    const questionIds = questions.map(q => q._id);
    const answers = await Answer.find({ question_id: { $in: questionIds } }).sort({ createdAt: 1 });

    const sessionHistory = questions.map(q => {
      const ans = answers.find(a => a.question_id.toString() === q._id.toString());
      return {
        question: q.question_text,
        answer: ans ? ans.user_response : ''
      };
    });

    const questionData = await generateAdaptiveQuestion({
      type: interview.type,
      topic: interview.topic,
      difficulty: interview.difficulty,
      resumeId: interview.resume_id,
      history: sessionHistory
    });

    const question = new Question({
      interview_id: interview._id,
      question_text: questionData.question,
      topic: interview.topic,
      difficulty: interview.difficulty,
      ideal_answer: questionData.ideal_answer
    });
    await question.save();

    interview.totalQuestions += 1;
    await interview.save();

    res.json({
      question: {
        id: question._id,
        text: question.question_text
      }
    });
  } catch (error) {
    console.error('Get Next Question Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const endInterview = async (req, res) => {
  try {
    const { interview_id } = req.params;

    const interview = await Interview.findById(interview_id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const questions = await Question.find({ interview_id });
    const answers = await Answer.find({ question_id: { $in: questions.map(q => q._id) } });

    const transcript = questions.map(q => {
      const ans = answers.find(a => a.question_id.toString() === q._id.toString());
      return {
        question: q.question_text,
        candidate_response: ans ? ans.user_response : '',
        score: ans ? ans.score : 0,
        feedback: ans ? ans.feedback : ''
      };
    });

    let summaryReport = {
      readinessScore: 0,
      summary: "Interview session ended before completion.",
      overallStrengths: [],
      overallWeaknesses: [],
      gapsIdentified: []
    };

    if (transcript.length > 0) {
      summaryReport = await generateSessionSummary(transcript);
    }

    interview.status = 'completed';
    interview.readinessScore = summaryReport.readinessScore;
    await interview.save();

    res.json({
      message: 'Interview completed and evaluated.',
      interview,
      report: summaryReport
    });
  } catch (error) {
    console.error('End Interview Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(interviews);
  } catch (error) {
    console.error('Get Interview History Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getInterviewDetails = async (req, res) => {
  try {
    const { interview_id } = req.params;

    const interview = await Interview.findOne({
      _id: interview_id,
      user_id: req.user._id,
    });
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found or not authorized' });
    }

    const questions = await Question.find({ interview_id });
    const answers = await Answer.find({
      question_id: { $in: questions.map((q) => q._id) },
      user_id: req.user._id,
    });

    const detailedHistory = questions.map((question) => {
      const answer = answers.find((a) => a.question_id.toString() === question._id.toString());
      return {
        question_id: question._id,
        question_text: question.question_text,
        topic: question.topic,
        difficulty: question.difficulty,
        ideal_answer: question.ideal_answer,
        user_response: answer ? answer.user_response : null,
        score: answer ? answer.score : null,
        feedback: answer ? answer.feedback : null,
        is_correct: answer ? answer.is_correct : null,
        evaluation: answer ? answer.evaluation : null
      };
    });

    res.json({
      interview,
      details: detailedHistory,
    });
  } catch (error) {
    console.error('Get Interview Details Error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateAnalytics = async (userId, topic, difficulty, isCorrect) => {
  try {
    let analytics = await Analytics.findOne({ user_id: userId, topic });

    if (!analytics) {
      analytics = new Analytics({ user_id: userId, topic });
    }

    analytics.total_questions += 1;
    if (isCorrect) analytics.correct_answers += 1;
    analytics.accuracy = (analytics.correct_answers / analytics.total_questions) * 100;

    const diffKey = difficulty.toLowerCase();
    if (!analytics.difficulty_stats[diffKey]) {
      analytics.difficulty_stats[diffKey] = { total: 0, correct: 0 };
    }
    analytics.difficulty_stats[diffKey].total += 1;
    if (isCorrect) analytics.difficulty_stats[diffKey].correct += 1;

    analytics.last_updated = new Date();
    await analytics.save();
  } catch (error) {
    console.error('Analytics update error:', error);
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  getNextQuestion,
  endInterview,
  getInterviewHistory,
  getInterviewDetails,
};
