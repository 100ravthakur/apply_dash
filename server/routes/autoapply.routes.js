const r = require('express').Router();
const c = require('../controllers/autoApplyController');
const { protect } = require('../middleware/auth');
r.use(protect);
r.get('/status', c.getStatus);
r.post('/start', c.start);
r.post('/stop', c.stop);
r.get('/history', c.getHistory);
module.exports = r;
