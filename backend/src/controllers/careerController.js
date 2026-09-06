const Career = require('../models/Career');
require('../models/Skill');
const mongoose = require('mongoose');

function escapeRegex(str) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

exports.listCareers = async (req, res, next) => {
  try {
    const { stream, degree, category } = req.query;
    const filter = {};

    if (stream && stream.trim()) {
      filter.streams = { $regex: new RegExp(escapeRegex(stream.trim()), 'i') };
    }

    if (degree && degree.trim()) {
      filter.degrees = { $regex: new RegExp(escapeRegex(degree.trim()), 'i') };
    }

    if (category && category.trim()) {
      filter.category = { $regex: new RegExp(escapeRegex(category.trim()), 'i') };
    }

    const careers = await Career.find(filter)
      .select('name slug category description streams degrees requiredSkills')
      .populate('requiredSkills.skill', 'name slug skillId category');

    res.json({ careers });
  } catch (err) {
    next(err);
  }
};

exports.getCareer = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id };

    const career = await Career.findOne(query)
      .populate('requiredSkills.skill', 'name slug skillId category description');

    if (!career) return res.status(404).json({ message: 'Career not found' });
    res.json({ career });
  } catch (err) {
    next(err);
  }
};
exports.listStreams = async (req, res, next) => {
  try {
    const streams = await Career.distinct('streams');
    const degrees = await Career.distinct('degrees');
    const categories = await Career.distinct('category');
    res.json({
      streams: streams.filter(Boolean),
      degrees: degrees.filter(Boolean),
      categories: categories.filter(Boolean)
    });
  } catch (err) {
    next(err);
  }
};
