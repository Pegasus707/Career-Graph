const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { completeLesson, uncompleteLesson, setSkillStatus, getDashboardProgress } = require('../controllers/progressController');

router.get('/', protect, getDashboardProgress);
router.put('/lesson/:lessonId/complete', protect, completeLesson);
router.put('/lesson/:lessonId/uncomplete', protect, uncompleteLesson);
router.put('/skill/:skillId/status', protect, setSkillStatus);

module.exports = router;
