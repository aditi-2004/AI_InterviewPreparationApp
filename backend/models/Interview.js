const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  type: { type: String, enum: ['Technical', 'HR', 'Hiring Manager', 'System Design'], default: 'Technical' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'easy', 'medium', 'hard'], required: true },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  resume_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
  totalQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  readinessScore: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
