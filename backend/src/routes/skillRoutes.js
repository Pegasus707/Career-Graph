const router = require('express').Router();
const { listSkills, getSkill } = require('../controllers/skillController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', listSkills);
router.get('/:slug', optionalAuth, getSkill);

module.exports = router;
