const router = require('express').Router();
const { getOverview, getWeekly, getPlatformBreakdown } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/overview', getOverview);
router.get('/weekly', getWeekly);
router.get('/platforms', getPlatformBreakdown);

module.exports = router;
