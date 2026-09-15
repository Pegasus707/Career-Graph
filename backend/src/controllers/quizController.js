const mongoose = require('mongoose');
const Skill = require('../models/Skill');
const SkillQuiz = require('../models/SkillQuiz');
const Course = require('../models/Course');
const Level = require('../models/Level');
const CourseProgress = require('../models/CourseProgress');
const LessonProgress = require('../models/LessonProgress');
const UserProfile = require('../models/UserProfile');
const { buildRoadmap, computeUnlockedPhases } = require('../services/skillGapService');

/**
 * Fetch 3-question validation quiz for a skill.
 * Sanitizes payload: strictly strips correctIndex and explanations so answer keys are not exposed.
 */
exports.getSkillQuiz = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    const userId = req.user._id;

    // Universal skill lookup
    const isObjectId = mongoose.Types.ObjectId.isValid(skillId);
    const skill = await Skill.findOne(
      isObjectId
        ? { $or: [{ _id: skillId }, { skillId }, { slug: skillId }] }
        : { $or: [{ skillId }, { slug: skillId }] }
    );

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Verify prerequisite locks: cannot take quiz for a locked skill
    if (req.user.targetCareer) {
      const rawRoadmap = await buildRoadmap(userId, req.user.targetCareer);
      const roadmap = computeUnlockedPhases(rawRoadmap);
      const node = (roadmap.nodes || []).find(
        (n) => n.skillId.toString() === skill._id.toString() || n.slug === skill.slug
      );
      if (node && node.isLocked) {
        return res.status(400).json({
          message: node.lockedReason || 'This skill is currently locked. Complete preceding prerequisites before taking the verification quiz.'
        });
      }
    }

    const quiz = await SkillQuiz.findOne({
      $or: [{ skill: skill._id }, { skillId: skill.slug }, { skillId: skill.skillId }]
    });

    if (!quiz || !quiz.questions || quiz.questions.length < 3) {
      return res.status(404).json({ message: 'Quiz validation questions not available for this skill' });
    }

    // Sanitize questions: strip correctIndex and explanation to prevent client inspection
    const sanitizedQuestions = quiz.questions.slice(0, 3).map((q, idx) => ({
      id: idx,
      question: q.question,
      options: q.options
    }));

    res.json({
      skillId: skill.slug,
      skillName: skill.name,
      title: quiz.title || `${skill.name} Skill Verification Quiz`,
      totalQuestions: sanitizedQuestions.length,
      passingScore: 2,
      questions: sanitizedQuestions
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Submit and grade answers server-side.
 * Passing criterion: at least 2 out of 3 correct (>= 66.7%).
 * On pass: awards 'verified' status, marks 100% completion, and elevates skill profile.
 */
exports.submitSkillQuiz = async (req, res, next) => {
  try {
    const { skillId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(answers) || answers.length < 3) {
      return res.status(400).json({ message: 'Answers must be provided as an array of 3 selections' });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(skillId);
    const skill = await Skill.findOne(
      isObjectId
        ? { $or: [{ _id: skillId }, { skillId }, { slug: skillId }] }
        : { $or: [{ skillId }, { slug: skillId }] }
    );

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const quiz = await SkillQuiz.findOne({
      $or: [{ skill: skill._id }, { skillId: skill.slug }, { skillId: skill.skillId }]
    });

    if (!quiz || !quiz.questions || quiz.questions.length < 3) {
      return res.status(404).json({ message: 'Quiz not found for this skill' });
    }

    // Grade server-side
    const questionsToGrade = quiz.questions.slice(0, 3);
    let correctCount = 0;
    const review = [];

    questionsToGrade.forEach((q, idx) => {
      const selectedOptionIndex = answers[idx];
      const isCorrect = selectedOptionIndex === q.correctIndex;
      if (isCorrect) correctCount += 1;

      review.push({
        questionIndex: idx,
        question: q.question,
        selectedOption: q.options[selectedOptionIndex] || 'No answer selected',
        correctOption: q.options[q.correctIndex],
        isCorrect,
        explanation: q.explanation || ''
      });
    });

    const passed = correctCount >= 2;

    if (passed) {
      // 1. Find course for this skill and mark lessons as complete
      const course = await Course.findOne({ skill: skill._id });
      if (course) {
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

        for (const l of allLessons) {
          await LessonProgress.findOneAndUpdate(
            { user: userId, lesson: l.lessonId },
            {
              level: l.levelId,
              course: course._id,
              skill: skill._id,
              skillId: skillIdStr,
              completedAt: new Date()
            },
            { upsert: true }
          );
        }

        await CourseProgress.findOneAndUpdate(
          { user: userId, course: course._id },
          {
            percent: 100,
            completedLessonCount: allLessons.length,
            totalLessonCount: allLessons.length,
            verified: true,
            quizScore: correctCount,
            verifiedAt: new Date(),
            skill: skill._id,
            skillId: skillIdStr
          },
          { upsert: true }
        );
      }

      // 2. Persist verified status and level 4 in UserProfile
      let profile = await UserProfile.findOne({ user: userId });
      if (!profile) profile = new UserProfile({ user: userId, skills: [] });

      const existingIndex = profile.skills.findIndex(
        (s) => s.skill && s.skill.toString() === skill._id.toString()
      );

      if (existingIndex >= 0) {
        profile.skills[existingIndex].level = Math.max(profile.skills[existingIndex].level, 3);
        profile.skills[existingIndex].verified = true;
      } else {
        profile.skills.push({ skill: skill._id, level: 3, verified: true });
      }
      await profile.save();

      return res.json({
        passed: true,
        score: correctCount,
        total: questionsToGrade.length,
        verified: true,
        message: `Proof of Skill verified! You scored ${correctCount}/${questionsToGrade.length} and earned the Verified Badge.`,
        review
      });
    }

    // Failed (scored 0 or 1 out of 3)
    return res.json({
      passed: false,
      score: correctCount,
      total: questionsToGrade.length,
      verified: false,
      message: `You scored ${correctCount}/${questionsToGrade.length}. You need at least 2 correct answers to verify this skill. Review the questions below and try again!`,
      review
    });
  } catch (err) {
    next(err);
  }
};
