const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Analytics = require('../models/Analytics');
const { generateQuestion, evaluateAnswer } = require('../utils/gemini');

const startInterview = async (req, res) => {
  try {
    const { topic, difficulty } = req.body;

    const validTopics = ['JavaScript', 'Python', 'Java', 'Data Structures', 'Algorithms', 'DBMS', 'System Design', 'React', 'Node.js'];
    if (!validTopics.includes(topic)) {
      return res.status(400).json({ message: 'Invalid topic. Please select a technical interview topic.' });
    }

    const interview = new Interview({
      user_id: req.user._id,
      topic,
      difficulty,
      totalQuestions: 1, 
      correctAnswers: 0
    });
    await interview.save();

    const questionData = await generateQuestion(topic, difficulty);
    console.log('Generated question:', questionData);

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
      question: {
        id: question._id,
        text: question.question_text
      }
    });
  } catch (error) {
    console.error('Start Interview Error:', error.message, error.response?.status);
    if (error.message.includes('API key') || error.message.includes('401') || error.message.includes('400')) {
      return res.status(401).json({ message: 'Invalid or unauthorized Gemini API key. Please check your API key.' });
    }
    if (error.message.includes('429')) {
      return res.status(429).json({ message: 'Gemini API rate limit exceeded. Please try again later or check your plan.' });
    }
    if (error.message.includes('Unexpected token') || error.message.includes('not valid JSON')) {
      return res.status(500).json({ message: 'Failed to parse Gemini API response. Please try again.' });
    }
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

    const evaluation = await evaluateAnswer(question.question_text, user_response, question.ideal_answer);
    console.log('Evaluation result:', evaluation);

    const answer = new Answer({
      user_id: req.user._id,
      question_id,
      user_response,
      score: evaluation.score,
      feedback: evaluation.feedback,
      is_correct: evaluation.is_correct
    });
    await answer.save();

    const interview = await Interview.findById(question.interview_id);
    interview.totalQuestions += 1; 
    if (evaluation.is_correct) interview.correctAnswers += 1;
    await interview.save();

    await updateAnalytics(req.user._id, question.topic, question.difficulty, evaluation.is_correct);

    res.json({
      score: evaluation.score,
      feedback: evaluation.feedback,
      is_correct: evaluation.is_correct
    });
  } catch (error) {
    console.error('Submit Answer Error:', error.message, error.response?.status);
    if (error.message.includes('API key') || error.message.includes('401') || error.message.includes('400')) {
      return res.status(401).json({ message: 'Invalid or unauthorized Gemini API key. Please check your API key.' });
    }
    if (error.message.includes('429')) {
      return res.status(429).json({ message: 'Gemini API rate limit exceeded. Please try again later or check your plan.' });
    }
    if (error.message.includes('Unexpected token') || error.message.includes('not valid JSON')) {
      return res.status(500).json({ message: 'Failed to parse Gemini API response. Please try again.' });
    }
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

    const questionData = await generateQuestion(interview.topic, interview.difficulty);
    console.log('Generated next question:', questionData);

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
    console.error('Get Next Question Error:', error.message, error.response?.status);
    if (error.message.includes('API key') || error.message.includes('401') || error.message.includes('400')) {
      return res.status(401).json({ message: 'Invalid or unauthorized Gemini API key. Please check your API key.' });
    }
    if (error.message.includes('429')) {
      return res.status(429).json({ message: 'Gemini API rate limit exceeded. Please try again later or check your plan.' });
    }
    if (error.message.includes('Unexpected token') || error.message.includes('not valid JSON')) {
      return res.status(500).json({ message: 'Failed to parse Gemini API response. Please try again.' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const endInterview = async (req, res) => {
  try {
    const { interview_id } = req.params;

    const interview = await Interview.findByIdAndUpdate(
      interview_id,
      { status: 'completed' },
      { new: true }
    );

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({ message: 'Interview completed', interview });
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
      };
    });

    res.json({
      interview: {
        _id: interview._id,
        topic: interview.topic,
        difficulty: interview.difficulty,
        status: interview.status,
        createdAt: interview.createdAt,
        totalQuestions: interview.totalQuestions,
        correctAnswers: interview.correctAnswers,
      },
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
