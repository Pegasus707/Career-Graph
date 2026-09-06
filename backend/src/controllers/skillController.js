const Skill = require('../models/Skill');
const Course = require('../models/Course');
const Level = require('../models/Level');
const Career = require('../models/Career');
const UserProfile = require('../models/UserProfile');
const CourseProgress = require('../models/CourseProgress');
const LessonProgress = require('../models/LessonProgress');

const { buildRoadmap, computeUnlockedPhases } = require('../services/skillGapService');

function escapeRegex(str) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

exports.listSkills = async (req, res, next) => {
  try {
    const q = req.query.q;
    const filter = q && q.trim() ? { name: new RegExp(escapeRegex(q.trim()), 'i') } : {};
    const skills = await Skill.find(filter).select('name slug category');
    res.json({ skills });
  } catch (err) {
    next(err);
  }
};

exports.getSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findOne({ slug: req.params.slug })
      .populate('prerequisites', 'name slug')
      .populate('relatedSkills', 'name slug');
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    const course = await Course.findOne({ skill: skill._id });
    const levels = course ? await Level.find({ course: course._id }).sort('order') : [];

    if (req.user) {
      const profile = await UserProfile.findOne({ user: req.user._id });
      const userSkill = profile && profile.skills
        ? profile.skills.find(
            (s) => s.skill && (s.skill._id ? s.skill._id.toString() : s.skill.toString()) === skill._id.toString()
          )
        : null;
      const userLevel = userSkill ? userSkill.level : 0;

      let requiredLevel = null;
      let careerName = null;
      let isLocked = false;
      let lockedReason = '';

      if (req.user.targetCareer) {
        const career = await Career.findById(req.user.targetCareer);
        const match = career && (career.requiredSkills || []).find(
          (r) => r.skill && r.skill.toString() === skill._id.toString()
        );
        if (match) {
          requiredLevel = match.requiredLevel;
          careerName = career.name;
        }

        try {
          const rawRoadmap = await buildRoadmap(req.user._id, req.user.targetCareer);
          const roadmap = computeUnlockedPhases(rawRoadmap);
          const skillNode = (roadmap.nodes || []).find(
            (n) => n.skillId.toString() === skill._id.toString() || n.slug === skill.slug
          );
          if (skillNode) {
            isLocked = !!skillNode.isLocked;
            lockedReason = skillNode.lockedReason || '';
          }
        } catch (e) {
          // Ignore roadmap calculation errors
        }
      }

      let courseProgress = 0;
      let completedLessonIds = [];
      if (course) {
        const progressDoc = await CourseProgress.findOne({ user: req.user._id, course: course._id });
        courseProgress = progressDoc ? progressDoc.percent : 0;
        const lessonProgressDocs = await LessonProgress.find({ user: req.user._id, course: course._id });
        completedLessonIds = lessonProgressDocs.map((lp) => lp.lesson.toString());
      }

      return res.json({
        skill,
        course,
        levels,
        courseProgress,
        isLocked,
        lockedReason,
        personalization: { userLevel, requiredLevel, careerName, isLocked, lockedReason },
        completedLessonIds
      });
    }

    res.json({ skill, course, levels, courseProgress: 0, isLocked: false, lockedReason: '', personalization: null, completedLessonIds: [] });
  } catch (err) {
    next(err);
  }
};
