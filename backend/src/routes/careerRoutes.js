const router = require('express').Router();
const { listCareers, getCareer } = require('../controllers/careerController');

router.get('/', listCareers);
router.get('/:id', getCareer);

module.exports = router;
