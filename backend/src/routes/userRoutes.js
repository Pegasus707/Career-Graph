const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { updateOnboarding, updateProfile, getProfile, updateTargetCareer } = require('../controllers/userController');

router.get('/profile', protect, getProfile);
router.put('/onboarding', protect, updateOnboarding);
router.put('/profile', protect, updateProfile);
router.put('/target-career', protect, updateTargetCareer);

module.exports = router;
