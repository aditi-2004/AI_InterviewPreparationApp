const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  user_response: { type: String, required: true },
  score: { type: Number, min: 0, max: 100 },
  feedback: String,
  is_correct: Boolean
}, { timestamps: true });

module.exports = mongoose.model('Answer', answerSchema);
