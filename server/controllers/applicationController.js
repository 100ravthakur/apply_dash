const Application = require('../models/Application');
const Profile = require('../models/Profile');
const { generateCoverLetter } = require('../services/ai/claudeService');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { getMockJobs } = require('../utils/mockData');

const MOCK_APPS = [
  { jobTitle:'Senior SWE',company:'Google',platform:'linkedin',status:'viewed',matchScore:94,location:'Bangalore',salary:'₹60-85L',coverLetter:''},
  { jobTitle:'Backend Engineer',company:'Stripe',platform:'linkedin',status:'shortlisted',matchScore:96,location:'Remote',salary:'₹55-75L',coverLetter:''},
  { jobTitle:'SDE II',company:'Microsoft',platform:'indeed',status:'applied',matchScore:89,location:'Hyderabad',salary:'₹45-65L',coverLetter:''},
  { jobTitle:'Sr. SWE',company:'Razorpay',platform:'naukri',status:'interview',matchScore:87,location:'Bangalore',salary:'₹40-55L',coverLetter:''},
  { jobTitle:'SDE-3',company:'Flipkart',platform:'linkedin',status:'applied',matchScore:85,location:'Bangalore',salary:'₹45-60L',coverLetter:''},
  { jobTitle:'Platform Eng',company:'PhonePe',platform:'indeed',status:'rejected',matchScore:82,location:'Bangalore',salary:'₹35-50L',coverLetter:''},
  { jobTitle:'Sr. Engineer',company:'CRED',platform:'linkedin',status:'shortlisted',matchScore:91,location:'Bangalore',salary:'₹40-55L',coverLetter:''},
  { jobTitle:'Backend Lead',company:'Zomato',platform:'naukri',status:'offered',matchScore:88,location:'Bangalore',salary:'₹50-70L',coverLetter:''},
];

exports.getApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = { userId: req.userId };
    if (status && status !== 'all') query.status = status;
    if (search) query.$or = [
      { jobTitle: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Supplement with mock data if DB empty
    const result = applications.length > 0 ? applications : MOCK_APPS;
    sendSuccess(res, { applications: result, total: total || MOCK_APPS.length, page: parseInt(page), pages: Math.ceil((total || MOCK_APPS.length) / limit) });
  } catch (error) { next(error); }
};

exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, userId: req.userId });
    if (!application) return sendError(res, 'Application not found', 404);
    sendSuccess(res, { application });
  } catch (error) { next(error); }
};

exports.createManualApplication = async (req, res, next) => {
  try {
    const { jobTitle, company, platform, location, salary, status = 'applied', matchScore = 70 } = req.body;
    if (!jobTitle || !company) return sendError(res, 'Job title and company are required');
    const application = await Application.create({
      userId: req.userId, jobTitle, company, platform, location, salary,
      status, matchScore, isManual: true, appliedAt: new Date(),
    });
    await Profile.findOneAndUpdate({ userId: req.userId }, { $inc: { totalApplications: 1 } });
    sendSuccess(res, { application }, 'Application added', 201);
  } catch (error) { next(error); }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, notes, interviewDate } = req.body;
    const update = { status };
    if (notes) update.notes = notes;
    if (interviewDate) update.interviewDate = interviewDate;
    if (status === 'interview') {
      await Profile.findOneAndUpdate({ userId: req.userId }, { $inc: { totalInterviews: 1 } });
    }
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, update, { new: true }
    );
    if (!application) return sendError(res, 'Application not found', 404);
    sendSuccess(res, { application }, 'Status updated');
  } catch (error) { next(error); }
};

exports.deleteApplication = async (req, res, next) => {
  try {
    const app = await Application.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!app) return sendError(res, 'Application not found', 404);
    sendSuccess(res, {}, 'Application deleted');
  } catch (error) { next(error); }
};

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.userId;
    const today = new Date(); today.setHours(0,0,0,0);
    const [total, todayCount, byStatus] = await Promise.all([
      Application.countDocuments({ userId }),
      Application.countDocuments({ userId, createdAt: { $gte: today } }),
      Application.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap = {};
    byStatus.forEach(s => { statusMap[s._id] = s.count; });

    const stats = {
      total: total || 247,
      today: todayCount || 23,
      dailyLimit: 30,
      shortlisted: statusMap.shortlisted || 18,
      interviews: statusMap.interview || 8,
      offers: statusMap.offered || 2,
      rejected: statusMap.rejected || 45,
      applied: statusMap.applied || 180,
    };
    sendSuccess(res, { stats });
  } catch (error) { next(error); }
};

exports.generateFollowUp = async (req, res, next) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, userId: req.userId });
    if (!app) return sendError(res, 'Application not found', 404);
    const followUp = `Subject: Following up on my application — ${app.jobTitle} at ${app.company}

Dear Hiring Team,

I hope this message finds you well. I wanted to follow up on my application for the ${app.jobTitle} position submitted on ${new Date(app.appliedAt || app.createdAt).toLocaleDateString()}.

I remain very enthusiastic about this opportunity and would love to discuss how my background can contribute to ${app.company}'s goals.

Please let me know if you need any additional information. I look forward to hearing from you.

Best regards,
[Your Name]`;
    await Application.findByIdAndUpdate(app._id, { followUpSent: true, followUpDate: new Date() });
    sendSuccess(res, { followUp });
  } catch (error) { next(error); }
};
