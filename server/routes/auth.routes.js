const router = require('express').Router();
const { register, login, logout, getMe, refreshToken, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/refresh-token', refreshToken);
router.put('/change-password', protect, changePassword);

module.exports = router;
