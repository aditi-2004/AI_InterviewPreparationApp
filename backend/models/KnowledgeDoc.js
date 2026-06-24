const mongoose = require('mongoose');

const knowledgeDocSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['company_experience', 'study_material', 'note'], required: true },
  content: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('KnowledgeDoc', knowledgeDocSchema);
