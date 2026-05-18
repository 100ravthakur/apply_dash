const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  headline: { type: String, default: '' },
  summary: { type: String, default: '' },
  currentRole: { type: String, default: '' },
  currentCompany: { type: String, default: '' },
  yearsOfExperience: { type: Number, default: 0 },
  experience: [{
    company: String, role: String, startDate: Date, endDate: Date,
    isCurrent: Boolean, description: String, achievements: [String], location: String,
  }],
  education: [{
    institution: String, degree: String, field: String,
    startYear: Number, endYear: Number, grade: String,
  }],
  skills: {
    technical: [String], soft: [String], tools: [String], languages: [String],
  },
  certifications: [{
    name: String, issuer: String, date: Date, url: String,
  }],
  projects: [{
    name: String, description: String, tech: [String], url: String, github: String,
  }],
  socialLinks: {
    linkedin: String, github: String, portfolio: String, twitter: String,
  },
  resumeUrl: String,
  resumeText: String,
  atsScore: { type: Number, default: 0 },
  profileStrength: { type: Number, default: 0 },
  totalApplications: { type: Number, default: 0 },
  totalInterviews: { type: Number, default: 0 },
  // Job Preferences
  preferences: {
    targetRoles: [String],
    preferredLocations: [String],
    jobType: [String],
    experienceLevel: String,
    salaryMin: Number, salaryMax: Number, salaryCurrency: { type: String, default: 'INR' },
    targetCompanies: [String],
    blacklistedCompanies: [String],
    preferredIndustries: [String],
    activePlatforms: { type: [String], default: ['linkedin', 'indeed', 'naukri'] },
    dailyApplyCount: { type: Number, default: 30 },
    applyStartTime: { type: String, default: '09:00' },
    noticePeriod: String,
    openToRelocation: Boolean,
    keywords: [String],
    automationEnabled: { type: Boolean, default: false },
  },
}, { timestamps: true });

ProfileSchema.methods.calculateStrength = function() {
  let score = 0;
  if (this.headline) score += 10;
  if (this.summary) score += 10;
  if (this.currentRole) score += 5;
  if (this.experience?.length > 0) score += 20;
  if (this.education?.length > 0) score += 10;
  if (this.skills?.technical?.length > 3) score += 15;
  if (this.resumeUrl) score += 15;
  if (this.socialLinks?.linkedin) score += 10;
  if (this.projects?.length > 0) score += 5;
  this.profileStrength = Math.min(score, 100);
  return this.profileStrength;
};

module.exports = mongoose.model('Profile', ProfileSchema);
