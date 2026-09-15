const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  options: [{ type: String, required: true, trim: true }],
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String, trim: true }
}, { _id: false });

const skillQuizSchema = new mongoose.Schema({
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true, unique: true },
  skillId: { type: String, required: true, index: true, trim: true },
  title: { type: String, trim: true },
  questions: {
    type: [questionSchema],
    validate: [
      (val) => Array.isArray(val) && val.length >= 3,
      'A quiz must have at least 3 validation questions'
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model('SkillQuiz', skillQuizSchema);
