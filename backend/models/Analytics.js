const mongoose = require('mongoose');
const analyticsSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: String,
  total_questions: { type: Number, default: 0 },
  correct_answers: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  difficulty_stats: {
    easy: { total: { type: Number, default: 0 }, correct: { type: Number, default: 0 } },
    medium: { total: { type: Number, default: 0 }, correct: { type: Number, default: 0 } },
    hard: { total: { type: Number, default: 0 }, correct: { type: Number, default: 0 } }
  },

  last_updated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);