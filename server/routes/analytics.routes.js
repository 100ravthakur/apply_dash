const r = require('express').Router();
const c = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
r.use(protect);
r.get('/overview', c.overview);
module.exports = r;
