const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { completeLesson, uncompleteLesson, setSkillStatus, getDashboardProgress } = require('../controllers/progressController');
const { validateLessonProgress, validateSkillStatus } = require('../middleware/validate');

router.get('/', protect, getDashboardProgress);
router.put('/lesson/:lessonId/complete', protect, validateLessonProgress, completeLesson);
router.put('/lesson/:lessonId/uncomplete', protect, validateLessonProgress, uncompleteLesson);
router.put('/skill/:skillId/status', protect, validateSkillStatus, setSkillStatus);

module.exports = router;
