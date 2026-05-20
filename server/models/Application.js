const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  platform: { type: String, default: 'manual' },
  externalId: String,
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  companyLogo: String,
  location: String,
  locationType: { type: String, enum: ['remote','hybrid','onsite'], default: 'onsite' },
  salary: String,
  jobDescription: String,
  applyUrl: String,
  skills: [String],
  matchScore: { type: Number, default: 0, min: 0, max: 100 },
  matchReason: String,
  strengths: [String],
  gaps: [String],
  status: {
    type: String,
    enum: ['queued','fetching','tailoring','applying','applied','viewed','shortlisted','interview','offered','accepted','rejected','failed'],
    default: 'queued', index: true,
  },
  appliedAt: Date,
  coverLetter: String,
  tailoredSummary: String,
  aiNotes: String,
  followUpSent: { type: Boolean, default: false },
  followUpDate: Date,
  interviewDate: Date,
  notes: String,
  isAutoApplied: { type: Boolean, default: false },
  isManual: { type: Boolean, default: false },
  errorLog: String,
}, { timestamps: true });

ApplicationSchema.index({ userId: 1, createdAt: -1 });
ApplicationSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
