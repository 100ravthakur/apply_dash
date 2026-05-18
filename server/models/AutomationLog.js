const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: String,
  details: mongoose.Schema.Types.Mixed,
  level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
}, { timestamps: true });
module.exports = mongoose.model('AutomationLog', schema);
