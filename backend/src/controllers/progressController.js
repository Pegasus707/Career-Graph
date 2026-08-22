const Level = require('../models/Level');
const CourseProgress = require('../models/CourseProgress');
const LessonProgress = require('../models/LessonProgress');
const { buildRoadmap } = require('../services/skillGapService');

// Recomputes and stores CourseProgress for a given user + course after a lesson toggle.
async function recalculateCourseProgress(userId, courseId) {
  const levels = await Level.find({ course: courseId });
  let total = 0;
  const allLessonIds = [];
  levels.forEach((level) => {
    level.modules.forEach((mod) => {
      mod.lessons.forEach((lesson) => {
        total += 1;
        allLessonIds.push(lesson._id.toString());
      });
    });
  });

  const completed = await LessonProgress.find({ user: userId, course: courseId });
  const completedCount = completed.filter((c) => allLessonIds.includes(c.lesson.toString())).length;
  const percent = total ? Math.round((completedCount / total) * 100) : 0;

  await CourseProgress.findOneAndUpdate(
    { user: userId, course: courseId },
    { percent, completedLessonCount: completedCount, totalLessonCount: total },
    { upsert: true }
  );

  return percent;
}

exports.completeLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { levelId, courseId } = req.body;
    if (!levelId || !courseId) {
      return res.status(400).json({ message: 'levelId and courseId are required' });
    }

    await LessonProgress.findOneAndUpdate(
      { user: req.user._id, lesson: lessonId },
      { level: levelId, course: courseId, completedAt: new Date() },
      { upsert: true }
    );

    const percent = await recalculateCourseProgress(req.user._id, courseId);
    res.json({ completed: true, courseProgress: percent });
  } catch (err) {
    next(err);
  }
};

exports.uncompleteLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ message: 'courseId is required' });

    await LessonProgress.deleteOne({ user: req.user._id, lesson: lessonId });
    const percent = await recalculateCourseProgress(req.user._id, courseId);
    res.json({ completed: false, courseProgress: percent });
  } catch (err) {
    next(err);
  }
};

exports.getDashboardProgress = async (req, res, next) => {
  try {
    if (!req.user.targetCareer) return res.json({ overallProgress: 0, nodes: [], career: null, recommended: null });
    const roadmap = await buildRoadmap(req.user._id, req.user.targetCareer);
    res.json(roadmap);
  } catch (err) {
    next(err);
  }
};
