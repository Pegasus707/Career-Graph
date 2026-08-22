const mongoose = require('mongoose');

const requiredSkillSchema = new mongoose.Schema({
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  requiredLevel: { type: Number, min: 1, max: 4, required: true }
}, { _id: false });

const careerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: String,
  description: String,
  requiredSkills: [requiredSkillSchema]
});

module.exports = mongoose.model('Career', careerSchema);
