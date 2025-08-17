const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  startInterview,
  submitAnswer,
  getNextQuestion,
  endInterview,
  getInterviewHistory,
  getInterviewDetails,
} = require('../controllers/interviewController');

router.post('/start', auth, startInterview);
router.post('/answer', auth, submitAnswer);
router.get('/next/:interview_id', auth, getNextQuestion);
router.put('/end/:interview_id', auth, endInterview);
router.get('/history', auth, getInterviewHistory);
router.get('/details/:interview_id', auth, getInterviewDetails);

module.exports = router;
