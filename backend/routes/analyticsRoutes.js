const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getUserAnalytics, getProgressTrends } = require('../controllers/analyticsController');
router.get('/user', auth, getUserAnalytics);
router.get('/trends', auth, getProgressTrends);
module.exports = router;