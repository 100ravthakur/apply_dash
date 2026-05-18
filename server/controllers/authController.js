const User = require('../models/User');
const Profile = require('../models/Profile');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwtHelper');
const { sendSuccess, sendError } = require('../utils/apiResponse');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, currentRole } = req.body;
    if (!name || !email || !password) return sendError(res, 'Name, email and password are required');
    if (password.length < 6) return sendError(res, 'Password must be at least 6 characters');

    const existing = await User.findOne({ email });
    if (existing) return sendError(res, 'Email already registered');

    const user = await User.create({ name, email, password });
    await Profile.create({
      userId: user._id,
      currentRole: currentRole || '',
      skills: { technical: [], soft: [], tools: [], languages: [] },
      preferences: { activePlatforms: ['linkedin', 'indeed', 'naukri'], dailyApplyCount: 30 },
    });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken, lastLogin: new Date() });

    sendSuccess(res, { token, refreshToken, user: user.toJSON() }, 'Account created successfully', 201);
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, 'Email and password are required');

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken, lastLogin: new Date() });

    sendSuccess(res, { token, refreshToken, user: user.toJSON() }, 'Login successful');
  } catch (error) { next(error); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return sendError(res, 'User not found', 404);
    sendSuccess(res, { user });
  } catch (error) { next(error); }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, 'Refresh token required', 401);
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) return sendError(res, 'Invalid refresh token', 401);
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });
    sendSuccess(res, { token: newToken, refreshToken: newRefreshToken }, 'Token refreshed');
  } catch (error) { sendError(res, 'Invalid or expired refresh token', 401); }
};

exports.logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.userId, { refreshToken: null });
    sendSuccess(res, {}, 'Logged out successfully');
  } catch (error) { next(error); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      return sendError(res, 'Current password is incorrect', 401);
    }
    user.password = newPassword;
    await user.save();
    sendSuccess(res, {}, 'Password changed successfully');
  } catch (error) { next(error); }
};
