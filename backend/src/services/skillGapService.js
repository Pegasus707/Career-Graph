const Career = require('../models/Career');
const Course = require('../models/Course');
const Level = require('../models/Level');
const CourseProgress = require('../models/CourseProgress');
const UserProfile = require('../models/UserProfile');

const LEVEL_LABELS = ['None', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

// Counts total lessons across all Level documents belonging to a course.
async function countCourseLessons(courseId) {
  const levels = await Level.find({ course: courseId });
  let total = 0;
  levels.forEach((level) => {
    level.modules.forEach((mod) => { total += mod.lessons.length; });
  });
  return total;
}

async function buildRoadmap(userId, careerId) {
  const career = await Career.findById(careerId).populate('requiredSkills.skill');
  if (!career) {
    const err = new Error('Career not found');
    err.statusCode = 404;
    throw err;
  }

  const profile = await UserProfile.findOne({ user: userId });
  const declaredSkills = profile ? profile.skills : [];

  const skillIds = career.requiredSkills.map((r) => r.skill._id);
  const courses = await Course.find({ skill: { $in: skillIds } });
  const courseProgressDocs = await CourseProgress.find({
    user: userId,
    course: { $in: courses.map((c) => c._id) }
  });

  const nodes = career.requiredSkills.map((req) => {
    const skill = req.skill;
    const userSkill = declaredSkills.find((s) => s.skill.toString() === skill._id.toString());
    const declaredLevel = userSkill ? userSkill.level : 0;

    const course = courses.find((c) => c.skill.toString() === skill._id.toString());
    const progressDoc = course
      ? courseProgressDocs.find((p) => p.course.toString() === course._id.toString())
      : null;
    const courseProgress = progressDoc ? progressDoc.percent : 0;

    const effectiveLevel = courseProgress === 100 ? Math.max(declaredLevel, req.requiredLevel) : declaredLevel;

    let status = 'not_started';
    if (effectiveLevel >= req.requiredLevel) status = 'completed';
    else if (courseProgress > 0 || declaredLevel > 0) status = 'in_progress';

    const percent = status === 'completed' ? 100 : courseProgress;

    return {
      skillId: skill._id,
      name: skill.name,
      slug: skill.slug,
      requiredLevel: req.requiredLevel,
      requiredLevelLabel: LEVEL_LABELS[req.requiredLevel],
      userLevel: declaredLevel,
      userLevelLabel: LEVEL_LABELS[declaredLevel],
      status,
      percent,
      courseId: course ? course._id : null
    };
  });

  const overallProgress = nodes.length
    ? Math.round(nodes.reduce((sum, n) => sum + n.percent, 0) / nodes.length)
    : 0;

  const recommended = nodes.find((n) => n.status !== 'completed') || null;

  return {
    career: { id: career._id, name: career.name, slug: career.slug, description: career.description },
    nodes,
    overallProgress,
    recommended
  };
}

module.exports = { buildRoadmap, countCourseLessons, LEVEL_LABELS };
