// auth.routes.js
const router = require('express').Router();
const c = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many requests' } });

router.post('/register', limiter, c.register);
router.post('/login', limiter, c.login);
router.post('/google', limiter, c.googleAuth);
router.post('/github', limiter, c.githubAuth);
router.post('/refresh', c.refresh);
router.post('/logout', protect, c.logout);
router.get('/me', protect, c.me);
router.put('/change-password', protect, c.changePassword);

module.exports = router;
