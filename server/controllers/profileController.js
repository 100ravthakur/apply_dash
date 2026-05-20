const Profile = require('../models/Profile');
const User = require('../models/User');
const { ok, fail } = require('../utils/index');

exports.getProfile = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ userId: req.userId });
    if (!profile) profile = await Profile.create({ userId: req.userId, skills: { technical: [], soft: [], tools: [], languages: [] }, preferences: {} });
    const user = await User.findById(req.userId);
    ok(res, { profile, user });
  } catch (e) { next(e); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    delete updates.userId; delete updates._id;
    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );
    profile.calculateStrength();
    await profile.save();
    ok(res, { profile }, 'Profile updated');
  } catch (e) { next(e); }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { $set: { preferences: req.body } },
      { new: true, upsert: true }
    );
    ok(res, { preferences: profile.preferences }, 'Preferences saved');
  } catch (e) { next(e); }
};

exports.getStrength = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) return ok(res, { strength: 0, gaps: [] });
    const score = profile.calculateStrength();
    const gaps = [];
    if (!profile.headline) gaps.push({ field: 'headline', label: 'Add professional headline', points: 10 });
    if (!profile.summary) gaps.push({ field: 'summary', label: 'Write a summary', points: 10 });
    if (!profile.resumeText) gaps.push({ field: 'resume', label: 'Upload your resume', points: 15 });
    if ((profile.skills?.technical?.length || 0) < 3) gaps.push({ field: 'skills', label: 'Add 3+ technical skills', points: 15 });
    if (!profile.socialLinks?.linkedin) gaps.push({ field: 'linkedin', label: 'Add LinkedIn URL', points: 10 });
    ok(res, { strength: score, gaps });
  } catch (e) { next(e); }
};

exports.addSkill = async (req, res, next) => {
  try {
    const { skill, category = 'technical' } = req.body;
    if (!skill?.trim()) return fail(res, 'Skill required');
    const valid = ['technical', 'soft', 'tools', 'languages'];
    if (!valid.includes(category)) return fail(res, 'Invalid category');
    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { $addToSet: { [`skills.${category}`]: skill.trim() } },
      { new: true }
    );
    ok(res, { skills: profile.skills }, 'Skill added');
  } catch (e) { next(e); }
};

exports.removeSkill = async (req, res, next) => {
  try {
    const { skill, category = 'technical' } = req.params;
    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { $pull: { [`skills.${category}`]: skill } },
      { new: true }
    );
    ok(res, { skills: profile?.skills }, 'Skill removed');
  } catch (e) { next(e); }
};
