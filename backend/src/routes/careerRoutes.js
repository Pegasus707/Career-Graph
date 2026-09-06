const router = require('express').Router();
const { listCareers, getCareer, listStreams } = require('../controllers/careerController');

router.get('/', listCareers);
router.get('/streams', listStreams);
router.get('/:id', getCareer);

module.exports = router;
