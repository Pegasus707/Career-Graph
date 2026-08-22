const { buildRoadmap } = require('../services/skillGapService');

exports.getRoadmap = async (req, res, next) => {
  try {
    const careerId = req.params.careerId || req.user.targetCareer;
    if (!careerId) return res.status(400).json({ message: 'No target career set. Complete onboarding first.' });
    const roadmap = await buildRoadmap(req.user._id, careerId);
    res.json(roadmap);
  } catch (err) {
    next(err);
  }
};
