// AI Controller
const Profile = require('../models/Profile');
const { scoreJob, coverLetter, interviewPrep, analyzeSkillGap, chat } = require('../services/ai/aiService');
const { ok, fail } = require('../utils/index');

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return fail(res, 'Message required');
    const profile = await Profile.findOne({ userId: req.userId });
    const reply = await chat(message, {
      name: req.user?.name || 'User',
      currentRole: profile?.currentRole || '',
      skills: [...(profile?.skills?.technical || []), ...(profile?.skills?.tools || [])],
      totalApplications: profile?.totalApplications || 0,
      totalInterviews: profile?.totalInterviews || 0,
    });
    ok(res, { reply });
  } catch (e) { next(e); }
};

exports.generateCoverLetter = async (req, res, next) => {
  try {
    const { job } = req.body;
    if (!job?.title || !job?.company) return fail(res, 'Job title and company required');
    const profile = await Profile.findOne({ userId: req.userId });
    const letter = await coverLetter(job, {
      name: 'Candidate',
      currentRole: profile?.currentRole || '',
      yearsOfExperience: profile?.yearsOfExperience || 0,
      skills: profile?.skills || {},
      resumeText: profile?.resumeText || '',
    });
    ok(res, { coverLetter: letter });
  } catch (e) { next(e); }
};

exports.interviewPrep = async (req, res, next) => {
  try {
    const { job } = req.body;
    if (!job?.title) return fail(res, 'Job data required');
    const profile = await Profile.findOne({ userId: req.userId });
    const prep = await interviewPrep(job, { currentRole: profile?.currentRole || '', yearsOfExperience: profile?.yearsOfExperience || 0, skills: profile?.skills || {} });
    ok(res, { prep });
  } catch (e) { next(e); }
};

exports.skillGap = async (req, res, next) => {
  try {
    const { targetRole } = req.body;
    if (!targetRole?.trim()) return fail(res, 'Target role required');
    const profile = await Profile.findOne({ userId: req.userId });
    const analysis = await analyzeSkillGap(targetRole, { currentRole: profile?.currentRole || '', yearsOfExperience: profile?.yearsOfExperience || 0, skills: profile?.skills || {} });
    ok(res, { analysis });
  } catch (e) { next(e); }
};

module.exports = exports;
