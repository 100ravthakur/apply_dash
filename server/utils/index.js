const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');

const cfg = () => require('./config/env');

// JWT
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'change_this_in_production_min32chars!', { expiresIn: '7d' });
const signRefresh = (id) => jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET || 'refresh_change_this_now_min32chars!', { expiresIn: '30d' });
const verifyRefresh = (token) => jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || 'refresh_change_this_now_min32chars!');

// Encryption
const getKey = () => {
  const k = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';
  const iv = process.env.ENCRYPTION_IV || '1234567890123456';
  return { key: CryptoJS.enc.Utf8.parse(k), iv: CryptoJS.enc.Utf8.parse(iv) };
};

const encrypt = (text) => {
  if (!text) return '';
  const { key, iv } = getKey();
  return CryptoJS.AES.encrypt(text, key, { iv, mode: CryptoJS.mode.CBC }).toString();
};

const decrypt = (cipher) => {
  if (!cipher) return '';
  try {
    const { key, iv } = getKey();
    return CryptoJS.AES.decrypt(cipher, key, { iv, mode: CryptoJS.mode.CBC }).toString(CryptoJS.enc.Utf8);
  } catch { return ''; }
};

// API helpers
const ok = (res, data = {}, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, ...data });

const fail = (res, message = 'Error', status = 400) =>
  res.status(status).json({ success: false, message });

module.exports = { signToken, signRefresh, verifyRefresh, encrypt, decrypt, ok, fail };
