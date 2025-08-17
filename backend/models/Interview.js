const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  totalQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
