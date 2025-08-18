const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  interview_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
  question_text: { type: String, required: true },
  generated_by: { type: String, default: 'AI' },
  topic: { type: String, required: true },
  difficulty: { type: String, required: true },
  ideal_answer: String
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
