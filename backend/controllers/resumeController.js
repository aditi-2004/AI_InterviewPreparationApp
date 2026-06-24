const Resume = require('../models/Resume');
const { analyzeResume } = require('../services/agents/resumeAgent');
const { PDFParse } = require('pdf-parse');

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please upload a PDF resume.' });
    }

    console.log('Reading PDF resume file:', req.file.originalname);
    
    // Parse PDF buffer to raw text
    const parser = new PDFParse({ data: req.file.buffer });
    const pdfData = await parser.getText();
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from the PDF. Please check the document format.' });
    }

    console.log('Invoking Resume Analysis Agent...');
    const structuredData = await analyzeResume(rawText);

    const resume = new Resume({
      user_id: req.user._id,
      originalFileName: req.file.originalname,
      parsedText: rawText,
      skills: structuredData.skills || [],
      experience: structuredData.experience || [],
      projects: structuredData.projects || []
    });

    await resume.save();

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and analyzed successfully.',
      resume: {
        id: resume._id,
        fileName: resume.originalFileName,
        skills: resume.skills,
        experienceCount: resume.experience.length,
        projectsCount: resume.projects.length
      }
    });
  } catch (error) {
    console.error('Resume Upload Controller Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error parsing resume.', error: error.message });
  }
};

const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user_id: req.user._id })
      .select('originalFileName skills createdAt')
      .sort({ createdAt: -1 });

    res.json(resumes);
  } catch (error) {
    console.error('Get User Resumes Error:', error.message);
    res.status(500).json({ message: 'Server error fetching resumes.', error: error.message });
  }
};

module.exports = { uploadResume, getUserResumes };
