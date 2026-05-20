const mongoose = require('mongoose');

const PlatformSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['linkedin','indeed','naukri','glassdoor','cutshort','angel'], required: true },
  isConnected: { type: Boolean, default: false },
  status: { type: String, enum: ['active','paused','error','disconnected','verifying'], default: 'disconnected' },
  credentials: {
    emailEncrypted: String,
    passwordEncrypted: String,
  },
  profileUrl: String,
  profileName: String,
  profileEmail: String,
  totalApplied: { type: Number, default: 0 },
  todayApplied: { type: Number, default: 0 },
  lastAppliedAt: Date,
  lastSyncAt: Date,
  connectedAt: Date,
  errorMessage: String,
  dailyLimit: { type: Number, default: 30 },
  successRate: { type: Number, default: 0 },
}, { timestamps: true });

PlatformSchema.index({ userId: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('Platform', PlatformSchema);
