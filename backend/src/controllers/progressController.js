const mongoose = require('mongoose');
const Level = require('../models/Level');
const Course = require('../models/Course');
const Skill = require('../models/Skill');
const CourseProgress = require('../models/CourseProgress');
const LessonProgress = require('../models/LessonProgress');
const UserProfile = require('../models/UserProfile');
const { buildRoadmap } = require('../services/skillGapService');
const { computeUnlockedPhases } = require('./roadmapController');

async function recalculateCourseProgress(userId, courseId) {
  const course = await Course.findById(courseId).populate('skill');
  const skillObjectId = course && course.skill ? course.skill._id : null;
  const skillIdStr = course && course.skill ? (course.skill.skillId || course.skill.slug) : null;

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
    {
      percent,
      completedLessonCount: completedCount,
      totalLessonCount: total,
      skill: skillObjectId,
      skillId: skillIdStr
    },
    { upsert: true }
  );

  // If complete, persist user's universal skill proficiency to UserProfile
  if (percent === 100 && skillObjectId) {
    let profile = await UserProfile.findOne({ user: userId });
    if (!profile) profile = new UserProfile({ user: userId, skills: [] });
    const existingIndex = profile.skills.findIndex(
      (s) => s.skill && s.skill.toString() === skillObjectId.toString()
    );
    if (existingIndex >= 0) {
      profile.skills[existingIndex].level = Math.max(profile.skills[existingIndex].level, 4);
    } else {
      profile.skills.push({ skill: skillObjectId, level: 4 });
    }
    await profile.save();
  }

  return percent;
}

exports.completeLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const { levelId, courseId } = req.body;
    if (!levelId || !courseId) {
      return res.status(400).json({ message: 'levelId and courseId are required' });
    }

    const course = await Course.findById(courseId).populate('skill');
    const skillObjectId = course && course.skill ? course.skill._id : null;
    const skillIdStr = course && course.skill ? (course.skill.skillId || course.skill.slug) : null;

    await LessonProgress.findOneAndUpdate(
      { user: req.user._id, lesson: lessonId },
      {
        level: levelId,
        course: courseId,
        skill: skillObjectId,
        skillId: skillIdStr,
        completedAt: new Date()
      },
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

    // Universal skill lookup by ObjectId, skillId, or slug
    const isObjectId = mongoose.Types.ObjectId.isValid(skillId);
    const skill = await Skill.findOne(
      isObjectId
        ? { $or: [{ _id: skillId }, { skillId }, { slug: skillId }] }
        : { $or: [{ skillId }, { slug: skillId }] }
    );
    if (!skill) return res.status(404).json({ message: 'Skill not found' });

    // Validate phase and prerequisite locks if attempting to advance
    if (targetStatus !== 'not_started' && req.user.targetCareer) {
      const rawRoadmap = await buildRoadmap(userId, req.user.targetCareer);
      const roadmap = computeUnlockedPhases(rawRoadmap);
      const skillNode = (roadmap.nodes || []).find(
        (n) => n.skillId.toString() === skill._id.toString() || n.slug === skill.slug
      );
      if (skillNode && skillNode.isLocked) {
        return res.status(400).json({
          message: skillNode.lockedReason || 'This skill is locked. Complete prerequisite skills from the preceding phase first!'
        });
      }
    }

    const course = await Course.findOne({ skill: skill._id });
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

    const skillIdStr = skill.skillId || skill.slug;

    if (targetStatus === 'completed') {
      const docs = allLessons.map((l) => ({
        user: userId,
        lesson: l.lessonId,
        level: l.levelId,
        course: course._id,
        skill: skill._id,
        skillId: skillIdStr,
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
        {
          percent: 100,
          completedLessonCount: allLessons.length,
          totalLessonCount: allLessons.length,
          skill: skill._id,
          skillId: skillIdStr
        },
        { upsert: true }
      );

      // Persist to user profile for cross-track recognition across all careers
      let profile = await UserProfile.findOne({ user: userId });
      if (!profile) profile = new UserProfile({ user: userId, skills: [] });
      const existingIndex = profile.skills.findIndex(
        (s) => s.skill && s.skill.toString() === skill._id.toString()
      );
      if (existingIndex >= 0) {
        profile.skills[existingIndex].level = Math.max(profile.skills[existingIndex].level, 4);
      } else {
        profile.skills.push({ skill: skill._id, level: 4 });
      }
      await profile.save();
    } else if (targetStatus === 'not_started') {
      const lessonIds = allLessons.map((l) => l.lessonId);
      await LessonProgress.deleteMany({ user: userId, lesson: { $in: lessonIds } });
      await CourseProgress.findOneAndUpdate(
        { user: userId, course: course._id },
        {
          percent: 0,
          completedLessonCount: 0,
          totalLessonCount: allLessons.length,
          skill: skill._id,
          skillId: skillIdStr
        },
        { upsert: true }
      );
      await UserProfile.updateOne(
        { user: userId, 'skills.skill': skill._id },
        { $set: { 'skills.$.level': 0 } }
      );
    } else if (targetStatus === 'in_progress') {
      const lessonIds = allLessons.map((l) => l.lessonId);
      await LessonProgress.deleteMany({ user: userId, lesson: { $in: lessonIds } });
      await CourseProgress.findOneAndUpdate(
        { user: userId, course: course._id },
        {
          percent: 0,
          completedLessonCount: 0,
          totalLessonCount: allLessons.length,
          skill: skill._id,
          skillId: skillIdStr
        },
        { upsert: true }
      );
      let profile = await UserProfile.findOne({ user: userId });
      if (!profile) profile = new UserProfile({ user: userId, skills: [] });
      const existingIndex = profile.skills.findIndex(
        (s) => s.skill && s.skill.toString() === skill._id.toString()
      );
      if (existingIndex >= 0) {
        if (profile.skills[existingIndex].level === 0) profile.skills[existingIndex].level = 1;
      } else {
        profile.skills.push({ skill: skill._id, level: 1 });
      }
      await profile.save();
    }

    const updatedRawRoadmap = await buildRoadmap(userId, req.user.targetCareer);
    const updatedRoadmap = computeUnlockedPhases(updatedRawRoadmap);
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
    const rawRoadmap = await buildRoadmap(userId, req.user.targetCareer);
    const roadmap = computeUnlockedPhases(rawRoadmap);
    res.json(roadmap);
  } catch (err) {
    next(err);
  }
};

