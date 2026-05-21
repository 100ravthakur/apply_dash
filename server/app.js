const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const mongoose = require('mongoose');
const app = express();

// Trust proxy — required when running behind Render/Vercel/nginx reverse proxy
// Fixes express-rate-limit ERR_ERL_UNEXPECTED_X_FORWARDED_FOR
app.set('trust proxy', 1);

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true, methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use('/api/', rateLimit({ windowMs: 60000, max: 120, message: { success: false, message: 'Rate limit exceeded' } }));

// Health — includes DB status so you can actually diagnose issues
app.get('/health', (_, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({ status: dbState === 1 ? 'ok' : 'degraded', db: dbStatus[dbState] || 'unknown', timestamp: new Date(), version: '3.0.0' });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/resume', require('./routes/resume.routes'));
app.use('/api/auto-apply', require('./routes/autoapply.routes'));
app.use('/api/applications', require('./routes/application.routes'));
app.use('/api/platforms', require('./routes/platform.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));

// 404
app.use('*', (req, res) => res.status(404).json({ success: false, message: `${req.originalUrl} not found` }));
app.use(errorHandler);

module.exports = app;
