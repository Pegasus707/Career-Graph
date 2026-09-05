const { buildRoadmap } = require('../services/skillGapService');

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
      const masterNode = roadmap.nodes.find((n) => n.skillId.toString() === node.skillId.toString());
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

exports.getRoadmap = async (req, res, next) => {
  try {
    const careerId = req.params.careerId || req.user.targetCareer;
    if (!careerId) return res.status(400).json({ message: 'No target career set. Complete onboarding first.' });

    const rawRoadmap = await buildRoadmap(req.user._id, careerId);
    const roadmap = computeUnlockedPhases(rawRoadmap);

    res.json(roadmap);
  } catch (err) {
    next(err);
  }
};

exports.computeUnlockedPhases = computeUnlockedPhases;

