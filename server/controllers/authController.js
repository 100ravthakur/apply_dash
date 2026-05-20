const User = require('../models/User');
const Profile = require('../models/Profile');
const { signToken, signRefresh, verifyRefresh, ok, fail } = require('../utils/index');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');

const createProfile = async (userId) => {
  const exists = await Profile.findOne({ userId });
  if (!exists) await Profile.create({ userId, skills: { technical: [], soft: [], tools: [], languages: [] }, preferences: {} });
};

// Helper: check if MongoDB is actually connected
const isDbConnected = () => mongoose.connection.readyState === 1;

exports.register = async (req, res, next) => {
  try {
    if (!isDbConnected()) return fail(res, 'Database not connected. Please configure MONGODB_URI in your .env file.', 503);

    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return fail(res, 'Name, email and password required');
    if (password.length < 6) return fail(res, 'Password must be at least 6 characters');
    if (await User.findOne({ email })) return fail(res, 'Email already registered');

    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
    await createProfile(user._id);

    const token = signToken(user._id);
    const refreshToken = signRefresh(user._id);
    await User.findByIdAndUpdate(user._id, { $set: { refreshToken, lastLogin: new Date() } });

    ok(res, { token, refreshToken, user: user.toJSON() }, 'Account created', 201);
  } catch (e) { next(e); }
};

exports.login = async (req, res, next) => {
  try {
    if (!isDbConnected()) return fail(res, 'Database not connected. Please configure MONGODB_URI in your .env file.', 503);

    const { email, password } = req.body;
    if (!email || !password) return fail(res, 'Email and password required');

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) return fail(res, 'Invalid email or password', 401);

    const token = signToken(user._id);
    const refreshToken = signRefresh(user._id);
    await User.findByIdAndUpdate(user._id, { $set: { refreshToken, lastLogin: new Date() } });

    ok(res, { token, refreshToken, user: user.toJSON() }, 'Login successful');
  } catch (e) { next(e); }
};

// ─── Google OAuth: verify ID token server-side ───────────────
exports.googleAuth = async (req, res, next) => {
  try {
    if (!isDbConnected()) return fail(res, 'Database not connected', 503);

    const { credential } = req.body;
    if (!credential) return fail(res, 'Google credential token required');

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return fail(res, 'Google OAuth not configured on server', 501);

    // Verify the Google ID token
    const client = new OAuth2Client(clientId);
    let ticket;
    try {
      ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    } catch (err) {
      return fail(res, 'Invalid Google token', 401);
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture: avatar } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId,
        avatar: avatar || '',
        password: `G_${googleId}_${Date.now()}`,
        isVerified: true,
      });
      await createProfile(user._id);
    } else if (!user.googleId) {
      // Link Google to existing email account
      await User.findByIdAndUpdate(user._id, { googleId, isVerified: true, lastLogin: new Date() });
    } else {
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    }

    const token = signToken(user._id);
    const refreshToken = signRefresh(user._id);
    await User.findByIdAndUpdate(user._id, { $set: { refreshToken } });
    ok(res, { token, refreshToken, user: user.toJSON() }, 'Google login successful');
  } catch (e) { next(e); }
};

// ─── GitHub OAuth: exchange code for access token, then fetch user ───
exports.githubAuth = async (req, res, next) => {
  try {
    if (!isDbConnected()) return fail(res, 'Database not connected', 503);

    const { code } = req.body;
    if (!code) return fail(res, 'GitHub authorization code required');

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    if (!clientId || !clientSecret) return fail(res, 'GitHub OAuth not configured on server', 501);

    // Exchange code for access token
    let tokenRes;
    try {
      tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }, { headers: { Accept: 'application/json' } });
    } catch (err) {
      return fail(res, 'Failed to exchange GitHub code', 502);
    }

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) return fail(res, tokenRes.data.error_description || 'GitHub auth failed', 401);

    // Fetch GitHub user profile
    const [ghUser, ghEmails] = await Promise.all([
      axios.get('https://api.github.com/user', { headers: { Authorization: `Bearer ${accessToken}` } }),
      axios.get('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => ({ data: [] })),
    ]);

    const githubId = String(ghUser.data.id);
    const name = ghUser.data.name || ghUser.data.login;
    const avatar = ghUser.data.avatar_url || '';
    // Pick primary verified email, fallback to any email, fallback to placeholder
    const primaryEmail = ghEmails.data?.find?.(e => e.primary && e.verified);
    const anyEmail = ghEmails.data?.find?.(e => e.verified);
    const email = primaryEmail?.email || anyEmail?.email || `${githubId}@github.local`;

    let user = await User.findOne({ $or: [{ githubId }, { email }] });
    if (!user) {
      user = await User.create({
        name,
        email,
        githubId,
        avatar,
        password: `GH_${githubId}_${Date.now()}`,
        isVerified: true,
      });
      await createProfile(user._id);
    } else if (!user.githubId) {
      await User.findByIdAndUpdate(user._id, { githubId, isVerified: true, lastLogin: new Date() });
    } else {
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    }

    const token = signToken(user._id);
    const refreshToken = signRefresh(user._id);
    await User.findByIdAndUpdate(user._id, { $set: { refreshToken } });
    ok(res, { token, refreshToken, user: user.toJSON() }, 'GitHub login successful');
  } catch (e) { next(e); }
};

exports.me = async (req, res, next) => {
  try {
    if (!isDbConnected()) return fail(res, 'Database not connected', 503);
    const user = await User.findById(req.userId);
    if (!user) return fail(res, 'User not found', 404);
    ok(res, { user });
  } catch (e) { next(e); }
};

exports.refresh = async (req, res, next) => {
  try {
    if (!isDbConnected()) return fail(res, 'Database not connected', 503);
    const { refreshToken } = req.body;
    if (!refreshToken) return fail(res, 'Refresh token required', 401);
    const decoded = verifyRefresh(refreshToken);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken) return fail(res, 'Invalid refresh token', 401);
    const token = signToken(user._id);
    const newRefresh = signRefresh(user._id);
    await User.findByIdAndUpdate(user._id, { $set: { refreshToken: newRefresh } });
    ok(res, { token, refreshToken: newRefresh });
  } catch { fail(res, 'Invalid refresh token', 401); }
};

exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.userId, { $unset: { refreshToken: 1 } });
    ok(res, {}, 'Logged out');
  } catch (e) { next(e); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return fail(res, 'Both passwords required');
    if (newPassword.length < 6) return fail(res, 'New password must be 6+ chars');
    const user = await User.findById(req.userId).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) return fail(res, 'Current password incorrect', 401);
    user.password = newPassword;
    await user.save();
    ok(res, {}, 'Password changed');
  } catch (e) { next(e); }
};
