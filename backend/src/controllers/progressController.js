const Level = require('../models/Level');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const LessonProgress = require('../models/LessonProgress');
const UserProfile = require('../models/UserProfile');
const { buildRoadmap } = require('../services/skillGapService');

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

exports.setSkillStatus = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    const { targetStatus } = req.body;
    const userId = req.user._id;

    // Validate locked state if attempting to unlock/advance
    if (targetStatus !== 'not_started' && req.user.targetCareer) {
      const roadmap = await buildRoadmap(userId, req.user.targetCareer);
      const skillNode = (roadmap.nodes || []).find((n) => n.skillId.toString() === skillId.toString());
      if (skillNode && skillNode.isLocked) {
        return res.status(400).json({
          message: skillNode.lockedReason || 'This skill is locked. Complete prerequisite skills first!'
        });
      }
    }

    const course = await Course.findOne({ skill: skillId });
    if (!course) return res.status(404).json({ message: 'Course not found for this skill' });

    const levels = await Level.find({ course: course._id });
    const allLessons = [];
    levels.forEach((lvl) => {
      lvl.modules.forEach((mod) => {
        mod.lessons.forEach((l) => {
          allLessons.push({ lessonId: l._id, levelId: lvl._id });
        });
      });
    });

    if (targetStatus === 'completed') {
      const docs = allLessons.map((l) => ({
        user: userId,
        lesson: l.lessonId,
        level: l.levelId,
        course: course._id,
        completedAt: new Date()
      }));
      for (const d of docs) {
        await LessonProgress.findOneAndUpdate(
          { user: userId, lesson: d.lesson },
          d,
          { upsert: true }
        );
      }
      await CourseProgress.findOneAndUpdate(
        { user: userId, course: course._id },
        { percent: 100, completedLessonCount: allLessons.length, totalLessonCount: allLessons.length },
        { upsert: true }
      );
    } else if (targetStatus === 'not_started') {
      const lessonIds = allLessons.map((l) => l.lessonId);
      await LessonProgress.deleteMany({ user: userId, lesson: { $in: lessonIds } });
      await CourseProgress.findOneAndUpdate(
        { user: userId, course: course._id },
        { percent: 0, completedLessonCount: 0, totalLessonCount: allLessons.length },
        { upsert: true }
      );
      await UserProfile.updateOne(
        { user: userId, 'skills.skill': skillId },
        { $set: { 'skills.$.level': 0 } }
      );
    } else if (targetStatus === 'in_progress') {
      const lessonIds = allLessons.map((l) => l.lessonId);
      await LessonProgress.deleteMany({ user: userId, lesson: { $in: lessonIds } });
      if (allLessons.length > 0) {
        await LessonProgress.create({
          user: userId,
          lesson: allLessons[0].lessonId,
          level: allLessons[0].levelId,
          course: course._id,
          completedAt: new Date()
        });
      }
      await recalculateCourseProgress(userId, course._id);
    }

    const updatedRoadmap = await buildRoadmap(userId, req.user.targetCareer);
    res.json(updatedRoadmap);
  } catch (err) {
    next(err);
  }
};

exports.getDashboardProgress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    if (!req.user.targetCareer) {
      return res.json({ career: null, nodes: [], overallProgress: 0 });
    }
    const roadmap = await buildRoadmap(userId, req.user.targetCareer);
    res.json(roadmap);
  } catch (err) {
    next(err);
  }
};
