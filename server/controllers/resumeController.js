const Profile = require('../models/Profile');
const User = require('../models/User');
const { extractText, parseWithAI } = require('../services/resume/resumeParser');
const { ok, fail } = require('../utils/index');

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) return fail(res, 'No file uploaded');
    const { buffer, mimetype, originalname, size } = req.file;

    if (size > 10 * 1024 * 1024) return fail(res, 'File must be under 10MB');

    // Extract text
    const text = await extractText(buffer, mimetype);
    if (!text || text.length < 50) return fail(res, 'Could not read resume content. Please upload a valid PDF or DOCX.');

    // AI parse
    const parsed = await parseWithAI(text);

    // Build profile update
    const upd = {
      resumeText: text,
      resumeFileName: originalname,
      resumeUploadedAt: new Date(),
      atsScore: parsed.atsScore || 65,
    };

    if (parsed.headline) upd.headline = parsed.headline;
    if (parsed.summary) upd.summary = parsed.summary;
    if (parsed.currentRole) upd.currentRole = parsed.currentRole;
    if (parsed.currentCompany) upd.currentCompany = parsed.currentCompany;
    if (parsed.yearsOfExperience) upd.yearsOfExperience = parsed.yearsOfExperience;
    if (parsed.skills?.technical?.length) upd.skills = parsed.skills;
    if (parsed.experience?.length) upd.experience = parsed.experience;
    if (parsed.education?.length) upd.education = parsed.education;
    if (parsed.socialLinks?.linkedin || parsed.socialLinks?.github) upd.socialLinks = parsed.socialLinks;

    // Update preferences from resume
    if (parsed.targetRoles?.length || parsed.preferredLocations?.length) {
      upd['preferences.targetRoles'] = parsed.targetRoles || [];
      if (parsed.preferredLocations?.length) upd['preferences.preferredLocations'] = parsed.preferredLocations;
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      { $set: upd },
      { new: true, upsert: true }
    );
    profile.calculateStrength();
    await profile.save();

    // Update user name if extracted
    if (parsed.name && parsed.name.trim().length > 2) {
      await User.findByIdAndUpdate(req.userId, { name: parsed.name.trim() });
    }

    ok(res, {
      profile,
      parsed: {
        name: parsed.name,
        email: parsed.email,
        skills: parsed.skills,
        experience: parsed.experience?.length || 0,
        education: parsed.education?.length || 0,
        atsScore: parsed.atsScore,
        targetRoles: parsed.targetRoles,
        keyStrengths: parsed.keyStrengths,
        profileStrength: profile.profileStrength,
      },
    }, 'Resume analyzed and profile updated! ✅');
  } catch (e) { next(e); }
};

exports.getInfo = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    ok(res, {
      hasResume: !!profile?.resumeText,
      fileName: profile?.resumeFileName,
      uploadedAt: profile?.resumeUploadedAt,
      atsScore: profile?.atsScore || 0,
      profileStrength: profile?.profileStrength || 0,
    });
  } catch (e) { next(e); }
};
