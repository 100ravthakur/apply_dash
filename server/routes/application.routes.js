const router = require('express').Router();
const { getApplications, getApplicationById, createManualApplication, updateApplicationStatus, deleteApplication, getStats, generateFollowUp } = require('../controllers/applicationController');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/stats', getStats);
router.get('/', getApplications);
router.post('/', createManualApplication);
router.get('/:id', getApplicationById);
router.put('/:id/status', updateApplicationStatus);
router.delete('/:id', deleteApplication);
router.post('/:id/follow-up', generateFollowUp);

module.exports = router;
