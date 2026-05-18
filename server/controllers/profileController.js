const Profile = require('../models/Profile');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ userId: req.userId });
    if (!profile) {
      profile = await Profile.create({ userId: req.userId, skills: { technical:[], soft:[], tools:[], languages:[] }, preferences: {} });
    }
    const user = await User.findById(req.userId);
    sendSuccess(res, { profile, user });
  } catch (error) { next(error); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    delete updates.userId;
    let profile = await Profile.findOneAndUpdate(
      { userId: req.userId }, { ...updates }, { new: true, upsert: true, runValidators: true }
    );
    profile.calculateStrength();
    await profile.save();
    sendSuccess(res, { profile }, 'Profile updated');
  } catch (error) { next(error); }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { $set: { preferences: req.body } },
      { new: true, upsert: true }
    );
    sendSuccess(res, { preferences: profile.preferences }, 'Preferences updated');
  } catch (error) { next(error); }
};

exports.getPreferences = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    sendSuccess(res, { preferences: profile?.preferences || {} });
  } catch (error) { next(error); }
};

exports.addSkill = async (req, res, next) => {
  try {
    const { skill, category = 'technical' } = req.body;
    if (!skill) return sendError(res, 'Skill is required');
    const key = `skills.${category}`;
    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { $addToSet: { [key]: skill } },
      { new: true }
    );
    sendSuccess(res, { skills: profile.skills }, 'Skill added');
  } catch (error) { next(error); }
};

exports.removeSkill = async (req, res, next) => {
  try {
    const { skill, category = 'technical' } = req.params;
    const key = `skills.${category}`;
    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { $pull: { [key]: skill } },
      { new: true }
    );
    sendSuccess(res, { skills: profile.skills }, 'Skill removed');
  } catch (error) { next(error); }
};

exports.getProfileStrength = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) return sendError(res, 'Profile not found', 404);
    const score = profile.calculateStrength();
    const gaps = [];
    if (!profile.headline) gaps.push({ field: 'headline', message: 'Add a professional headline (+10 pts)' });
    if (!profile.summary) gaps.push({ field: 'summary', message: 'Write a summary (+10 pts)' });
    if (!profile.resumeUrl) gaps.push({ field: 'resume', message: 'Upload your resume (+15 pts)' });
    if ((profile.skills?.technical?.length || 0) < 3) gaps.push({ field: 'skills', message: 'Add at least 3 technical skills (+15 pts)' });
    if (!profile.socialLinks?.linkedin) gaps.push({ field: 'linkedin', message: 'Add LinkedIn profile URL (+10 pts)' });
    sendSuccess(res, { strength: score, gaps });
  } catch (error) { next(error); }
};
