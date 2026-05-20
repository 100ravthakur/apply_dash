const Application = require('../models/Application');
const Profile = require('../models/Profile');
const { ok, fail } = require('../utils/index');

exports.getAll = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search, platform } = req.query;
    const query = { userId: req.userId };
    if (status && status !== 'all') query.status = status;
    if (platform && platform !== 'all') query.platform = platform;
    if (search?.trim()) {
      query.$or = [
        { jobTitle: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }
    const [applications, total] = await Promise.all([
      Application.find(query).sort({ createdAt: -1 }).skip((page - 1) * parseInt(limit)).limit(parseInt(limit)),
      Application.countDocuments(query),
    ]);
    ok(res, { applications, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (e) { next(e); }
};

exports.getById = async (req, res, next) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, userId: req.userId });
    if (!app) return fail(res, 'Application not found', 404);
    ok(res, { application: app });
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const { jobTitle, company, platform, location, salary, status = 'applied', matchScore = 70, notes } = req.body;
    if (!jobTitle?.trim() || !company?.trim()) return fail(res, 'Job title and company required');
    const app = await Application.create({
      userId: req.userId, jobTitle: jobTitle.trim(), company: company.trim(),
      platform, location, salary, status, matchScore, notes, isManual: true,
      appliedAt: status === 'applied' ? new Date() : undefined,
    });
    await Profile.findOneAndUpdate({ userId: req.userId }, { $inc: { totalApplications: 1 } });
    ok(res, { application: app }, 'Application added', 201);
  } catch (e) { next(e); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, notes, interviewDate } = req.body;
    const update = {};
    if (status) update.status = status;
    if (notes) update.notes = notes;
    if (interviewDate) update.interviewDate = new Date(interviewDate);
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, { $set: update }, { new: true }
    );
    if (!app) return fail(res, 'Application not found', 404);
    if (status === 'interview') await Profile.findOneAndUpdate({ userId: req.userId }, { $inc: { totalInterviews: 1 } });
    ok(res, { application: app }, 'Updated');
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const app = await Application.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!app) return fail(res, 'Application not found', 404);
    ok(res, {}, 'Deleted');
  } catch (e) { next(e); }
};

exports.getStats = async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const uid = mongoose.Types.ObjectId.isValid(req.userId)
      ? new mongoose.Types.ObjectId(req.userId) : null;
    if (!uid) return ok(res, { stats: { total: 0, today: 0, shortlisted: 0, interviews: 0, offers: 0, rejected: 0 } });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [total, todayCount, byStatus] = await Promise.all([
      Application.countDocuments({ userId: req.userId }),
      Application.countDocuments({ userId: req.userId, createdAt: { $gte: today } }),
      Application.aggregate([
        { $match: { userId: uid } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);
    const sm = {};
    byStatus.forEach(s => { sm[s._id] = s.count; });
    ok(res, { stats: { total, today: todayCount, dailyLimit: 30, shortlisted: sm.shortlisted || 0, interviews: sm.interview || 0, offers: sm.offered || 0, rejected: sm.rejected || 0, applied: sm.applied || 0, viewed: sm.viewed || 0 } });
  } catch (e) { next(e); }
};

exports.followUp = async (req, res, next) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, userId: req.userId });
    if (!app) return fail(res, 'Application not found', 404);
    const text = `Subject: Follow-up — ${app.jobTitle} at ${app.company}

Dear Hiring Team,

I hope this finds you well. I'm writing to follow up on my application for the ${app.jobTitle} position, submitted on ${new Date(app.appliedAt || app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.

I remain very excited about this opportunity and the work ${app.company} is doing. Please let me know if you need any additional information or if there's a good time to connect.

Looking forward to hearing from you.

Best regards`;
    await Application.findByIdAndUpdate(app._id, { $set: { followUpSent: true, followUpDate: new Date() } });
    ok(res, { followUp: text });
  } catch (e) { next(e); }
};
