const Profile = require('../models/Profile');
const { scoreJobAgainstProfile, generateCoverLetter, generateInterviewQuestions, analyzeSkillGap, chatWithAI } = require('../services/ai/claudeService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.matchJobs = async (req, res, next) => {
  try {
    const { jobs } = req.body;
    if (!jobs?.length) return sendError(res, 'Jobs array required');
    const profile = await Profile.findOne({ userId: req.userId });
    const results = await Promise.all(
      jobs.map(job => scoreJobAgainstProfile(job, {
        currentRole: profile?.currentRole || '',
        yearsOfExperience: profile?.yearsOfExperience || 0,
        skills: profile?.skills || {},
      }))
    );
    sendSuccess(res, { results });
  } catch (error) { next(error); }
};

exports.generateCoverLetter = async (req, res, next) => {
  try {
    const { job } = req.body;
    if (!job) return sendError(res, 'Job data required');
    const profile = await Profile.findOne({ userId: req.userId });
    const coverLetter = await generateCoverLetter(job, {
      name: req.user?.name || 'Candidate',
      currentRole: profile?.currentRole || '',
      yearsOfExperience: profile?.yearsOfExperience || 0,
      skills: profile?.skills || {},
      experience: profile?.experience || [],
    });
    sendSuccess(res, { coverLetter });
  } catch (error) { next(error); }
};

exports.interviewPrep = async (req, res, next) => {
  try {
    const { job } = req.body;
    if (!job) return sendError(res, 'Job data required');
    const profile = await Profile.findOne({ userId: req.userId });
    const prep = await generateInterviewQuestions(job, {
      currentRole: profile?.currentRole || '',
      yearsOfExperience: profile?.yearsOfExperience || 0,
      skills: profile?.skills || {},
    });
    sendSuccess(res, { prep });
  } catch (error) { next(error); }
};

exports.skillGap = async (req, res, next) => {
  try {
    const { targetRole } = req.body;
    if (!targetRole) return sendError(res, 'Target role required');
    const profile = await Profile.findOne({ userId: req.userId });
    const analysis = await analyzeSkillGap(targetRole, {
      currentRole: profile?.currentRole || '',
      yearsOfExperience: profile?.yearsOfExperience || 0,
      skills: profile?.skills || {},
    });
    sendSuccess(res, { analysis });
  } catch (error) { next(error); }
};

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return sendError(res, 'Message required');
    const profile = await Profile.findOne({ userId: req.userId });
    const context = {
      name: req.user?.name || 'Candidate',
      currentRole: profile?.currentRole || '',
      skills: [...(profile?.skills?.technical || []), ...(profile?.skills?.tools || [])],
      totalApplications: profile?.totalApplications || 0,
      totalInterviews: profile?.totalInterviews || 0,
    };
    const reply = await chatWithAI(message, context);
    sendSuccess(res, { reply });
  } catch (error) { next(error); }
};

exports.salaryInsight = async (req, res, next) => {
  try {
    const { role, location, experience } = req.body;
    sendSuccess(res, {
      insight: {
        role: role || 'Software Engineer',
        location: location || 'Bangalore',
        minSalary: 1200000, maxSalary: 3500000, avgSalary: 2200000,
        currency: 'INR',
        percentiles: { p25: 1500000, p50: 2200000, p75: 3000000 },
        tips: ['Companies in fintech pay 20-30% more for this role', 'Remote roles typically offer 10-15% premium'],
      },
    });
  } catch (error) { next(error); }
};
