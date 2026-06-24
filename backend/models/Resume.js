const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalFileName: { type: String, required: true },
  parsedText: { type: String, required: true },
  skills: [String],
  experience: [mongoose.Schema.Types.Mixed],
  projects: [mongoose.Schema.Types.Mixed]
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
