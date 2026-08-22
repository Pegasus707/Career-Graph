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
  name: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  order: { type: Number, default: 0 },
  modules: [moduleSchema]
});

module.exports = mongoose.model('Level', levelSchema);
