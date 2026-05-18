const mongoose = require('mongoose');

const PlatformSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['linkedin', 'indeed', 'naukri', 'glassdoor', 'cutshort', 'angel'], required: true },
  isConnected: { type: Boolean, default: false },
  credentials: {
    email: String,
    passwordEncrypted: String,
    cookies: String,
    sessionToken: String,
  },
  profileUrl: String,
  profileName: String,
  profilePicture: String,
  lastSync: Date,
  applyCount: { type: Number, default: 0 },
  totalApplied: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 },
  status: { type: String, enum: ['active','paused','error','disconnected'], default: 'disconnected' },
  errorMessage: String,
  connectedAt: Date,
  dailyLimit: { type: Number, default: 30 },
}, { timestamps: true });

PlatformSchema.index({ userId: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('Platform', PlatformSchema);
