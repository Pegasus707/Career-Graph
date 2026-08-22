const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getRoadmap } = require('../controllers/roadmapController');

router.get('/', protect, getRoadmap);
router.get('/:careerId', protect, getRoadmap);

module.exports = router;
