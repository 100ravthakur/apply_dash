const Application = require('../models/Application');
const Profile = require('../models/Profile');
const engine = require('../services/automation/engine');
const { ok, fail } = require('../utils/index');

exports.getStatus = async (req, res, next) => {
  try {
    const session = engine.getSession(req.userId);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayCount = await Application.countDocuments({ userId: req.userId, createdAt: { $gte: today } }).catch(() => 0);
    const total = await Application.countDocuments({ userId: req.userId }).catch(() => 0);
    ok(res, { session, todayCount, total, dailyLimit: 30, isRunning: !!session });
  } catch (e) { next(e); }
};

exports.start = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) return fail(res, 'Profile not found. Please set up your profile first.');
    if (!profile.resumeText) return fail(res, 'Upload your resume first. AI needs to read it before applying.');

    const limit = profile.preferences?.dailyApplyCount || 30;
    const result = await engine.startSession(req.userId, profile, limit);

    if (result.error) return fail(res, result.error);
    ok(res, {}, `Auto-apply started! Finding and applying to the best jobs matching your resume.`);
  } catch (e) { next(e); }
};

exports.stop = async (req, res, next) => {
  try {
    const stopped = engine.stopSession(req.userId);
    if (!stopped) return fail(res, 'No active auto-apply session');
    ok(res, {}, 'Auto-apply stopping...');
  } catch (e) { next(e); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const apps = await Application.find({ userId: req.userId, isAutoApplied: true })
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));
    const total = await Application.countDocuments({ userId: req.userId, isAutoApplied: true });
    ok(res, { applications: apps, total, page: parseInt(page) });
  } catch (e) { next(e); }
};
