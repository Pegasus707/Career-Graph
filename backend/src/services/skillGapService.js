const mongoose = require('mongoose');
const Career = require('../models/Career');
const Course = require('../models/Course');
const Level = require('../models/Level');
const CourseProgress = require('../models/CourseProgress');
const UserProfile = require('../models/UserProfile');

const LEVEL_LABELS = ['None', 'Beginner', 'Know a little basics', 'Know everything', 'Know everything'];

async function countCourseLessons(courseId) {
  const levels = await Level.find({ course: courseId });
  let total = 0;
  levels.forEach((level) => {
    level.modules.forEach((mod) => { total += mod.lessons.length; });
  });
  return total;
}

async function buildRoadmap(userId, careerId) {
  let career = null;

  if (careerId) {
    const isObjectId = mongoose.Types.ObjectId.isValid(careerId);
    if (isObjectId) {
      career = await Career.findById(careerId).populate({
        path: 'requiredSkills.skill',
        populate: { path: 'prerequisites', select: '_id name slug' }
      });
    } else {
      career = await Career.findOne({ slug: careerId }).populate({
        path: 'requiredSkills.skill',
        populate: { path: 'prerequisites', select: '_id name slug' }
      });
    }
  }

  // Graceful fallback if career ID was from a previous seed or invalid:
  if (!career) {
    career = await Career.findOne().populate({
      path: 'requiredSkills.skill',
      populate: { path: 'prerequisites', select: '_id name slug' }
    });
  }

  if (!career) {
    const err = new Error('Career not found');
    err.statusCode = 404;
    throw err;
  }

  const profile = await UserProfile.findOne({ user: userId });
  const declaredSkills = profile ? profile.skills : [];

  const validRequirements = (career.requiredSkills || []).filter((r) => r && r.skill != null);
  const totalReqs = validRequirements.length;

  const skillIds = validRequirements.map((r) => r.skill._id);
  const skillIdStrings = validRequirements
    .map((r) => r.skillId || (r.skill && (r.skill.skillId || r.skill.slug)))
    .filter(Boolean);

  const courses = await Course.find({ skill: { $in: skillIds } });
  const courseIds = courses.map((c) => c._id);

  // Skill-Centric Progress Tracking: match by course, skill ObjectId, or universal skillId string
  const courseProgressDocs = await CourseProgress.find({
    user: userId,
    $or: [
      { course: { $in: courseIds } },
      { skill: { $in: skillIds } },
      { skillId: { $in: skillIdStrings } }
    ]
  });

  const rawNodes = validRequirements.map((req, index) => {
    const skill = req.skill;
    const userSkill = declaredSkills.find(
      (s) => s.skill && (s.skill._id ? s.skill._id.toString() : s.skill.toString()) === skill._id.toString()
    );
    const declaredLevel = userSkill ? userSkill.level : 0;

    const course = courses.find((c) => c.skill.toString() === skill._id.toString());
    const universalId = skill.skillId || skill.slug;

    // Resolve progress cross-track by course, skill ObjectId, or universal skillId
    const progressDoc = courseProgressDocs.find(
      (p) =>
        (course && p.course && p.course.toString() === course._id.toString()) ||
        (p.skill && p.skill.toString() === skill._id.toString()) ||
        (p.skillId && (p.skillId === universalId || p.skillId === skill.slug))
    );
    const courseProgress = progressDoc ? progressDoc.percent : 0;

    // A skill is only fully completed if all lessons are finished (100%) or user declared 'Know everything' (level >= 3)
    const isCompleted = courseProgress === 100 || declaredLevel >= 3;

    let status = 'not_started';
    let percent = 0;

    if (isCompleted) {
      status = 'completed';
      percent = 100;
    } else if (declaredLevel > 0 || courseProgress > 0) {
      status = 'in_progress';
      percent = courseProgress; // Starts at 0% and tracks genuine lesson completion
    }

    // Determine Phase from Career requirement schema, fallback to index ratio
    const ratio = index / Math.max(1, totalReqs);
    const phaseId = req.phase || (ratio < 0.35 ? 'foundations' : ratio < 0.70 ? 'core' : 'advanced');
    let phaseTitle = 'Phase 1: Foundations';
    let phaseDesc = 'Essential prerequisites & fundamental skills';

    if (phaseId === 'core') {
      phaseTitle = 'Phase 2: Core Stack';
      phaseDesc = 'Primary development stack & daily tools';
    } else if (phaseId === 'advanced') {
      phaseTitle = 'Phase 3: Advanced & Ecosystem';
      phaseDesc = 'Architecture, optimization & production tooling';
    }

    return {
      skillId: skill._id,
      explicitSkillId: skill.skillId || skill.slug,
      name: skill.name,
      slug: skill.slug,
      skillObj: skill,
      requiredLevel: req.requiredLevel || 1,
      requiredLevelLabel: LEVEL_LABELS[req.requiredLevel] || 'Beginner',
      userLevel: declaredLevel || 0,
      userLevelLabel: LEVEL_LABELS[declaredLevel] || 'None',
      status,
      percent,
      courseId: course ? course._id : null,
      phaseId,
      phaseTitle,
      orderIndex: index
    };
  });

  // Evaluate prerequisites & lock status
  const nodes = rawNodes.map((node) => {
    const explicitPrereqs = (node.skillObj.prerequisites || []).map((p) => (p._id || p).toString());

    let unmet = [];

    if (explicitPrereqs.length > 0) {
      unmet = rawNodes.filter((n) => explicitPrereqs.includes(n.skillId.toString()) && n.status !== 'completed');
    } else if (node.phaseId === 'core') {
      const phase1Nodes = rawNodes.filter((n) => n.phaseId === 'foundations');
      const hasCompletedFoundation = phase1Nodes.some((n) => n.status === 'completed');
      if (!hasCompletedFoundation && phase1Nodes.length > 0) {
        unmet = phase1Nodes.filter((n) => n.status !== 'completed');
      }
    } else if (node.phaseId === 'advanced') {
      const phase2Nodes = rawNodes.filter((n) => n.phaseId === 'core');
      const hasCompletedCore = phase2Nodes.some((n) => n.status === 'completed');
      if (!hasCompletedCore && phase2Nodes.length > 0) {
        unmet = phase2Nodes.filter((n) => n.status !== 'completed');
      }
    }

    const isLocked = unmet.length > 0 && node.status !== 'completed';
    const lockedReason = isLocked
      ? `Requires completing: ${unmet.map((u) => u.name).slice(0, 2).join(', ')}`
      : '';

    // Remove internal reference
    const { skillObj, ...cleanNode } = node;

    return {
      ...cleanNode,
      isLocked,
      prerequisites: (node.skillObj?.prerequisites || []).map((p) => ({
        skillId: (p._id || p).toString(),
        name: p.name,
        slug: p.slug
      })),
      unmetPrerequisites: unmet.map((u) => ({ skillId: u.skillId, name: u.name, slug: u.slug })),
      lockedReason
    };
  });

  // Group nodes into phases
  const phaseMap = {
    foundations: {
      id: 'foundations',
      title: 'Phase 1: Foundations',
      description: 'Essential prerequisites & fundamental concepts',
      nodes: []
    },
    core: {
      id: 'core',
      title: 'Phase 2: Core Stack',
      description: 'Primary technologies & framework proficiency',
      nodes: []
    },
    advanced: {
      id: 'advanced',
      title: 'Phase 3: Advanced & Ecosystem',
      description: 'Architecture, testing, and production tooling',
      nodes: []
    }
  };

  nodes.forEach((n) => {
    if (phaseMap[n.phaseId]) {
      phaseMap[n.phaseId].nodes.push(n);
    } else {
      phaseMap.foundations.nodes.push(n);
    }
  });

  const phases = Object.values(phaseMap).filter((p) => p.nodes.length > 0).map((p) => {
    const completedCount = p.nodes.filter((n) => n.status === 'completed').length;
    const pct = Math.round((completedCount / p.nodes.length) * 100);
    return { ...p, completedCount, totalCount: p.nodes.length, percent: pct };
  });

  const overallProgress = nodes.length
    ? Math.round(nodes.reduce((sum, n) => sum + n.percent, 0) / nodes.length)
    : 0;

  const recommended = nodes.find((n) => !n.isLocked && n.status !== 'completed') || null;

  return {
    career: { id: career._id, name: career.name, slug: career.slug, description: career.description },
    nodes,
    phases,
    overallProgress,
    recommended
  };
}

/**
 * Dynamically computes phase locks by verifying that all skills/prerequisites
 * from the preceding phase are marked complete.
 */
function computeUnlockedPhases(roadmap) {
  if (!roadmap || !roadmap.phases || !roadmap.nodes) return roadmap;

  const phases = roadmap.phases;
  let precedingPhaseComplete = true;
  let precedingPhaseTitle = '';

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];

    if (i === 0) {
      // Phase 1 (Foundations) is always unlocked at the phase level
      phase.isLocked = false;
      phase.unlocked = true;
      phase.lockedReason = '';
    } else {
      const prevPhase = phases[i - 1];
      const incompletePrevNodes = prevPhase.nodes.filter((n) => n.status !== 'completed');

      if (!precedingPhaseComplete || incompletePrevNodes.length > 0) {
        phase.isLocked = true;
        phase.unlocked = false;
        phase.lockedReason = `Complete all skills in ${prevPhase.title} to unlock this phase (${incompletePrevNodes.length} remaining)`;
        precedingPhaseComplete = false;
        precedingPhaseTitle = prevPhase.title;
      } else {
        phase.isLocked = false;
        phase.unlocked = true;
        phase.lockedReason = '';
      }
    }

    // Apply phase lock to each skill node within this phase
    phase.nodes.forEach((node) => {
      if (phase.isLocked) {
        node.isLocked = true;
        node.lockedReason = `Locked: Complete all skills in ${precedingPhaseTitle || phases[i - 1]?.title} first`;
      } else {
        // Phase is unlocked, check individual prerequisite skills
        const unmetExplicit = node.unmetPrerequisites || [];
        if (unmetExplicit.length > 0 && node.status !== 'completed') {
          node.isLocked = true;
          node.lockedReason = `Requires completing: ${unmetExplicit.map((u) => u.name).slice(0, 2).join(', ')}`;
        } else {
          node.isLocked = false;
          node.lockedReason = '';
        }
      }

      // Sync with master list of nodes
      const masterNode = roadmap.nodes.find(
        (n) => n.skillId && node.skillId && n.skillId.toString() === node.skillId.toString()
      );
      if (masterNode) {
        masterNode.isLocked = node.isLocked;
        masterNode.lockedReason = node.lockedReason;
      }
    });

    // Recompute phase statistics
    phase.completedCount = phase.nodes.filter((n) => n.status === 'completed').length;
    phase.totalCount = phase.nodes.length;
    phase.percent = phase.totalCount ? Math.round((phase.completedCount / phase.totalCount) * 100) : 0;
  }

  // Next recommended skill is the first unlocked node not yet completed
  roadmap.recommended = roadmap.nodes.find((n) => !n.isLocked && n.status !== 'completed') || null;

  return roadmap;
}

module.exports = { buildRoadmap, countCourseLessons, computeUnlockedPhases, LEVEL_LABELS };
