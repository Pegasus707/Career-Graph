const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
  skillId: { type: String, trim: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  percent: { type: Number, default: 0 },
  completedLessonCount: { type: Number, default: 0 },
  totalLessonCount: { type: Number, default: 0 }
}, { timestamps: true });

courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });
courseProgressSchema.index({ user: 1, skillId: 1 });

module.exports = mongoose.model('CourseProgress', courseProgressSchema);

