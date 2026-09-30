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

    const isVerified = !!((progressDoc && progressDoc.verified) || (userSkill && userSkill.verified));
    const quizScore = (progressDoc && progressDoc.quizScore) || 0;

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
      verified: isVerified,
      quizScore,
      courseId: course ? course._id : null,
      phaseId,
      phaseTitle,
      orderIndex: index
    };
  });

  // Evaluate prerequisites & lock status under Option B: Strict Verified Badge Enforcement
  const nodes = rawNodes.map((node) => {
    const explicitPrereqIds = (node.skillObj.prerequisites || []).map((p) => (p._id ? p._id.toString() : p.toString()));
    const explicitPrereqSlugs = (node.skillObj.prerequisites || []).map((p) => (p.slug ? p.slug : p.toString()));

    // Find all prerequisite nodes that exist within the current roadmap
    const prereqNodesInRoadmap = rawNodes.filter((n) =>
      explicitPrereqIds.includes(n.skillId.toString()) ||
      (n.slug && explicitPrereqSlugs.includes(n.slug))
    );

    let unmet = [];

    if (prereqNodesInRoadmap.length > 0) {
      // STRICT: A prerequisite is ONLY satisfied if the user has earned the Verified Badge (verified === true)
      unmet = prereqNodesInRoadmap.filter((n) => !n.verified);
    } else if (node.phaseId === 'core') {
      // For Phase 2 skills with no explicit prerequisites in this track,
      // require foundational Phase 1 skills to have earned Verified Badges
      const phase1Nodes = rawNodes.filter((n) => n.phaseId === 'foundations');
      const unverifiedFoundations = phase1Nodes.filter((n) => !n.verified);
      if (unverifiedFoundations.length > 0) {
        unmet = unverifiedFoundations;
      }
    } else if (node.phaseId === 'advanced') {
      // For Phase 3 skills with no explicit prerequisites in this track,
      // require core Phase 2 skills to have earned Verified Badges
      const phase2Nodes = rawNodes.filter((n) => n.phaseId === 'core');
      const unverifiedCore = phase2Nodes.filter((n) => !n.verified);
      if (unverifiedCore.length > 0) {
        unmet = unverifiedCore;
      }
    }

    const isLocked = unmet.length > 0 && !node.verified;
    const lockedReason = isLocked
      ? `Requires Verified Badge in: ${unmet.map((u) => u.name).join(', ')}`
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
 * Dynamically computes phase locks under Strict Verified Badge Enforcement:
 * 1. Phase 1 (Foundations) is always unlocked at the phase level.
 * 2. Phase 2 (or any subsequent phase) is unlocked / accessible if at least one of its
 *    skills has all prerequisites verified, OR if the preceding phase is 100% verified.
 * 3. Individual skill nodes remain STRICTLY locked if any of their prerequisites
 *    lack the Verified Badge.
 *
 * Example (AI/ML Engineer):
 * Earning Verified Badges in Python & SQL unlocks Phase 2, but ONLY Data Analysis unlocks.
 * Machine Learning and Deep Learning remain locked because their prerequisites
 * (Math & Statistics, Machine Learning) lack Verified Badges.
 */
function computeUnlockedPhases(roadmap) {
  if (!roadmap || !roadmap.phases || !roadmap.nodes) return roadmap;

  const phases = roadmap.phases;

  for (let i = 0; i < phases.length; i++) {
    const phase = phases[i];

    if (i === 0) {
      // Phase 1 (Foundations) is always unlocked at the phase level
      phase.isLocked = false;
      phase.unlocked = true;
      phase.lockedReason = '';
    } else {
      const prevPhase = phases[i - 1];
      const unverifiedPrevNodes = prevPhase.nodes.filter((n) => !n.verified);
      const isPrecedingPhaseFullyVerified = unverifiedPrevNodes.length === 0;

      // Has any skill in this phase had all its prerequisite badges earned?
      const hasAnyUnlockedSkill = phase.nodes.some((n) => !n.isLocked || n.verified);

      if (!hasAnyUnlockedSkill && !isPrecedingPhaseFullyVerified) {
        // Entire phase is locked because no skills in this phase have prerequisites verified
        phase.isLocked = true;
        phase.unlocked = false;
        phase.lockedReason = `Earn Verified Badges in ${prevPhase.title} to unlock this phase (${unverifiedPrevNodes.length} remaining)`;
      } else {
        // Phase is unlocked and accessible!
        phase.isLocked = false;
        phase.unlocked = true;
        phase.lockedReason = '';
      }
    }

    // Apply strict prerequisite locking to each skill node within this phase
    phase.nodes.forEach((node) => {
      if (phase.isLocked) {
        node.isLocked = true;
        node.lockedReason = node.lockedReason || `Locked: Earn Verified Badges in ${phases[i - 1]?.title} first`;
      } else {
        // Phase is unlocked: check if this individual skill has any unverified prerequisites
        if (node.unmetPrerequisites && node.unmetPrerequisites.length > 0 && !node.verified) {
          node.isLocked = true;
          node.lockedReason = `Requires Verified Badge in: ${node.unmetPrerequisites.map((u) => u.name).join(', ')}`;
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
        masterNode.unmetPrerequisites = node.unmetPrerequisites;
      }
    });

    // Recompute phase statistics
    phase.completedCount = phase.nodes.filter((n) => n.status === 'completed' || n.verified).length;
    phase.verifiedCount = phase.nodes.filter((n) => n.verified).length;
    phase.totalCount = phase.nodes.length;
    phase.percent = phase.totalCount ? Math.round((phase.completedCount / phase.totalCount) * 100) : 0;
  }

  // Next recommended skill is the first unlocked node not yet completed or verified
  roadmap.recommended = roadmap.nodes.find((n) => !n.isLocked && n.status !== 'completed' && !n.verified) || null;

  return roadmap;
}

module.exports = { buildRoadmap, countCourseLessons, computeUnlockedPhases, LEVEL_LABELS };
