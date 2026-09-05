const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
  skillId: { type: String, trim: true, index: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, required: true }, // subdocument id inside Level.modules.lessons
  level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });
lessonProgressSchema.index({ user: 1, skillId: 1 });

module.exports = mongoose.model('LessonProgress', lessonProgressSchema);

