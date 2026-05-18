const Application = require('../models/Application');
const Profile = require('../models/Profile');
const { getMockJobs } = require('../utils/mockData');
const { scoreJobAgainstProfile } = require('../services/ai/claudeService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getJobQueue = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    const jobs = getMockJobs(50);
    
    const scoredJobs = await Promise.all(
      jobs.slice(0, 15).map(async (job) => {
        try {
          const match = await scoreJobAgainstProfile(job, {
            currentRole: profile?.currentRole || '',
            yearsOfExperience: profile?.yearsOfExperience || 0,
            skills: profile?.skills || {},
          });
          return { ...job, matchScore: match.score, matchReason: match.reason, strengths: match.strengths, gaps: match.gaps };
        } catch {
          return { ...job, matchScore: Math.floor(60 + Math.random() * 35), matchReason: 'Good match', strengths: [], gaps: [] };
        }
      })
    );

    const sorted = scoredJobs
      .filter(j => j.matchScore >= 55)
      .sort((a, b) => b.matchScore - a.matchScore);

    sendSuccess(res, { jobs: sorted, total: sorted.length });
  } catch (error) { next(error); }
};

exports.getAllJobs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, platform, minScore, location } = req.query;
    let jobs = getMockJobs(60);
    if (platform) jobs = jobs.filter(j => j.platform === platform);
    if (location) jobs = jobs.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
    const start = (page - 1) * limit;
    const paginated = jobs.slice(start, start + parseInt(limit));
    sendSuccess(res, { jobs: paginated, total: jobs.length, page: parseInt(page), pages: Math.ceil(jobs.length / limit) });
  } catch (error) { next(error); }
};

exports.getJobById = async (req, res, next) => {
  try {
    const jobs = getMockJobs(60);
    const job = jobs.find(j => j._id === req.params.id) || jobs[0];
    if (!job) return sendError(res, 'Job not found', 404);
    sendSuccess(res, { job });
  } catch (error) { next(error); }
};

exports.getTrendingJobs = async (req, res, next) => {
  try {
    const jobs = getMockJobs(10);
    sendSuccess(res, { jobs });
  } catch (error) { next(error); }
};
