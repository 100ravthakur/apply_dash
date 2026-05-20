const User = require('../models/User');
const Profile = require('../models/Profile');
const { signToken, signRefresh, verifyRefresh, ok, fail } = require('../utils/index');

const createProfile = async (userId) => {
  const exists = await Profile.findOne({ userId });
  if (!exists) await Profile.create({ userId, skills: { technical: [], soft: [], tools: [], languages: [] }, preferences: {} });
};

exports.register = async (req, res, next) => {
  try {
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

exports.googleAuth = async (req, res, next) => {
  try {
    const { googleId, email, name, avatar } = req.body;
    if (!googleId || !email) return fail(res, 'Google auth data required');

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({ name, email, googleId, avatar, password: `G_${googleId}_${Date.now()}`, isVerified: true });
      await createProfile(user._id);
    } else {
      await User.findByIdAndUpdate(user._id, { googleId, lastLogin: new Date() });
    }

    const token = signToken(user._id);
    const refreshToken = signRefresh(user._id);
    await User.findByIdAndUpdate(user._id, { $set: { refreshToken } });
    ok(res, { token, refreshToken, user: user.toJSON() }, 'Google login successful');
  } catch (e) { next(e); }
};

exports.githubAuth = async (req, res, next) => {
  try {
    const { githubId, email, name, avatar } = req.body;
    if (!githubId) return fail(res, 'GitHub ID required');

    const searchEmail = email || `${githubId}@github.local`;
    let user = await User.findOne({ $or: [{ githubId }, { email: searchEmail }] });
    if (!user) {
      user = await User.create({ name, email: searchEmail, githubId, avatar, password: `GH_${githubId}_${Date.now()}`, isVerified: true });
      await createProfile(user._id);
    } else {
      await User.findByIdAndUpdate(user._id, { githubId, lastLogin: new Date() });
    }

    const token = signToken(user._id);
    const refreshToken = signRefresh(user._id);
    await User.findByIdAndUpdate(user._id, { $set: { refreshToken } });
    ok(res, { token, refreshToken, user: user.toJSON() }, 'GitHub login successful');
  } catch (e) { next(e); }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return fail(res, 'User not found', 404);
    ok(res, { user });
  } catch (e) { next(e); }
};

exports.refresh = async (req, res, next) => {
  try {
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
