const Career = require('../models/Career');

exports.listCareers = async (req, res, next) => {
  try {
    const careers = await Career.find().select('name slug category description');
    res.json({ careers });
  } catch (err) {
    next(err);
  }
};

exports.getCareer = async (req, res, next) => {
  try {
    const career = await Career.findById(req.params.id).populate('requiredSkills.skill', 'name slug category');
    if (!career) return res.status(404).json({ message: 'Career not found' });
    res.json({ career });
  } catch (err) {
    next(err);
  }
};
