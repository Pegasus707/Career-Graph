const { buildRoadmap, computeUnlockedPhases } = require('../services/skillGapService');
const Career = require('../models/Career');
const UserProfile = require('../models/UserProfile');
const mongoose = require('mongoose');

exports.getRoadmap = async (req, res, next) => {
  try {
    const careerId = req.params.careerId || req.user.targetCareer;
    if (!careerId) return res.status(400).json({ message: 'No target career set. Complete onboarding first.' });

    if (req.params.careerId) {
      const isObjectId = mongoose.Types.ObjectId.isValid(req.params.careerId);
      const career = await Career.findOne(isObjectId ? { _id: req.params.careerId } : { slug: req.params.careerId });
      if (!career) return res.status(404).json({ message: 'Career not found' });
    }

    const rawRoadmap = await buildRoadmap(req.user._id, careerId);
    const roadmap = computeUnlockedPhases(rawRoadmap);

    res.json(roadmap);
  } catch (err) {
    next(err);
  }
};

exports.computeUnlockedPhases = computeUnlockedPhases;


