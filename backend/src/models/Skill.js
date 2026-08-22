const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  type: { type: String, enum: ['documentation', 'youtube', 'course', 'article', 'practice', 'project'] },
  title: String,
  url: String,
  provider: String,
  isFree: { type: Boolean, default: true }
}, { _id: false });

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: String,
  description: String,
  whyItMatters: String,
  useCases: [String],
  futureScope: String,
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  relatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  resources: [resourceSchema]
});

module.exports = mongoose.model('Skill', skillSchema);
