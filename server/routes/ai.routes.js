const router = require('express').Router();
const { matchJobs, generateCoverLetter, interviewPrep, skillGap, chat, salaryInsight } = require('../controllers/aiController');
const { protect } = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.post('/match-jobs', aiLimiter, matchJobs);
router.post('/cover-letter', aiLimiter, generateCoverLetter);
router.post('/interview-prep', aiLimiter, interviewPrep);
router.post('/skill-gap', aiLimiter, skillGap);
router.post('/chat', aiLimiter, chat);
router.post('/salary-insight', salaryInsight);

module.exports = router;
