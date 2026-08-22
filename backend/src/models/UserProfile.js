const mongoose = require('mongoose');

const userSkillSchema = new mongoose.Schema({
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  level: { type: Number, min: 0, max: 4, default: 0 } // 0 none, 1 beginner, 2 intermediate, 3 advanced, 4 expert
}, { _id: false });

const userProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  education: {
    degree: String,
    field: String,
    gradYear: Number,
    stillStudying: Boolean
  },
  status: { type: String, enum: ['student', 'fresher', 'employed'] },
  jobTitle: String,
  skills: [userSkillSchema]
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);
