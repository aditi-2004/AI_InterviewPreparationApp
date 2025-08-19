const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();
const { generateTopQuestions } = require('./utils/gemini');
const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.get('/api/questions/:topic', async (req, res) => {
  const { topic } = req.params;
  const difficulty = req.query.difficulty || 'medium'; 
  const count = req.query.count || 10; 

  try {
    const questions = await generateTopQuestions(topic, difficulty, count);
    res.json({ success: true, questions });
  } catch (error) {
    console.error('Error generating questions:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(Server running on port ${PORT}));
