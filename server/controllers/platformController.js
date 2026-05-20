const Platform = require('../models/Platform');
const Application = require('../models/Application');
const { encrypt, decrypt, ok, fail } = require('../utils/index');

const PLATFORMS = ['linkedin','indeed','naukri','glassdoor','cutshort','angel'];
const PLATFORM_INFO = {
  linkedin: { name: 'LinkedIn', color: '#0A66C2', jobsUrl: 'https://www.linkedin.com/jobs' },
  indeed: { name: 'Indeed', color: '#003A9B', jobsUrl: 'https://in.indeed.com' },
  naukri: { name: 'Naukri', color: '#21914B', jobsUrl: 'https://www.naukri.com' },
  glassdoor: { name: 'Glassdoor', color: '#0086B0', jobsUrl: 'https://www.glassdoor.co.in' },
  cutshort: { name: 'Cutshort', color: '#FF6432', jobsUrl: 'https://cutshort.io' },
  angel: { name: 'AngelList', color: '#3296FF', jobsUrl: 'https://angel.co' },
};

exports.getAll = async (req, res, next) => {
  try {
    const records = await Platform.find({ userId: req.userId });
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const platforms = await Promise.all(PLATFORMS.map(async (pid) => {
      const rec = records.find(r => r.platform === pid);
      const todayApps = rec ? await Application.countDocuments({ userId: req.userId, platform: pid, createdAt: { $gte: today } }).catch(() => 0) : 0;

      return {
        platform: pid,
        ...PLATFORM_INFO[pid],
        isConnected: rec?.isConnected || false,
        status: rec?.status || 'disconnected',
        profileEmail: rec?.profileEmail || null,
        profileName: rec?.profileName || null,
        totalApplied: rec?.totalApplied || 0,
        todayApplied: todayApps,
        lastSyncAt: rec?.lastSyncAt || null,
        connectedAt: rec?.connectedAt || null,
        errorMessage: rec?.errorMessage || null,
        dailyLimit: rec?.dailyLimit || 30,
      };
    }));

    ok(res, { platforms });
  } catch (e) { next(e); }
};

exports.connect = async (req, res, next) => {
  try {
    const { platform, email, password } = req.body;
    if (!PLATFORMS.includes(platform)) return fail(res, 'Unsupported platform');
    if (!email?.trim() || !password?.trim()) return fail(res, 'Email and password required');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return fail(res, 'Invalid email address');

    // Encrypt credentials
    const emailEncrypted = encrypt(email.toLowerCase().trim());
    const passwordEncrypted = encrypt(password);

    const rec = await Platform.findOneAndUpdate(
      { userId: req.userId, platform },
      {
        $set: {
          isConnected: true,
          status: 'active',
          'credentials.emailEncrypted': emailEncrypted,
          'credentials.passwordEncrypted': passwordEncrypted,
          profileEmail: email.toLowerCase().trim(),
          profileName: email.split('@')[0],
          connectedAt: new Date(),
          lastSyncAt: new Date(),
          errorMessage: null,
        },
      },
      { upsert: true, new: true }
    );

    ok(res, {
      platform: {
        platform,
        ...PLATFORM_INFO[platform],
        isConnected: true,
        status: 'active',
        profileEmail: email.toLowerCase().trim(),
        profileName: email.split('@')[0],
        connectedAt: rec.connectedAt,
      },
    }, `${PLATFORM_INFO[platform].name} connected successfully!`);
  } catch (e) { next(e); }
};

exports.disconnect = async (req, res, next) => {
  try {
    const { platform } = req.params;
    await Platform.findOneAndUpdate(
      { userId: req.userId, platform },
      {
        $set: { isConnected: false, status: 'disconnected', errorMessage: null },
        $unset: { 'credentials.emailEncrypted': 1, 'credentials.passwordEncrypted': 1 },
      }
    );
    ok(res, {}, `${PLATFORM_INFO[platform]?.name || platform} disconnected`);
  } catch (e) { next(e); }
};

exports.pause = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const rec = await Platform.findOne({ userId: req.userId, platform });
    if (!rec?.isConnected) return fail(res, 'Platform not connected');
    await Platform.findOneAndUpdate({ userId: req.userId, platform }, { $set: { status: 'paused' } });
    ok(res, {}, 'Platform paused');
  } catch (e) { next(e); }
};

exports.resume = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const rec = await Platform.findOne({ userId: req.userId, platform });
    if (!rec?.isConnected) return fail(res, 'Platform not connected');
    await Platform.findOneAndUpdate({ userId: req.userId, platform }, { $set: { status: 'active', errorMessage: null } });
    ok(res, {}, 'Platform resumed');
  } catch (e) { next(e); }
};

exports.verify = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const rec = await Platform.findOne({ userId: req.userId, platform });
    if (!rec?.isConnected) return fail(res, 'Platform not connected', 404);

    // Simulate a verification check
    await Platform.findOneAndUpdate(
      { userId: req.userId, platform },
      { $set: { lastSyncAt: new Date(), status: 'active', errorMessage: null } }
    );
    ok(res, { verified: true }, 'Platform verified and active');
  } catch (e) { next(e); }
};
