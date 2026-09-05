const mongoose = require('mongoose');

const requiredSkillSchema = new mongoose.Schema({
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  skillId: { type: String, trim: true },
  slug: { type: String, trim: true },
  requiredLevel: { type: Number, min: 1, max: 4, required: true },
  phase: { type: String, enum: ['foundations', 'core', 'advanced'], default: 'foundations' }
}, { _id: false });

const careerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  category: { type: String, trim: true },
  description: { type: String, trim: true },
  streams: [{ type: String, trim: true }],
  degrees: [{ type: String, trim: true }],
  requiredSkills: [requiredSkillSchema]
}, { timestamps: true });

module.exports = mongoose.model('Career', careerSchema);

