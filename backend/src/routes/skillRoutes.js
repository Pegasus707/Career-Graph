const router = require('express').Router();
const { listSkills, getSkill } = require('../controllers/skillController');
const { getSkillQuiz, submitSkillQuiz } = require('../controllers/quizController');
const { optionalAuth, protect } = require('../middleware/authMiddleware');

router.get('/', listSkills);
router.get('/:skillId/quiz', protect, getSkillQuiz);
router.post('/:skillId/quiz/submit', protect, submitSkillQuiz);
router.get('/:slug', optionalAuth, getSkill);

module.exports = router;
