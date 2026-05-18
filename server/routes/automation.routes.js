const router = require('express').Router();
const { getStatus, startAutomation, stopAutomation, getDailyReport, getLogs } = require('../controllers/automationController');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/status', getStatus);
router.post('/start', startAutomation);
router.post('/stop', stopAutomation);
router.get('/report', getDailyReport);
router.get('/logs', getLogs);

module.exports = router;
