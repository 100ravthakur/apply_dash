const router = require('express').Router();
const { getPlatforms, connectPlatform, disconnectPlatform, pausePlatform, resumePlatform, getPlatformStatus } = require('../controllers/platformController');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getPlatforms);
router.post('/connect', connectPlatform);
router.delete('/:platform', disconnectPlatform);
router.put('/:platform/pause', pausePlatform);
router.put('/:platform/resume', resumePlatform);
router.get('/:platform/status', getPlatformStatus);

module.exports = router;
