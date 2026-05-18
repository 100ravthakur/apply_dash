const router = require('express').Router();
const { getProfile, updateProfile, updatePreferences, getPreferences, addSkill, removeSkill, getProfileStrength } = require('../controllers/profileController');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getProfile);
router.put('/', updateProfile);
router.put('/preferences', updatePreferences);
router.get('/preferences', getPreferences);
router.get('/strength', getProfileStrength);
router.post('/skills', addSkill);
router.delete('/skills/:category/:skill', removeSkill);

module.exports = router;
