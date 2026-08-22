const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { completeLesson, uncompleteLesson, getDashboardProgress } = require('../controllers/progressController');

router.get('/', protect, getDashboardProgress);
router.put('/lesson/:lessonId/complete', protect, completeLesson);
router.put('/lesson/:lessonId/uncomplete', protect, uncompleteLesson);

module.exports = router;
