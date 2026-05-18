const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  externalId: String,
  platform: { type: String, enum: ['linkedin', 'indeed', 'naukri', 'glassdoor', 'cutshort', 'angel', 'manual'] },
  title: { type: String, required: true },
  company: { type: String, required: true },
  companyLogo: String,
  location: String,
  locationType: { type: String, enum: ['remote', 'hybrid', 'onsite'], default: 'onsite' },
  salary: String, salaryMin: Number, salaryMax: Number,
  description: { type: String, default: '' },
  requirements: [String],
  skills: [String],
  experienceLevel: String,
  jobType: String,
  postedAt: Date,
  expiresAt: Date,
  applyUrl: String,
  isActive: { type: Boolean, default: true },
  industry: String,
  department: String,
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
