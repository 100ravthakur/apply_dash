const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  platform: String,
  platformJobId: String,
  jobTitle: { type: String, required: true },
  company: { type: String, required: true },
  companyLogo: String,
  location: String,
  salary: String,
  jobDescription: String,
  matchScore: { type: Number, default: 0, min: 0, max: 100 },
  matchReason: String,
  strengths: [String],
  gaps: [String],
  status: {
    type: String,
    enum: ['queued','tailoring','applying','applied','viewed','shortlisted','rejected','interview','offered','accepted','failed'],
    default: 'queued',
  },
  appliedAt: Date,
  tailoredResume: String,
  coverLetter: String,
  customAnswers: [{ question: String, answer: String }],
  aiNotes: String,
  followUpSent: { type: Boolean, default: false },
  followUpDate: Date,
  interviewDate: Date,
  notes: String,
  isManual: { type: Boolean, default: false },
  errorLog: String,
}, { timestamps: true });

ApplicationSchema.index({ userId: 1, createdAt: -1 });
ApplicationSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
