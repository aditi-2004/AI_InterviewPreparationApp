const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
// In our write_to_file call, it was targetted at 'backend/middleware/fileUploadMiddleware.js'.
// So let's write path as '../middleware/fileUploadMiddleware'
const fileUpload = require('../middleware/fileUploadMiddleware');
const { uploadResume, getUserResumes } = require('../controllers/resumeController');

router.post('/upload', auth, fileUpload.single('resume'), uploadResume);
router.get('/', auth, getUserResumes);

module.exports = router;
