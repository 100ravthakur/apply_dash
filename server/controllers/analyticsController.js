const Application = require('../models/Application');
const { getMockStats } = require('../utils/mockData');
const { sendSuccess } = require('../utils/apiResponse');

exports.getOverview = async (req, res, next) => {
  try {
    const [total, byStatus] = await Promise.all([
      Application.countDocuments({ userId: req.userId }).catch(() => 0),
      Application.aggregate([
        { $match: { userId: req.userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]).catch(() => []),
    ]);
    const stats = getMockStats();
    const statusMap = {};
    byStatus.forEach(s => { statusMap[s._id] = s.count; });
    sendSuccess(res, {
      overview: {
        totalApplications: total || stats.totalApplications,
        appliedToday: stats.appliedToday,
        avgMatchScore: stats.avgMatchScore,
        responseRate: stats.successRate,
        interviews: statusMap.interview || stats.interviews,
        offers: statusMap.offered || stats.offers,
        platformBreakdown: stats.platformBreakdown,
        weeklyData: stats.weeklyData,
        skillsInDemand: [
          { skill: 'System Design', demand: 91 },
          { skill: 'Go / Golang', demand: 87 },
          { skill: 'AWS / GCP', demand: 82 },
          { skill: 'Kubernetes', demand: 74 },
          { skill: 'PostgreSQL', demand: 65 },
          { skill: 'React', demand: 58 },
        ],
      },
    });
  } catch (error) { next(error); }
};

exports.getWeekly = async (req, res, next) => {
  try {
    sendSuccess(res, { weekly: getMockStats().weeklyData });
  } catch (error) { next(error); }
};

exports.getPlatformBreakdown = async (req, res, next) => {
  try {
    const breakdown = await Application.aggregate([
      { $match: { userId: req.userId } },
      { $group: { _id: '$platform', count: { $sum: 1 }, avgScore: { $avg: '$matchScore' } } },
    ]).catch(() => []);
    const result = breakdown.length > 0 ? breakdown : getMockStats().platformBreakdown;
    sendSuccess(res, { breakdown: result });
  } catch (error) { next(error); }
};
