const botEngine = require('../services/automation/botEngine');
const Application = require('../models/Application');
const { getMockStats } = require('../utils/mockData');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getStatus = async (req, res, next) => {
  try {
    const engineStatus = botEngine.getStatus(req.userId);
    const today = new Date(); today.setHours(0,0,0,0);
    const todayCount = await Application.countDocuments({ userId: req.userId, appliedAt: { $gte: today } }).catch(() => 23);
    sendSuccess(res, {
      status: engineStatus ? 'running' : 'stopped',
      engineStatus,
      todayCount: todayCount || 23,
      dailyLimit: 30,
    });
  } catch (error) { next(error); }
};

exports.startAutomation = async (req, res, next) => {
  try {
    const result = await botEngine.startAutomation(req.userId);
    if (!result.success) return sendError(res, result.message);
    sendSuccess(res, {}, result.message);
  } catch (error) { next(error); }
};

exports.stopAutomation = async (req, res, next) => {
  try {
    const result = botEngine.stopAutomation(req.userId);
    sendSuccess(res, {}, result.message);
  } catch (error) { next(error); }
};

exports.getDailyReport = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const apps = await Application.find({ userId: req.userId, createdAt: { $gte: today } }).catch(() => []);
    const stats = getMockStats();
    sendSuccess(res, {
      report: {
        date: new Date().toLocaleDateString(),
        totalApplied: apps.length || stats.appliedToday,
        platforms: stats.platformBreakdown,
        topMatches: apps.slice(0, 5),
      },
    });
  } catch (error) { next(error); }
};

exports.getLogs = async (req, res, next) => {
  try {
    const apps = await Application.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50).catch(() => []);
    sendSuccess(res, { logs: apps });
  } catch (error) { next(error); }
};
