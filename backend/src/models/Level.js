const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  codeExample: String
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema]
});

const levelSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
  skillId: { type: String, trim: true, index: true },
  slug: { type: String, trim: true, index: true },
  name: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  order: { type: Number, default: 0 },
  modules: [moduleSchema]
}, { timestamps: true });

module.exports = mongoose.model('Level', levelSchema);

