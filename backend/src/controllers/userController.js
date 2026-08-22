const Career = require('../models/Career');
const UserProfile = require('../models/UserProfile');

exports.updateOnboarding = async (req, res, next) => {
  try {
    const { step, data } = req.body;
    const user = req.user;

    let profile = await UserProfile.findOne({ user: user._id });
    if (!profile) profile = new UserProfile({ user: user._id });

    if (step === 1) {
      profile.education = {
        degree: data.degree,
        field: data.field,
        gradYear: data.gradYear,
        stillStudying: !!data.stillStudying
      };
      await profile.save();
    } else if (step === 2) {
      profile.status = data.status;
      profile.jobTitle = data.jobTitle || '';
      await profile.save();
    } else if (step === 3) {
      profile.skills = (data.skills || []).map((s) => ({ skill: s.skill, level: s.level }));
      await profile.save();
    } else if (step === 4) {
      const career = await Career.findById(data.careerId);
      if (!career) return res.status(404).json({ message: 'Career not found' });
      user.targetCareer = career._id;
      user.onboardingComplete = true;
      await user.save();
    } else {
      return res.status(400).json({ message: 'Invalid onboarding step' });
    }

    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user._id }).populate('skills.skill', 'name slug');
    const career = req.user.targetCareer ? await Career.findById(req.user.targetCareer).select('name slug') : null;

    res.json({
      profile: profile
        ? { education: profile.education, status: profile.status, jobTitle: profile.jobTitle }
        : { education: {}, status: null, jobTitle: '' },
      skills: profile
        ? profile.skills.map((s) => ({ skill: s.skill, level: s.level }))
        : [],
      targetCareer: career,
      onboardingComplete: req.user.onboardingComplete
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, education, status, jobTitle } = req.body;
    if (name) {
      req.user.name = name;
      await req.user.save();
    }
    if (education || status || jobTitle) {
      let profile = await UserProfile.findOne({ user: req.user._id });
      if (!profile) profile = new UserProfile({ user: req.user._id });
      if (education) profile.education = { ...profile.education, ...education };
      if (status) profile.status = status;
      if (jobTitle !== undefined) profile.jobTitle = jobTitle;
      await profile.save();
    }
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};
