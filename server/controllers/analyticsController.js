const Application = require('../models/Application');
const { ok } = require('../utils/index');

exports.overview = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const uid = new mongoose.Types.ObjectId(req.userId);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, todayCount, byStatus, byPlatform, weeklyRaw] = await Promise.all([
      Application.countDocuments({ userId: req.userId }),
      Application.countDocuments({ userId: req.userId, createdAt: { $gte: today } }),
      Application.aggregate([{ $match: { userId: uid } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Application.aggregate([{ $match: { userId: uid } }, { $group: { _id: '$platform', count: { $sum: 1 } } }]),
      Application.aggregate([
        { $match: { userId: uid, createdAt: { $gte: weekAgo } } },
        { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
      ]),
    ]);

    const sm = {}; byStatus.forEach(s => { sm[s._id] = s.count; });
    const responded = (sm.shortlisted || 0) + (sm.interview || 0) + (sm.offered || 0) + (sm.viewed || 0);
    const responseRate = total > 0 ? ((responded / total) * 100).toFixed(1) : 0;

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weeklyData = days.map((day, i) => ({
      day, applied: weeklyRaw.find(w => w._id === i + 1)?.count || 0,
    }));

    ok(res, { overview: {
      totalApplications: total,
      appliedToday: todayCount,
      responseRate: parseFloat(responseRate),
      interviews: sm.interview || 0,
      offers: sm.offered || 0,
      shortlisted: sm.shortlisted || 0,
      rejected: sm.rejected || 0,
      weeklyData,
      platformBreakdown: byPlatform.map(p => ({ platform: p._id || 'manual', count: p.count })),
      skillsInDemand: [
        { skill:'System Design', demand:91 }, { skill:'Go / Golang', demand:87 },
        { skill:'AWS / GCP', demand:82 }, { skill:'Kubernetes', demand:74 },
        { skill:'PostgreSQL', demand:65 }, { skill:'TypeScript', demand:62 },
      ],
    }});
  } catch (e) { next(e); }
};

module.exports = exports;
