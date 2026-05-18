const cron = require('node-cron');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { startAutomation } = require('../services/automation/botEngine');

let initialized = false;

const startWorkers = () => {
  if (initialized) return;
  initialized = true;

  // Daily automation trigger at 9 AM IST (3:30 AM UTC)
  cron.schedule('30 3 * * 1-5', async () => {
    console.log('[Worker] Starting daily automation for all active users');
    try {
      const profiles = await Profile.find({
        'jobPreferences.dailyApplyCount': { $gt: 0 },
        'jobPreferences.activePlatforms': { $exists: true, $ne: [] },
      }).select('userId');

      for (const profile of profiles) {
        const user = await User.findById(profile.userId);
        if (user?.isActive) {
          await startAutomation(profile.userId);
        }
      }
    } catch (err) {
      console.error('[Worker] Daily automation error:', err.message);
    }
  });

  console.log('✅ Background workers initialized');
};

module.exports = { startWorkers };
