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

// GitHub OAuth redirect: GitHub sends user here with ?code=..., we redirect to the client
router.get('/github/callback', (req, res) => {
  const code = req.query.code;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  if (!code) return res.redirect(`${clientUrl}/login?error=github_no_code`);
  res.redirect(`${clientUrl}/login?github_code=${code}`);
});

module.exports = router;
