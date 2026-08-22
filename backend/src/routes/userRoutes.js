const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { updateOnboarding, updateProfile, getProfile } = require('../controllers/userController');

router.get('/profile', protect, getProfile);
router.put('/onboarding', protect, updateOnboarding);
router.put('/profile', protect, updateProfile);

module.exports = router;
