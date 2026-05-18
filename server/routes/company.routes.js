// company.routes.js stub
const express = require('express');
const r = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { success } = require('../utils/apiResponse');
r.use(protect);
r.get('/', (req, res) => success(res, { companies: [] }));
module.exports = r;
