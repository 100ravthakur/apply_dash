const Platform = require('../models/Platform');
const { encrypt, decrypt } = require('../services/encryption/credentialEncryption');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const SUPPORTED_PLATFORMS = ['linkedin', 'indeed', 'naukri', 'glassdoor', 'cutshort', 'angel'];

exports.getPlatforms = async (req, res, next) => {
  try {
    const platforms = await Platform.find({ userId: req.userId });
    const result = SUPPORTED_PLATFORMS.map(p => {
      const existing = platforms.find(pl => pl.platform === p);
      return existing ? { ...existing.toJSON(), credentials: { email: existing.credentials?.email } } 
        : { platform: p, isConnected: false, status: 'disconnected', applyCount: 0, totalApplied: 0 };
    });
    sendSuccess(res, { platforms: result });
  } catch (error) { next(error); }
};

exports.connectPlatform = async (req, res, next) => {
  try {
    const { platform, email, password } = req.body;
    if (!SUPPORTED_PLATFORMS.includes(platform)) return sendError(res, 'Unsupported platform');
    if (!email || !password) return sendError(res, 'Email and password required');

    const passwordEncrypted = encrypt(password);
    const platformDoc = await Platform.findOneAndUpdate(
      { userId: req.userId, platform },
      {
        isConnected: true, status: 'active',
        credentials: { email, passwordEncrypted },
        connectedAt: new Date(), lastSync: new Date(),
        profileName: email.split('@')[0],
      },
      { upsert: true, new: true }
    );
    sendSuccess(res, { platform: { ...platformDoc.toJSON(), credentials: { email } } }, 'Platform connected');
  } catch (error) { next(error); }
};

exports.disconnectPlatform = async (req, res, next) => {
  try {
    await Platform.findOneAndUpdate(
      { userId: req.userId, platform: req.params.platform },
      { isConnected: false, status: 'disconnected', credentials: {} }
    );
    sendSuccess(res, {}, 'Platform disconnected');
  } catch (error) { next(error); }
};

exports.pausePlatform = async (req, res, next) => {
  try {
    const p = await Platform.findOneAndUpdate(
      { userId: req.userId, platform: req.params.platform },
      { status: 'paused' }, { new: true }
    );
    if (!p) return sendError(res, 'Platform not found', 404);
    sendSuccess(res, {}, 'Platform paused');
  } catch (error) { next(error); }
};

exports.resumePlatform = async (req, res, next) => {
  try {
    const p = await Platform.findOneAndUpdate(
      { userId: req.userId, platform: req.params.platform },
      { status: 'active' }, { new: true }
    );
    if (!p) return sendError(res, 'Platform not found', 404);
    sendSuccess(res, {}, 'Platform resumed');
  } catch (error) { next(error); }
};

exports.getPlatformStatus = async (req, res, next) => {
  try {
    const p = await Platform.findOne({ userId: req.userId, platform: req.params.platform });
    if (!p) return sendSuccess(res, { platform: req.params.platform, isConnected: false, status: 'disconnected' });
    sendSuccess(res, { platform: { ...p.toJSON(), credentials: { email: p.credentials?.email } } });
  } catch (error) { next(error); }
};
