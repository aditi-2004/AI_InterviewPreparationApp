const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getRoadmap, getKnowledgeDocs, addKnowledgeDoc } = require('../controllers/coachingController');

router.get('/roadmap', auth, getRoadmap);
router.get('/materials', auth, getKnowledgeDocs);
router.post('/materials', auth, addKnowledgeDoc);

module.exports = router;
