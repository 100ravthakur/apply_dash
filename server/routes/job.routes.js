const router = require('express').Router();
const { getJobQueue, getAllJobs, getJobById, getTrendingJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/queue', getJobQueue);
router.get('/trending', getTrendingJobs);
router.get('/', getAllJobs);
router.get('/:id', getJobById);

module.exports = router;
